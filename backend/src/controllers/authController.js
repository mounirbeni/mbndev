const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { fmt } = require('../lib/format');

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
        id: true, name: true, email: true, role: true,
        avatar: true, company: true, phone: true, isActive: true,
      },
    });
    res.json({ success: true, user: fmt(user) });
  } catch (err) {
    next(err);
  }
};
