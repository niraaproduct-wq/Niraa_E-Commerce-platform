/**
 * server/services/broadcastProvider.js
 *
 * Wraps Fast2SMS (or development console) for bulk marketing broadcasts.
 * The controller calls: broadcastProvider.send(phones, message)
 * and receives:         { successCount, failureCount, raw }
 */

const https = require('https');

const PROVIDER = process.env.SMS_PROVIDER || 'development';
const FAST2SMS_KEY = process.env.FAST2SMS_API_KEY || '';

// ── Fast2SMS bulk send ────────────────────────────────────────────────────────

/**
 * Fast2SMS supports up to 1000 numbers per request (comma-separated).
 * We chunk into batches of 100 to be safe.
 */
const sendViaFast2SMS = async (phones, message) => {
  const chunkSize = 100;
  const chunks = [];
  for (let i = 0; i < phones.length; i += chunkSize) {
    chunks.push(phones.slice(i, i + chunkSize));
  }

  let successCount = 0;
  let failureCount = 0;
  const rawResults = [];

  for (const chunk of chunks) {
    const numbers = chunk.join(',');
    const postData =
      `sender_id=FSTSMS` +
      `&message=${encodeURIComponent(message)}` +
      `&language=english` +
      `&route=p` +
      `&numbers=${numbers}`;

    const result = await new Promise((resolve) => {
      const options = {
        hostname: 'www.fast2sms.com',
        port: 443,
        path: '/dev2/push',
        method: 'POST',
        headers: {
          authorization: FAST2SMS_KEY,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve({ ok: !!json.return, raw: json });
          } catch {
            resolve({ ok: false, raw: { error: data } });
          }
        });
      });

      req.on('error', (err) => resolve({ ok: false, raw: { error: err.message } }));
      req.write(postData);
      req.end();
    });

    rawResults.push(result.raw);
    if (result.ok) successCount += chunk.length;
    else failureCount += chunk.length;
  }

  return { successCount, failureCount, raw: rawResults };
};

// ── Development stub ──────────────────────────────────────────────────────────

const sendViaDevelopment = async (phones, message) => {
  console.log(`\n📣 [Broadcast DEV] Sending to ${phones.length} numbers`);
  console.log(`   Message: ${message}`);
  console.log(`   Numbers: ${phones.slice(0, 5).join(', ')}${phones.length > 5 ? ` …+${phones.length - 5} more` : ''}\n`);
  return { successCount: phones.length, failureCount: 0, raw: { dev: true } };
};

// ── Unified API ───────────────────────────────────────────────────────────────

const send = async (phones, message) => {
  if (!phones || phones.length === 0) {
    return { successCount: 0, failureCount: 0, raw: { error: 'no numbers' } };
  }

  switch (PROVIDER) {
    case 'fast2sms':
      if (!FAST2SMS_KEY) {
        console.warn('[BroadcastProvider] FAST2SMS_API_KEY not set — falling back to dev mode');
        return sendViaDevelopment(phones, message);
      }
      return sendViaFast2SMS(phones, message);

    default:
      return sendViaDevelopment(phones, message);
  }
};

module.exports = {
  send,
  activeProvider: PROVIDER,
};
