const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { sendEmail, templates } = require('../lib/email');
const { wa } = require('../lib/whatsapp');
const { notifyAdmins } = require('../lib/notifications');
const {
  normalizeEmail,
  normalizePhone,
  recordLoginAttempt,
  checkLoginBruteForce,
  clearLoginAttempts,
  checkRegistrationRate,
  recordRegistrationAttempt,
} = require('../lib/authSecurity');

const APP_URL           = process.env.CLIENT_URL || 'http://localhost:3000';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashToken          = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const { password: _, ...safeUser } = user;
  res.status(statusCode).json({ success: true, token, user: fmt(safeUser) });
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Human-readable "X minutes Y seconds" from milliseconds */
function formatMs(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const min      = Math.floor(totalSec / 60);
  const sec      = totalSec % 60;
  if (min > 0 && sec > 0) return `${min}m ${sec}s`;
  if (min > 0)             return `${min} minute${min > 1 ? 's' : ''}`;
  return `${sec} second${sec !== 1 ? 's' : ''}`;
}

// ─── Register ────────────────────────────────────────────────────────────────

exports.register = async (req, res, next) => {
  try {
    // ── Registration rate limit (per IP) ──
    const rateCheck = await checkRegistrationRate(req);
    if (rateCheck.limited) {
      return res.status(429).json({
        success: false,
        message: `Too many registration attempts. Try again in ${formatMs(rateCheck.remainingMs)}.`,
        code:    'RATE_LIMITED',
      });
    }

    const {
      name, email: rawEmail, password,
      company, phone: rawPhone,
    } = req.body;

    const email = normalizeEmail(rawEmail);
    const phone = normalizePhone(rawPhone);  // null if not provided or invalid

    // ── Check phone validity if provided ──
    if (rawPhone && rawPhone.trim() && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is invalid. Please use international format (e.g. +1234567890).',
        field:   'phone',
        code:    'INVALID_PHONE',
      });
    }

    // ── Check for existing email (case-insensitive) ──
    const emailExists = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, isActive: true },
    });
    if (emailExists) {
      await recordRegistrationAttempt(req);
      if (!emailExists.isActive) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email exists but has been deactivated. Contact support to recover it.',
          field:   'email',
          code:    'ACCOUNT_DEACTIVATED',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'This email is already registered. Sign in instead, or use a different email.',
        field:   'email',
        code:    'EMAIL_TAKEN',
      });
    }

    // ── Check for existing phone ──
    if (phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, isActive: true },
      });
      if (phoneExists) {
        await recordRegistrationAttempt(req);
        return res.status(400).json({
          success: false,
          message: 'This phone number is already linked to an account.',
          field:   'phone',
          code:    'PHONE_TAKEN',
        });
      }
    }

    const hashed = await bcrypt.hash(password, 12);

    // ── Atomic create — unique constraints catch any race condition ──
    let user;
    try {
      user = await prisma.user.create({
        data: {
          name:    String(name).trim(),
          email,                                  // already normalised
          password: hashed,
          company:  company ? String(company).trim() : '',
          phone:    phone || null,
        },
      });
    } catch (err) {
      // P2002 = Prisma unique constraint violation
      if (err.code === 'P2002') {
        await recordRegistrationAttempt(req);
        const field = err.meta?.target?.includes('phone') ? 'phone' : 'email';
        return res.status(409).json({
          success: false,
          message: field === 'phone'
            ? 'This phone number is already linked to an account.'
            : 'This email is already registered. Sign in instead.',
          field,
          code: field === 'phone' ? 'PHONE_TAKEN' : 'EMAIL_TAKEN',
        });
      }
      throw err;
    }

    // Welcome email + WhatsApp
    await sendEmail({ to: user.email, ...templates.welcome({ user }) }).catch(() => {});
    wa.welcome({ user }).catch(() => {});

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

