const Joi = require('joi');
const logger = require('../utils/logger');

const validate = (schema) => (req, res, next) => {
  if (!schema) {
    return next();
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
