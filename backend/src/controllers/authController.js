const jwt    = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');
const { sendEmail, templates } = require('../lib/email');

const APP_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const { password: _, ...safeUser } = user;
  res.status(statusCode).json({
    success: true,
    token,
    user: fmt(safeUser),
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, company } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, company: company || '' },
    });

    // Welcome email — fire-and-forget
    sendEmail({ to: user.email, ...templates.welcome({ user }) }).catch(() => {});

    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: fmt(req.user) });
};

// ─── Password reset flow ────────────────────────────────────────────────────
// Two-step: client posts email → we email a one-time token (hashed in DB).
// Then client posts (token, newPassword) and we update.
//
// Security:
//   - Always respond 200 to /forgot-password to prevent email-enumeration.
//   - Token is 32 random bytes (256-bit), hashed (sha256) at rest.
//   - 1-hour expiry, single-use (usedAt gate).

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!email) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always behave the same regardless of whether the user exists
    if (user && user.isActive) {
      // Invalidate any existing unused tokens for this user
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
      sendEmail({
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
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const tokenHash = hashToken(String(token));
    const record = await prisma.passwordResetToken.findUnique({
      where:  { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Reset link is invalid or has expired' });
    }

    if (!record.user.isActive) {
      return res.status(400).json({ success: false, message: 'Account is deactivated' });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data:  { password: hashed },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data:  { usedAt: new Date() },
      }),
      // Invalidate all other unused tokens for this user
      prisma.passwordResetToken.updateMany({
        where: { userId: record.userId, usedAt: null, id: { not: record.id } },
        data:  { usedAt: new Date() },
      }),
    ]);

    return res.json({ success: true, message: 'Password updated. You can sign in now.' });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, company, phone, currentPassword, newPassword } = req.body;

    // ── Password change flow ──────────────────────────────────────────────
    if (currentPassword && newPassword) {
      const full = await prisma.user.findUnique({ where: { id: req.user.id } });
      const valid = await bcrypt.compare(currentPassword, full.password);
      if (!valid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      const hashed = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
      return res.json({ success: true, message: 'Password updated successfully' });
    }

    // ── Profile update flow ───────────────────────────────────────────────
    const updateData = {};
    if (name    !== undefined) updateData.name    = name;
    if (company !== undefined) updateData.company = company;
    if (phone   !== undefined) updateData.phone   = phone;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data:  updateData,
      select: {
        id: true, name: true, email: true, role: true, plan: true,
        avatar: true, company: true, phone: true, isActive: true,
      },
    });
    res.json({ success: true, user: fmt(user) });
  } catch (err) {
    next(err);
  }
};
