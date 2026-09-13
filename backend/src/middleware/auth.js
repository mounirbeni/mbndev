const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

/**
 * Verify a raw JWT string and resolve it to an active user, or null.
 * Shared by protect() (header-only) and protectViaHeaderOrQueryToken()
 * (header OR ?token= query param, for the few endpoints a browser can't
 * attach an Authorization header to — SSE, authenticated file links).
 */
async function verifyUserFromToken(token) {
  if (!token) return null;

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true, name: true, email: true, role: true, plan: true,
      avatar: true, company: true, phone: true,
      isActive: true, passwordChangedAt: true, createdAt: true, updatedAt: true,
    },
  });

  if (!user || !user.isActive) return null;

  // Invalidate tokens issued before the last password change
  if (user.passwordChangedAt) {
    const changedAtSec = Math.floor(user.passwordChangedAt.getTime() / 1000);
    if (decoded.iat < changedAtSec) return null;
  }

  return user;
}

// Verify JWT and attach user to request
exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const user = await verifyUserFromToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }

  // Expose both id and _id so route handlers can use either
  req.user = { ...user, _id: user.id };
  next();
};

/**
 * Like protect(), but also accepts the token as a `?token=` query param when
 * no Authorization header is present. ONLY use this for endpoints a browser
 * genuinely can't attach a custom header to (a plain <a href> navigation,
 * an <img src>) — a token in the URL can leak via server/proxy logs and
 * browser history, so this is a deliberate, narrow exception, not a
 * replacement for protect() elsewhere.
 */
exports.protectViaHeaderOrQueryToken = async (req, res, next) => {
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;
  const token = headerToken || (typeof req.query?.token === 'string' ? req.query.token : null);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  const user = await verifyUserFromToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }

  req.user = { ...user, _id: user.id };
  next();
};

exports.verifyUserFromToken = verifyUserFromToken;

// Restrict to specific roles
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized for this action`,
    });
  }
  next();
};
