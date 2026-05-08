// utils/logger.js
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, colorize } = format;

// Consistent log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }), // capture stack trace
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new transports.Console({ format: combine(colorize(), logFormat) })
  ]
});

// In production also log to file (ensure logs directory exists & is .gitignored)
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({ filename: 'logs/error.log', level: 'error', format: combine(logFormat) }));
  logger.add(new transports.File({ filename: 'logs/combined.log', format: combine(logFormat) }));
}

module.exports = logger;
