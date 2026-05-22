const router = require('express').Router();
const {
  register, login, getMe, updateProfile, deleteAccount,
  forgotPassword, resetPassword,
  checkEmail, checkPhone,
} = require('../controllers/authController');
const { protect }  = require('../middleware/auth');
const {
  registerRules, loginRules, updateProfileRules,
  forgotPasswordRules, resetPasswordRules,
  checkEmailRules, checkPhoneRules,
} = require('../middleware/validate');

// ── Public ───────────────────────────────────────────────────────────────────
router.post('/register',        registerRules,        register);
router.post('/login',           loginRules,           login);
router.post('/forgot-password', forgotPasswordRules,  forgotPassword);
router.post('/reset-password',  resetPasswordRules,   resetPassword);

// Real-time uniqueness checks (used by the signup form while the user types)
router.post('/check-email',     checkEmailRules,      checkEmail);
router.post('/check-phone',     checkPhoneRules,      checkPhone);

// ── Protected ────────────────────────────────────────────────────────────────
router.get   ('/me',              protect,              getMe);
router.put   ('/profile',         protect, updateProfileRules, updateProfile);
router.delete('/account',         protect,              deleteAccount);

module.exports = router;
