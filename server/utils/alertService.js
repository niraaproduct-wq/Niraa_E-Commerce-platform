const logger = require('./logger');

// Alert rate limiter: Keep track of recently sent alerts to avoid spamming the webhook (limit: 1 alert per 30 seconds per error message)
const recentAlerts = new Map();
const ALERT_COOLDOWN_MS = 30000;

/**
 * Dispatch critical error notification to Slack/Discord/Telegram webhook
 * @param {Error} err 
 * @param {import('express').Request} req 
 */
async function sendErrorAlert(err, req) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const now = Date.now();
  const errorSignature = `${req.method}_${req.originalUrl}_${err.message}`;

  if (recentAlerts.has(errorSignature)) {
    const lastSent = recentAlerts.get(errorSignature);
    if (now - lastSent < ALERT_COOLDOWN_MS) {
      // Skip sending to avoid spam
      return;
    }
  }

  // Record this alert timestamp
  recentAlerts.set(errorSignature, now);

  // Clean old entries from recentAlerts map every 10 minutes
  if (recentAlerts.size > 100) {
    for (const [key, timestamp] of recentAlerts.entries()) {
      if (now - timestamp > ALERT_COOLDOWN_MS) {
        recentAlerts.delete(key);
      }
    }
  }

  try {
    const isDiscord = webhookUrl.includes('discord.com');
    const isSlack = webhookUrl.includes('slack.com');

    const errorDetails = [
      `🚨 **[NIRAA E-Commerce Platform] Critical 500 Error**`,
      `• **Message**: \`${err.message}\``,
      `• **Request ID**: \`${req.id || 'N/A'}\``,
      `• **Method & Path**: \`${req.method} ${req.originalUrl}\``,
      `• **Environment**: \`${process.env.NODE_ENV || 'development'}\``,
      `• **Timestamp**: \`${new Date().toISOString()}\``,
    ];

    if (err.stack) {
      const truncatedStack = err.stack.split('\n').slice(0, 8).join('\n');
      errorDetails.push(`• **Stack Trace (Truncated)**:\n\`\`\`javascript\n${truncatedStack}\n\`\`\``);
    }

    const payload = {};
    if (isDiscord) {
      payload.embeds = [{
        title: '🚨 Critical Server Error Detected',
        color: 15158332, // Red color
        description: errorDetails.join('\n'),
        timestamp: new Date().toISOString()
      }];
    } else if (isSlack) {
      payload.text = errorDetails.join('\n');
    } else {
      // Default fallback JSON payload
      payload.text = errorDetails.join('\n');
    }

    // Dynamic import of fetch or use standard http/https node module to prevent external dependencies
    const url = new URL(webhookUrl);
    const client = url.protocol === 'https:' ? require('https') : require('http');

    const data = JSON.stringify(payload);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 5000 // 5 seconds timeout
    };

    const request = client.request(options, (response) => {
      if (response.statusCode >= 300) {
        logger.error(`[AlertService] Failed to send alert webhook. Status: ${response.statusCode}`);
      }
    });

    request.on('error', (requestError) => {
      logger.error('[AlertService] Error during alert webhook request:', requestError.message);
    });

    request.on('timeout', () => {
      logger.error('[AlertService] Webhook notification request timed out.');
      request.destroy();
    });

    request.write(data);
    request.end();

  } catch (alertError) {
    // Fail silently relative to the client's request
    logger.error('[AlertService] Failed to dispatch webhook alert:', alertError.message);
  }
}

module.exports = { sendErrorAlert };
