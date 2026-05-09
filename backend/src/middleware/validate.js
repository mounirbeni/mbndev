const { body, query, validationResult } = require('express-validator');

// Run validators then return 400 with consolidated errors if any failed
const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('email')
    .isEmail().withMessage('Invalid email').normalizeEmail()
    .isLength({ max: 254 }),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain a letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('company')
    .optional().trim().isLength({ max: 120 }),
  handle,
];

const loginRules = [
  body('email')
    .isEmail().withMessage('Invalid email').normalizeEmail(),
  body('password')
    .isLength({ min: 1, max: 128 }).withMessage('Password required'),
  handle,
];

const forgotPasswordRules = [
  body('email')
    .isEmail().withMessage('Invalid email').normalizeEmail()
    .isLength({ max: 254 }),
  handle,
];

const resetPasswordRules = [
  body('token')
    .isString().withMessage('Token required')
    .isLength({ min: 32, max: 200 }),
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain a letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  handle,
];

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('company').optional().trim().isLength({ max: 120 }),
  body('phone').optional().trim().isLength({ max: 32 }),
  body('currentPassword').optional().isLength({ max: 128 }),
  body('newPassword').optional()
    .isLength({ min: 8, max: 128 }).withMessage('New password must be at least 8 characters')
    .matches(/[a-zA-Z]/).withMessage('Password must contain a letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  handle,
];

// ─── Orders ──────────────────────────────────────────────────────────────────
const VALID_SERVICES = ['website', 'ecommerce', 'dashboard', 'mobile', 'custom'];
const VALID_PLANS    = ['starter', 'pro', 'premium', 'custom'];

const createOrderRules = [
  body('serviceType').isIn(VALID_SERVICES).withMessage('Invalid service type'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 chars'),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('pages').optional().isInt({ min: 1, max: 100 }),
  body('features').optional().isArray({ max: 20 }),
  body('addons').optional().isArray({ max: 10 }),
  body('notes').optional().trim().isLength({ max: 2000 }),
  body('plan').optional().isIn(VALID_PLANS),
  body('designStyle').optional().trim().isLength({ max: 200 }),
  body('designColors').optional().isArray({ max: 10 }),
  body('designRefs').optional().isArray({ max: 10 }),
  handle,
];

const calculatePriceRules = [
  query('serviceType').optional().isIn(VALID_SERVICES),
  query('pages').optional().isInt({ min: 1, max: 100 }),
  query('plan').optional().isIn(VALID_PLANS),
  handle,
];

// ─── Manual payment ──────────────────────────────────────────────────────────
const submitManualRules = [
  body('orderId').isString().trim().isLength({ min: 1, max: 50 }),
  body('method').isIn(['cih_bank', 'paypal', 'taptapsend']),
  handle,
];

// ─── Messages ────────────────────────────────────────────────────────────────
const sendMessageRules = [
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be 1–5000 chars'),
  handle,
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  forgotPasswordRules,
  resetPasswordRules,
  createOrderRules,
  calculatePriceRules,
  submitManualRules,
  sendMessageRules,
};
