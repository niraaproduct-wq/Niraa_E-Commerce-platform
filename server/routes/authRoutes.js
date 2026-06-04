const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  sendOtp,
  sendEmailOtp,
  verifyOtp,
  updateProfile,
  changePassword,
  setPassword,
  checkPhone,
  adminLogin,
  resetPasswordWithOtp,
  verifyFirebase,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, otpLimiter } = require('../middleware/security');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const { generateToken } = require('../middleware/csrfMiddleware');

// CSRF Token Route
router.get('/csrf-token', (req, res) => {
  const token = generateToken(req, res);
  res.json({ csrfToken: token });
});

// Public routes
router.post('/check-phone',      validate(schemas.auth.checkPhone),      checkPhone);
router.post('/send-otp',         otpLimiter, validate(schemas.auth.sendOtp),      sendOtp);
router.post('/send-email-otp',   otpLimiter, validate(schemas.auth.sendEmailOtp), sendEmailOtp);
router.post('/verify-otp',       validate(schemas.auth.verifyOtp),       verifyOtp);
router.post('/verify-firebase',  validate(schemas.auth.verifyFirebase),  verifyFirebase);
router.post('/register',         authLimiter, validate(schemas.auth.register),    register);
router.post('/login',            authLimiter, validate(schemas.auth.login),       login);
router.post('/admin-login',      authLimiter, validate(schemas.auth.adminLogin),  adminLogin);
router.post('/logout', logout);

// Protected routes
router.get('/profile',                    protect, getProfile);
router.put('/profile',                    protect, validate(schemas.auth.updateProfile),       updateProfile);
router.put('/change-password',            protect, validate(schemas.auth.changePassword),      changePassword);
router.put('/reset-password-with-otp',   protect, validate(schemas.auth.resetPasswordWithOtp), resetPasswordWithOtp);
router.post('/set-password',              protect, validate(schemas.auth.setPassword),         setPassword);

module.exports = router;