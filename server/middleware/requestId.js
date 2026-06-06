const { v4: uuidv4 } = require('uuid');

/**
 * Middleware that assigns a unique request ID to every incoming request.
 * - Checks for an existing `X-Request-ID` header (e.g. from Vercel/Cloudflare).
 * - Falls back to generating a UUID v4.
 * - Attaches it to `req.id` and sets `X-Request-ID` response header.
 */
const requestId = (req, res, next) => {
  const id = req.headers['x-request-id'] || uuidv4();
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
};

module.exports = requestId;
