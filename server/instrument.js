// Sentry Node SDK v8 Instrumentation
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables before initializing Sentry
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Sentry = require("@sentry/node");

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.25'),
    sendDefaultPii: true,
  });
}
