const router = require('express').Router();
const {
  register, login, getMe, updateProfile,
  forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerRules, loginRules, updateProfileRules,
  forgotPasswordRules, resetPasswordRules,
} = require('../middleware/validate');

router.post('/register',         registerRules,        register);
router.post('/login',            loginRules,           login);
router.get ('/me',               protect,              getMe);
router.put ('/profile',          protect,              updateProfileRules, updateProfile);

router.post('/forgot-password',  forgotPasswordRules,  forgotPassword);
router.post('/reset-password',   resetPasswordRules,   resetPassword);

module.exports = router;
