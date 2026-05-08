const bcrypt = require('bcryptjs');
const logger = require('./logger');

// In-memory OTP store (replace with Redis in production for multi-instance scaling)
const otpStore = new Map();
const resendCooldown = new Map();

/**
 * CLEANUP TASK: Runs every 10 minutes to remove expired OTPs from memory.
 * This prevents memory leaks when not using Redis TTLs.
 */
setInterval(() => {
  const now = Date.now();
  let count = 0;
  for (const [key, value] of otpStore.entries()) {
    if (now > value.expiresAt) {
      otpStore.delete(key);
      count++;
    }
  }
  if (count > 0) logger.debug(`[OTPStorage] Cleaned up ${count} expired OTP entries from memory`);
}, 10 * 60 * 1000);

/**
 * Generate a cryptographically random 6-digit OTP.
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Returns remaining cooldown seconds before a new OTP can be requested.
 * Returns 0 if cooldown has passed.
 */
const getResendCooldown = (key) => {
  const lastSent = resendCooldown.get(key);
  if (!lastSent) return 0;
  const elapsed = Math.floor((Date.now() - lastSent) / 1000);
  const cooldown = 60; // 60 seconds
  return elapsed >= cooldown ? 0 : cooldown - elapsed;
};

/**
 * Hash and store an OTP for the given key (email or phone).
 * Automatically sets a 5-minute TTL.
 */
const storeOTP = async (key, otp) => {
  // NEVER log the raw OTP in production
  logger.info(`[OTPStorage] Generating OTP for key: ${key.substring(0, 3)}***`);

  const salt = await bcrypt.genSalt(10);
  const hashedOtp = await bcrypt.hash(otp, salt);

  otpStore.set(key, {
    otp: hashedOtp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    attempts: 0,
  });

  resendCooldown.set(key, Date.now());
};

/**
 * Verify an entered OTP against the stored hash.
 * Enforces 3-attempt limit and expiry checks.
 * @param {string} key - email or phone
 * @param {string} enteredOtp - the 6-digit OTP entered by the user
 * @param {boolean} preserve - if true, don't delete the OTP after verification (e.g. for password reset)
 */
const verifyStoredOTP = async (key, enteredOtp, preserve = false) => {
  const stored = otpStore.get(key);

  if (!stored) {
    logger.warn(`[OTPStorage] No OTP found for: ${key.substring(0, 3)}***`);
    return { valid: false, message: 'No OTP found or it has expired. Please request a new one.' };
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    logger.warn(`[OTPStorage] OTP expired for: ${key.substring(0, 3)}***`);
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  stored.attempts += 1;

  // Hard limit: 3 wrong attempts = invalidate OTP entirely
  if (stored.attempts > 3) {
    otpStore.delete(key);
    logger.error(`[OTPStorage] SECURITY: Too many OTP attempts for key ${key}`);
    return { valid: false, message: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  const isValid = await bcrypt.compare(enteredOtp, stored.otp);

  if (isValid) {
    if (!preserve) {
      otpStore.delete(key);
      resendCooldown.delete(key);
    }
    logger.info(`[OTPStorage] OTP verified successfully for: ${key.substring(0, 3)}***`);
    return { valid: true, message: 'OTP verified successfully' };
  }

  const remaining = 3 - stored.attempts;
  logger.warn(`[OTPStorage] Invalid OTP for ${key.substring(0, 3)}***. Attempt ${stored.attempts}/3`);
  return {
    valid: false,
    message: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
    remainingAttempts: remaining,
  };
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyStoredOTP,
  getResendCooldown,
};
