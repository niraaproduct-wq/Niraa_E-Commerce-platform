const otpStore = new Map();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const storeOTP = (phone, otp) => {
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 3 * 60 * 1000,
    attempts: 0,
  });
};

const verifyStoredOTP = (phone, enteredOtp, preserve = false) => {
  const stored = otpStore.get(phone);
  if (!stored) return { valid: false, message: 'No OTP found for this number' };

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, message: 'OTP expired' };
  }

  stored.attempts += 1;
  if (stored.attempts > 5) {
    otpStore.delete(phone);
    return { valid: false, message: 'Too many attempts. Please request a new OTP' };
  }

  if (stored.otp === enteredOtp) {
    if (!preserve) otpStore.delete(phone);
    return { valid: true, message: 'OTP verified successfully' };
  }

  return { valid: false, message: 'Invalid OTP', remainingAttempts: 5 - stored.attempts };
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyStoredOTP,
};
