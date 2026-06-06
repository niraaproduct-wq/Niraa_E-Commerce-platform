const Joi = require('joi');
const logger = require('../utils/logger');

// Recursive helper to sanitize string inputs against XSS attacks
function stripHtml(value, key = '') {
  if (typeof value === 'string') {
    // If the field is a product description, allow clean HTML tags but strip script tags and active handles
    if (key === 'description') {
      return value
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
        .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]*)/gi, '')
        .replace(/javascript:\s*/gi, '');
    }
    // For all other fields (user comments, reviews, names, etc.), completely strip all HTML tags
    return value.replace(/<[^>]*>/g, '').trim();
  }
  
  if (Array.isArray(value)) {
    return value.map((item) => stripHtml(item, key));
  }
  
  if (value !== null && typeof value === 'object') {
    const cleanedObj = {};
    for (const [k, v] of Object.entries(value)) {
      cleanedObj[k] = stripHtml(v, k);
    }
    return cleanedObj;
  }
  
  return value;
}

const validate = (schema) => (req, res, next) => {
  if (!schema) {
    return next();
  }

  // Pre-sanitize req.body recursively before Joi validation
  if (req.body) {
    req.body = stripHtml(req.body);
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true, // remove unknown keys
  });

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    logger.warn(`Validation Error on ${req.method} ${req.originalUrl}: ${errorMessage}`, { requestId: req.id });
    return res.status(400).json({ message: 'Invalid request data', errors: error.details });
  }

  req.body = value;
  return next();
};

module.exports = validate;
