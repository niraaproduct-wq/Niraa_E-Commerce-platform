const bcrypt = require('bcryptjs');
const otpStore = new Map();
const resendCooldown = new Map(); // tracks last-sent timestamp per key

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

// Returns seconds remaining before a resend is allowed, or 0 if allowed now
const getResendCooldown = (key) => {
  const lastSent = resendCooldown.get(key);
  if (!lastSent) return 0;
  const elapsed = Math.floor((Date.now() - lastSent) / 1000);
  const cooldown = 60; // seconds
  return elapsed >= cooldown ? 0 : cooldown - elapsed;
};

const storeOTP = async (key, otp) => {
  console.log(`Storing OTP for ${key}: [REDACTED IN PROD]`);
  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);

  otpStore.set(key, {
    otp: hashedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  });
  resendCooldown.set(key, Date.now()); // record send timestamp
};

const verifyStoredOTP = async (key, enteredOtp, preserve = false) => {
  const stored = otpStore.get(key);
  console.log(`Searching OTP for ${key}: Found=${!!stored}`);
  if (!stored) return { valid: false, message: 'No OTP found or expired' };

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { valid: false, message: 'OTP expired' };
  }

  stored.attempts += 1;
  if (stored.attempts > 3) {
    otpStore.delete(key);
    return { valid: false, message: 'Too many attempts. Please request a new OTP' };
  }

  const isValid = await bcrypt.compare(enteredOtp, stored.otp);

  if (isValid) {
    if (!preserve) otpStore.delete(key);
    resendCooldown.delete(key); // clear cooldown on success
    return { valid: true, message: 'OTP verified successfully' };
  }

  return { valid: false, message: 'Invalid OTP', remainingAttempts: 3 - stored.attempts };
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyStoredOTP,
  getResendCooldown,
};

