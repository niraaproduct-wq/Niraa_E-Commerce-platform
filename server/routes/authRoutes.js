const express = require('express');
const router  = express.Router();
const { register, login, getProfile, sendOtp, verifyOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp',  sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register',  register);
router.post('/login',     login);
router.get('/profile',    protect, getProfile);

module.exports = router;