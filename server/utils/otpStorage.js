const otpStore = new Map();

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const storeOTP = (phone, otp) => {
  console.log(`Storing OTP for ${phone}: ${otp}`);
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + 3 * 60 * 1000,
    attempts: 0,
  });
};

const verifyStoredOTP = (phone, enteredOtp, preserve = false) => {
  const stored = otpStore.get(phone);
  console.log(`Searching OTP for ${phone}: Found=${!!stored}`);
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

  console.log(`Comparing OTP for ${phone}: Stored=${stored.otp} (${typeof stored.otp}), Entered=${enteredOtp} (${typeof enteredOtp})`);
  if (String(stored.otp) === String(enteredOtp)) {
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