exports.login = async (req, res, next) => {
  try {
    const { email: rawEmail, password } = req.body;

    if (!rawEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const email = normalizeEmail(rawEmail);

    // ── Brute-force gate ──
    const bruteCheck = await checkLoginBruteForce(email);
    if (bruteCheck.locked) {
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked after too many failed attempts. Try again in ${formatMs(bruteCheck.remainingMs)}.`,
        code:    'ACCOUNT_LOCKED',
        remainingMs: bruteCheck.remainingMs,
      });
    }

    // ── Lookup (case-insensitive) ──
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    const credentialsValid = user && await bcrypt.compare(password, user.password);

    if (!credentialsValid) {
      await recordLoginAttempt(email, req, false);

      // Re-check how many attempts remain after recording
      const afterCheck = await checkLoginBruteForce(email);
      if (afterCheck.locked) {
        return res.status(429).json({
          success: false,
          message: `Too many failed attempts. Account locked for ${formatMs(afterCheck.remainingMs)}.`,
          code:    'ACCOUNT_LOCKED',
          remainingMs: afterCheck.remainingMs,
        });
      }

      const attemptsLeft = afterCheck.attemptsLeft;
      const warn = attemptsLeft <= 2
        ? ` ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} left before temporary lockout.`
        : '';

      return res.status(401).json({
        success: false,
        message: `Invalid email or password.${warn}`,
        code:    'INVALID_CREDENTIALS',
        attemptsLeft,
      });
    }

    // ── Deactivated account ──
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support at contact@mbndev.ma.',
        code:    'ACCOUNT_DEACTIVATED',
      });
    }

    // ── Success — clear failed attempts ──
    await recordLoginAttempt(email, req, true);
    clearLoginAttempts(email).catch(() => {}); // fire-and-forget cleanup

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// ─── Real-time availability checks ───────────────────────────────────────────

exports.checkEmail = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    if (!email) {
      return res.status(400).json({ success: false, available: false, message: 'Email is required.' });
    }

    const exists = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, isActive: true },
    });

    if (!exists) {
      return res.json({ success: true, available: true });
    }

    if (!exists.isActive) {
      return res.json({
        success:   true,
        available: false,
        code:      'ACCOUNT_DEACTIVATED',
        message:   'This email is linked to a deactivated account. Contact support.',
      });
    }

    return res.json({
      success:   true,
      available: false,
      code:      'EMAIL_TAKEN',
      message:   'This email is already registered.',
    });
  } catch (err) {
    next(err);
  }
};

exports.checkPhone = async (req, res, next) => {
  try {
    const rawPhone = req.body.phone || '';
    const phone    = normalizePhone(rawPhone);

    if (!rawPhone.trim()) {
      return res.json({ success: true, available: true, valid: false });
    }

    if (!phone) {
      return res.json({
        success:   true,
        available: false,
        valid:     false,
        message:   'Invalid phone number format.',
      });
    }

    const exists = await prisma.user.findUnique({
      where: { phone },
      select: { id: true },
    });

    return res.json({
      success:   true,
      available: !exists,
      valid:     true,
      ...(exists ? { code: 'PHONE_TAKEN', message: 'This phone number is already linked to an account.' } : {}),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get me ───────────────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  res.json({ success: true, user: fmt(req.user) });
};

// ─── Password reset ───────────────────────────────────────────────────────────

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email || '');
    if (!email) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (user && user.isActive) {
      // Invalidate existing unused tokens
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data:  { usedAt: new Date() },
      });

      const rawToken = crypto.randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId:    user.id,
          tokenHash: hashToken(rawToken),
          expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
        },
      });

      const resetUrl = `${APP_URL}/reset-password/${rawToken}`;
      await sendEmail({
        to: user.email,
        ...templates.passwordReset({ user, resetUrl }),
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: 'If an account exists for that email, a reset link is on its way.',
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const tokenHash = hashToken(String(token));
    const record = await prisma.passwordResetToken.findUnique({
      where:   { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired.' });
    }
    if (!record.user.isActive) {
      return res.status(400).json({ success: false, message: 'Account is deactivated.' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data:  { password: hashed, passwordChangedAt: new Date() },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data:  { usedAt: new Date() },
      }),
      prisma.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null, id: { not: record.id } },
        data:  { usedAt: new Date() },
      }),
    ]);

    // Clear any login lockout after password reset
    clearLoginAttempts(record.user.email).catch(() => {});

    return res.json({ success: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    next(err);
  }
};

// ─── Update profile ───────────────────────────────────────────────────────────

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, company, phone: rawPhone, currentPassword, newPassword } = req.body;

    // ── Password change ──
    if (currentPassword && newPassword) {
      const full = await prisma.user.findUnique({ where: { id: req.user.id } });
      const valid = await bcrypt.compare(currentPassword, full.password);
      if (!valid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: req.user.id },
        data:  { password: hashed, passwordChangedAt: new Date() },
      });
      return res.json({ success: true, message: 'Password updated successfully.' });
    }

    // ── Profile update ──
    const updateData = {};
    if (name    !== undefined) updateData.name    = String(name).trim();
    if (company !== undefined) updateData.company = String(company).trim();

    if (rawPhone !== undefined) {
      if (rawPhone === '' || rawPhone === null) {
        updateData.phone = null;
      } else {
        const phone = normalizePhone(rawPhone);
        if (!phone) {
          return res.status(400).json({
            success: false,
            message: 'Invalid phone number format.',
            field:   'phone',
          });
        }
        // Check uniqueness (exclude self)
        const conflict = await prisma.user.findFirst({
          where: { phone, id: { not: req.user.id } },
          select: { id: true },
        });
        if (conflict) {
          return res.status(400).json({
            success: false,
            message: 'This phone number is already linked to another account.',
            field:   'phone',
            code:    'PHONE_TAKEN',
          });
        }
        updateData.phone = phone;
      }
    }

    let user;
    try {
      user = await prisma.user.update({
        where:  { id: req.user.id },
        data:   updateData,
        select: {
          id: true, name: true, email: true, role: true, plan: true,
          avatar: true, company: true, phone: true, isActive: true,
        },
      });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already linked to another account.',
          field:   'phone',
          code:    'PHONE_TAKEN',
        });
      }
      throw err;
    }

    res.json({ success: true, user: fmt(user) });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const full = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(password, full.password);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Incorrect password.' });
    }

    if (full.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted.' });
    }

    // Don't delete immediately — mark as pending admin approval
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { deletionRequestedAt: new Date() },
    });

    // Notify all admins
    notifyAdmins({
      type:    'account_deletion_request',
      title:   'Account Deletion Request',
      message: `${full.name} (${full.email}) has requested to delete their account.`,
      link:    '/dashboard/admin/clients',
    }).catch(() => {});

    res.json({
      success: true,
      pending: true,
      message: 'Your deletion request has been submitted. An admin will review and confirm it shortly.',
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelDeletionRequest = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data:  { deletionRequestedAt: null },
    });
    res.json({ success: true, message: 'Deletion request cancelled.' });
  } catch (err) {
    next(err);
  }
};
