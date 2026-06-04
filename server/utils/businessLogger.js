const { getFirebase } = require('../config/firebase');
const logger = require('./logger');

/**
 * Logs a structured business event to standard outputs (Winston) and persists it in Firestore
 * @param {string} event Name of the business event
 * @param {object} data Relevant metadata associated with the event
 * @param {boolean} isError Whether this represents a business failure/error
 */
const logBusinessEvent = async (event, data = {}, isError = false) => {
  const timestamp = new Date().toISOString();
  
  // 1. Structured log for Render / Winston console output
  const logData = { event, ...data, isBusinessEvent: true, timestamp };
  const logMessage = `[Business Event] ${event}: ${JSON.stringify(data)}`;
  
  if (isError) {
    logger.error(logMessage, logData);
  } else {
    logger.info(logMessage, logData);
  }

  // 2. Safe, non-blocking fire-and-forget write to Firestore 'business_logs' collection
  try {
    const { db } = getFirebase();
    if (db && typeof db.collection === 'function') {
      const col = db.collection('business_logs');
      if (col && typeof col.add === 'function') {
        col.add({
          event,
          timestamp,
          data,
          isError,
          environment: process.env.NODE_ENV || 'production'
        }).catch(err => {
          logger.error(`Failed to write business event to Firestore: ${err.message}`, { originalEvent: event });
        });
      } else {
        logger.debug(`[Business Event] Firestore 'add' is not a function (mock or offline environment).`);
      }
    }
  } catch (dbErr) {
    // Graceful fallback if database is not initialized yet or not available
    logger.error(`Database not available for business logging: ${dbErr.message}`, { originalEvent: event });
  }
};

module.exports = {
  logOrderCreated: (orderId, customerId, total, itemsCount) => 
    logBusinessEvent('ORDER_CREATED', { orderId, customerId, total, itemsCount }),
  
  logOrderFailed: (orderId, customerId, error) => 
    logBusinessEvent('ORDER_FAILED', { orderId, customerId, error: error.message || error }, true),
  
  logPaymentSucceeded: (orderId, paymentId, amount) => 
    logBusinessEvent('PAYMENT_SUCCEEDED', { orderId, paymentId, amount }),
  
  logPaymentFailed: (orderId, error) => 
    logBusinessEvent('PAYMENT_FAILED', { orderId, error: error.message || error }, true),
  
  logEmailSent: (recipient, templateName, messageId) => 
    logBusinessEvent('EMAIL_SENT', { recipient, templateName, messageId }),
  
  logEmailFailed: (recipient, templateName, error) => 
    logBusinessEvent('EMAIL_FAILED', { recipient, templateName, error: error.message || error }, true),
    
  logUploadSucceeded: (publicId, folder, format) =>
    logBusinessEvent('UPLOAD_SUCCEEDED', { publicId, folder, format }),
    
  logUploadFailed: (filename, error) =>
    logBusinessEvent('UPLOAD_FAILED', { filename, error: error.message || error }, true),
};
