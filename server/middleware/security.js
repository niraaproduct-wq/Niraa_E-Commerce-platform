const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// General rate limiter for all API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 100, // Limit each IP to 100 requests per window (5000 in dev)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter rate limiter for sensitive auth endpoints (OTP, Login)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour for auth actions
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many authentication attempts from this IP, please try again after an hour'
  }
});

// Even stricter limiter for OTP sending specifically to prevent cost abuse
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit to 5 OTPs per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many OTP requests. Please wait before trying again.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  otpLimiter
};
