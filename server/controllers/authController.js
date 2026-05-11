const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const firebaseStorage = require('../utils/firebaseStorage');
const otpStorage = require('../utils/otpStorage');
const smsService = require('../utils/smsService');
const mailService = require('../utils/mailService');
const { publishEvent } = require('../utils/realtimeHub');

// Helper: Generate JWT Token
const generateToken = (user) => {
  // Admin tokens expire sooner for tighter security
  const expiry = user.role === 'admin' ? '1d' : '7d';
  return jwt.sign(
    { id: user.id, role: user.role || 'customer' },
    process.env.JWT_SECRET,
    { expiresIn: expiry }
  );
};

const setAuthCookie = (res, token, user) => {
  const isProd = process.env.NODE_ENV === 'production';
  // Match cookie expiry to JWT expiry (1d admin, 7d customer)
  const maxDays = user?.role === 'admin' ? 1 : 7;
  const maxAgeMs = maxDays * 24 * 60 * 60 * 1000;

  res.cookie('niraa_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/',
  });
};

const clearAuthCookie = (res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('niraa_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });
};

// Helper: Get user data for response (exclude sensitive fields)
const sanitizeUser = (user) => {
  return {
    id: user.id,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    hasPassword: user.hasPassword,
    address: user.address,
    profileComplete: user.profileComplete,
    createdAt: user.createdAt
  };
};

// @desc    Check if phone exists
// @route   POST /api/auth/check-phone
// @access  Public
const checkPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: 'Phone is required' });

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').slice(-10);
    const user = await firebaseStorage.findUserByPhone(cleanPhone);
    
    if (user) {
      // Mask email for security — never expose the full email to prevent harvesting
      let maskedEmail = '';
      if (user.email) {
        const [name, domain] = user.email.split('@');
        maskedEmail = name.charAt(0) + '*'.repeat(Math.min(name.length - 1, 3)) + '@' + domain;
      }

      return res.status(200).json({ 
        exists: true, 
        maskedEmail,
        hasPassword: !!user.hasPassword
      });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    logger.error('Check Phone Error:', error);
    res.status(500).json({ message: 'Error checking phone' });
  }
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-email-otp
// @access  Public
const sendEmailOtp = async (req, res) => {
  try {
    let { phone, email } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '').slice(-10);
    
    // If email is not provided, look it up by phone (for existing users)
    if (!email) {
      const user = await firebaseStorage.findUserByPhone(cleanPhone);
      if (user && user.email) {
        email = user.email;
      }
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Enforce 60-second resend cooldown
    const cooldownSeconds = otpStorage.getResendCooldown(email);
    if (cooldownSeconds > 0) {
      return res.status(429).json({
        message: `Please wait ${cooldownSeconds} seconds before requesting a new OTP`,
        retryAfter: cooldownSeconds,
      });
    }

    // Check if email is already taken by another phone
    const existingUserByEmail = await firebaseStorage.findUserByEmail(email);
    if (existingUserByEmail && existingUserByEmail.phone !== cleanPhone) {
      return res.status(400).json({ message: 'Email is already associated with another account' });
    }

    const otp = otpStorage.generateOTP();
    // Store OTP using email as the key for email-based verification
    await otpStorage.storeOTP(email, otp); // Store against email for verification consistency

    // Pass customer name if user exists
    const customerName = existingUserByEmail ? (existingUserByEmail.firstName || existingUserByEmail.name || 'Customer') : 'Customer';
    const result = await mailService.sendEmailOTP(email, otp, customerName);

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to send email OTP', error: result.message });
    }

    res.status(200).json({
      message: 'OTP sent to your email',
      devOtp: result.devOtp,
      email: email
    });
  } catch (error) {
    logger.error('Send Email OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// @desc    Send OTP to phone number
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  if (process.env.OTP_LEGACY_DISABLED === 'true') {
    return res.status(403).json({ message: 'Deprecated endpoint' });
  }

  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Please enter a valid phone number' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const validatedPhone = smsService.validatePhone(cleanPhone);

    if (!validatedPhone) {
      return res.status(400).json({
        message: 'Please enter a valid Indian phone number (10 digits, starting with 6-9)'
      });
    }

    const otp = otpStorage.generateOTP();
    await otpStorage.storeOTP(validatedPhone, otp);

    const smsResult = await smsService.sendSMS(validatedPhone, otp);

    if (!smsResult.success) {
      logger.error('SMS sending failed:', smsResult.message);
      if (process.env.SMS_PROVIDER !== 'development') {
        return res.status(500).json({
          message: 'Failed to send OTP via SMS',
          error: smsResult.message
        });
      }
    }

    res.status(200).json({
      message: 'OTP sent successfully',
      devOtp: smsResult.devOtp,
      provider: smsResult.provider,
      phone: validatedPhone
    });
  } catch (error) {
    logger.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// @desc    Verify OTP and login/signup user
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  if (process.env.OTP_LEGACY_DISABLED === 'true') {
    return res.status(403).json({ message: 'Deprecated endpoint' });
  }

  try {
    const { phone, otp, name, firstName, lastName, address, password, loginPassword, email } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const validatedPhone = smsService.validatePhone(cleanPhone);

    if (!validatedPhone) {
      return res.status(400).json({
        message: 'Please enter a valid Indian phone number (10 digits, starting with 6-9)'
      });
    }

    let verifyKey = email;
    
    // If email is not provided (existing user login flow), look it up by phone
    if (!verifyKey) {
      const user = await firebaseStorage.findUserByPhone(validatedPhone);
      if (user && user.email) {
        verifyKey = user.email;
      }
    }
    
    // Fallback to phone if still no email (legacy SMS flow)
    if (!verifyKey) {
      verifyKey = validatedPhone;
    }

    const otpResult = await otpStorage.verifyStoredOTP(verifyKey, otp, true);
    logger.info(`Verifying OTP for ${verifyKey}: Entered=${otp}, Result=${otpResult.valid}, Message=${otpResult.message}`);

    if (!otpResult.valid) {
      return res.status(401).json({ message: otpResult.message });
    }

    let user = await firebaseStorage.findUserByPhone(validatedPhone);

    // New user — needs signup details
    if (!user) {
      const userFirstName = firstName || (name ? name.split(' ')[0] : '');
      const userLastName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');

      if (!userFirstName) {
        return res.status(400).json({
          message: 'First name is required for new users',
          needsSignupDetails: true
        });
      }

      const newUser = {
        phone: cleanPhone,
        firstName: userFirstName,
        lastName: userLastName,
        name: name || `${userFirstName} ${userLastName}`,
        email: email || '',
        isVerified: true,
        role: 'customer',
        address: address || {},
        profileComplete: true
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        newUser.hasPassword = true;
      }

      user = await firebaseStorage.createUser(newUser);
      const token = generateToken(user);
      setAuthCookie(res, token, user);
      publishEvent('customers.changed', { type: 'registered', userId: user.id });

      return res.status(201).json({
        message: 'Welcome to Niraa! Your account has been created.',
        user: sanitizeUser(user),
        token,
        isNewUser: true
      });
    }

    // Existing user — verify password if provided
    if (loginPassword && user.hasPassword) {
      const isPasswordValid = await bcrypt.compare(loginPassword, user.password || '');
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    await firebaseStorage.updateUser(user.id, { isVerified: true });

    if (password && !user.hasPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await firebaseStorage.updateUser(user.id, { password: hashedPassword, hasPassword: true });
    }

    if (name || address || email) {
      const updateData = {};
      if (name) {
        const nameParts = name.split(' ');
        updateData.firstName = nameParts[0];
        updateData.lastName = nameParts.slice(1).join(' ');
        updateData.name = name;
      }
      if (address) {
        updateData.address = { ...user.address, ...address };
      }
      if (email) {
        updateData.email = email;
      }
      await firebaseStorage.updateUser(user.id, updateData);
    }

    const token = generateToken(user);
    setAuthCookie(res, token, user);
    res.status(200).json({
      message: 'Welcome back!',
      user: sanitizeUser(user),
      token,
      isNewUser: false
    });
  } catch (error) {
    logger.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password, address } = req.body;

    if (!firstName || !phone) {
      return res.status(400).json({ message: 'First name and phone are required' });
    }

    const existingUser = await firebaseStorage.findUserByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await firebaseStorage.createUser({
      firstName,
      lastName: lastName || '',
      phone,
      email: email || '',
      password: hashedPassword,
      hasPassword: true,
      isVerified: true,
      role: 'customer',
      address: address || {},
      name: `${firstName} ${lastName || ''}`.trim(),
      profileComplete: true
    });

    const token = generateToken(user);
    setAuthCookie(res, token, user);
    publishEvent('customers.changed', { type: 'registered', userId: user.id });

    res.status(201).json({
      message: 'Registration successful!',
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    logger.error('Register Error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// @desc    Login user with phone/email and password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { phone, email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    let user = await firebaseStorage.findUserByPhone(phone);
    if (!user && email) {
      user = await firebaseStorage.findUserByEmail(email);
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token, user);
    res.status(200).json({
      message: 'Login successful!',
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    logger.error('Login Error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await firebaseStorage.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    logger.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, name, email, address } = req.body;

    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

    const user = await firebaseStorage.updateUser(req.user.id, updateData);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    publishEvent('customers.changed', { type: 'profile_updated', userId: user.id });
    res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user)
    });
  } catch (error) {
    logger.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await firebaseStorage.updateUser(req.user.id, { password: hashedPassword, hasPassword: true });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change Password Error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// @desc    Set password (for newly registered users)
// @route   POST /api/auth/set-password
// @access  Private
const setPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await firebaseStorage.updateUser(req.user.id, { password: hashedPassword, hasPassword: true });

    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    logger.error('Set Password Error:', error);
    res.status(500).json({ message: 'Failed to set password' });
  }
};

// @desc    Reset password with OTP verification (high-security flow)
// @route   PUT /api/auth/reset-password-with-otp
// @access  Private
const resetPasswordWithOtp = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ message: 'OTP and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP against the user's registered phone
    // Validate OTP against the user's email
    const emailKey = user.email;
    const otpResult = await otpStorage.verifyStoredOTP(emailKey, otp, true);

    if (!otpResult.valid) {
      return res.status(401).json({ message: otpResult.message || 'Invalid or expired OTP' });
    }

    // Update password after successful OTP verification
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await firebaseStorage.updateUser(req.user.id, { password: hashedPassword, hasPassword: true });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Reset Password With OTP Error:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
};

// @desc    Admin login with password
// @route   POST /api/auth/admin-login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await firebaseStorage.findAdminByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    const token = generateToken(user);
    setAuthCookie(res, token, user);

    res.status(200).json({
      message: 'Admin login successful!',
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    logger.error('Admin Login Error:', error);
    res.status(500).json({ message: 'Admin login failed' });
  }
};

// @desc    Verify Firebase ID Token and login/signup user
// @route   POST /api/auth/verify-firebase
// @access  Public
const verifyFirebase = async (req, res) => {
  try {
    const { idToken, name, firstName, lastName, address, password, email } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID Token is required' });
    }

    // Verify token using firebase-admin
    const { getFirebase } = require('../config/firebase');
    const { auth } = getFirebase();

    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(idToken);
    } catch (err) {
      logger.error('Firebase token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired Firebase token' });
    }

    const phone = decodedToken.phone_number;
    if (!phone) {
      return res.status(400).json({ message: 'Phone number not found in token' });
    }

    const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '').slice(-10); // get last 10 digits
    const validatedPhone = smsService.validatePhone(cleanPhone) || cleanPhone;

    let user = await firebaseStorage.findUserByPhone(validatedPhone);

    // New user — needs signup details
    if (!user) {
      const userFirstName = firstName || (name ? name.split(' ')[0] : '');
      const userLastName = lastName || (name ? name.split(' ').slice(1).join(' ') : '');

      if (!userFirstName) {
        return res.status(400).json({
          message: 'First name is required for new users',
          needsSignupDetails: true
        });
      }

      const newUser = {
        phone: cleanPhone,
        firstName: userFirstName,
        lastName: userLastName,
        name: name || `${userFirstName} ${userLastName}`.trim(),
        email: email || '',
        isVerified: true,
        role: 'customer',
        address: address || {},
        profileComplete: true
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        newUser.hasPassword = true;
      }

      user = await firebaseStorage.createUser(newUser);
      const token = generateToken(user);
      setAuthCookie(res, token, user);
      publishEvent('customers.changed', { type: 'registered', userId: user.id });

      return res.status(201).json({
        message: 'Welcome to Niraa! Your account has been created.',
        user: sanitizeUser(user),
        token,
        isNewUser: true
      });
    }

    // Existing user
    await firebaseStorage.updateUser(user.id, { isVerified: true });

    if (password && !user.hasPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await firebaseStorage.updateUser(user.id, { password: hashedPassword, hasPassword: true });
    }

    if (name || address || email) {
      const updateData = {};
      if (name) {
        const nameParts = name.split(' ');
        updateData.firstName = nameParts[0];
        updateData.lastName = nameParts.slice(1).join(' ');
        updateData.name = name;
      }
      if (address) {
        updateData.address = { ...user.address, ...address };
      }
      if (email) {
        updateData.email = email;
      }
      await firebaseStorage.updateUser(user.id, updateData);
    }

    const token = generateToken(user);
    setAuthCookie(res, token, user);
    res.status(200).json({
      message: 'Welcome back!',
      user: sanitizeUser(user),
      token,
      isNewUser: false
    });
  } catch (error) {
    logger.error('Verify Firebase Error:', error);
    res.status(500).json({ message: 'Firebase authentication failed' });
  }
};

module.exports = {
  sendOtp,
  sendEmailOtp,
  verifyOtp,
  register,
  login,
  // cookie-based session helpers
  logout: async (req, res) => {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Logged out' });
  },
  getProfile,
  updateProfile,
  changePassword,
  setPassword,
  checkPhone,
  adminLogin,
  resetPasswordWithOtp,
  verifyFirebase
};