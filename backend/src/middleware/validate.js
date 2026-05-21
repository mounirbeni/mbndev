const { body, query, validationResult } = require('express-validator');
const { normalizePhone } = require('../lib/authSecurity');

// Run validators then return 400 with consolidated errors if any failed
const handle = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errs = errors.array();
    return res.status(400).json({
      success: false,
      message: errs[0].msg,                              // first error as top-level message
      field:   errs[0].path || undefined,
      errors:  errs.map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth ────────────────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false })
    .isLength({ max: 254 })
    .withMessage('Email address is too long.'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Company name is too long.'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (!val) return true;                             // optional field — blank is fine
      const norm = normalizePhone(val);
      if (!norm) throw new Error('Phone number is invalid. Use international format, e.g. +1234567890.');
      return true;
    }),

  handle,
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .isLength({ min: 1, max: 128 })
    .withMessage('Password is required.'),

  handle,
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail({ gmail_remove_dots: false })
    .isLength({ max: 254 }),

  handle,
];

const resetPasswordRules = [
  body('token')
    .isString()
    .withMessage('Reset token is required.')
    .isLength({ min: 32, max: 200 }),

  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be at least 8 characters.')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),

  handle,
];

const updateProfileRules = [
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Name must be between 2 and 80 characters.'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 })
    .withMessage('Company name is too long.'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((val) => {
      if (val === '' || val === null || val === undefined) return true;
      const norm = normalizePhone(val);
      if (!norm) throw new Error('Phone number is invalid. Use international format, e.g. +1234567890.');
      return true;
    }),

  body('currentPassword')
    .optional({ checkFalsy: true })
    .isLength({ max: 128 }),

  body('newPassword')
    .optional({ checkFalsy: true })
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be at least 8 characters.')
    .matches(/[a-zA-Z]/)
    .withMessage('Password must contain at least one letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),

  handle,
];

// Check-email / check-phone (lightweight, no normalisation needed — controller handles it)
const checkEmailRules = [
  body('email').trim().isEmail().withMessage('Invalid email.').normalizeEmail({ gmail_remove_dots: false }),
  handle,
];

const checkPhoneRules = [
  body('phone').trim().isLength({ min: 1 }).withMessage('Phone is required.'),
  handle,
];

// ─── Orders ──────────────────────────────────────────────────────────────────

const VALID_SERVICES = ['website', 'ecommerce', 'dashboard', 'mobile', 'custom'];
const VALID_PLANS    = ['starter', 'pro', 'premium', 'custom'];

const createOrderRules = [
  body('serviceType').isIn(VALID_SERVICES).withMessage('Invalid service type.'),
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters.'),
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
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be 1–5000 characters.'),
  handle,
];

module.exports = {
  registerRules,
  loginRules,
  updateProfileRules,
  forgotPasswordRules,
  resetPasswordRules,
  checkEmailRules,
  checkPhoneRules,
  createOrderRules,
  calculatePriceRules,
  submitManualRules,
  sendMessageRules,
};
