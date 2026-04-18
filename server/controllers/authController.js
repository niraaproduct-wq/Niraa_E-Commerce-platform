const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { saveUserToExcel } = require('../utils/excelHelper');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// In-memory store for OTPs (for simplicity without Redis)
const otpStore = new Map();

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone number is required' });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store it alongside expiry (10 minutes)
    otpStore.set(phone, { otp, expiresAt: Date.now() + 10 * 60 * 1000 });
    
    // In a real app, send OTP via SMS endpoint (e.g. Twilio/Fast2SMS)
    console.log(`[DEV ONLY] OTP for ${phone} is: ${otp}`);

    res.json({ message: 'OTP sent successfully', devOtp: otp }); // Exposing for dev/testing
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Verify OTP and Login or Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, name, address } = req.body;
    
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' });

    const storedData = otpStore.get(phone);
    if (!storedData) return res.status(400).json({ message: 'OTP not found or expired. Request a new one.' });
    if (storedData.otp !== otp || Date.now() > storedData.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid. Clear it.
    otpStore.delete(phone);

    // Check if user exists
    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      // Must be a signup, require name at least
      if (!name) return res.status(400).json({ message: 'Name is required for new users', needsSignupDetails: true });
      
      user = await User.create({ 
        phone, 
        name, 
        address: address || { city: 'Dharmapuri' },
        // generate a dummy email if needed although schema allows sparse now
        // email: `${phone}@niraa.local.temp` 
      });
      isNewUser = true;
      
      // Save to Excel
      await saveUserToExcel(user);
    } else {
      // Update location dynamically if passed during login
      if (address) {
        user.address = { ...user.address, ...address };
        await user.save();
      }
    }

    res.json({
      _id:   user._id,
      name:  user.name,
      phone: user.phone,
      role:  user.role,
      address: user.address,
      token: generateToken(user._id),
      isNewUser
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Old generic register & login kept for admin or legacy (can be removed if strictly phone only)
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone });
    await saveUserToExcel(user);
    
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, address: user.address, token: generateToken(user._id) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
};

module.exports = { sendOtp, verifyOtp, register, login, getProfile };