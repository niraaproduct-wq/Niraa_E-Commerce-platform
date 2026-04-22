const express = require('express');
const router  = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  sendOtp, 
  verifyOtp,
  updateProfile,
  changePassword,
  setPassword,
  checkPhone,
  adminLogin
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/check-phone', checkPhone);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/set-password', protect, setPassword);

module.exports = router;