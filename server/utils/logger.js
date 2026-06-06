const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, errors, colorize, json } = format;

// Standard log format for development (human-readable)
const devFormat = printf(({ level, message, timestamp, stack, requestId }) => {
  const reqId = requestId ? ` [${requestId}]` : '';
  return `${timestamp}${reqId} ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production' ? json() : devFormat
  ),
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? json() 
        : combine(colorize(), devFormat)
    })
  ]
});

// Production: write errors to a separate file, and all logs to a combined file
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;
