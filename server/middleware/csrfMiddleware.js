const { doubleCsrf } = require('csrf-csrf');
const jwt = require('jsonwebtoken');

const csrfSecret = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');

const {
  invalidCsrfTokenError,
  generateCsrfToken,
  doubleCsrfProtection
} = doubleCsrf({
  getSecret: () => csrfSecret,
  cookieName: 'niraa_csrf',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // 'none' is required for cross-origin requests with credentials
    // (e.g. niraacare.com → api.niraacare.com). 'lax' blocks the
    // cookie entirely on cross-site POST preflight, breaking CSRF token flow.
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
  getSessionIdentifier: (req) => {
    // Use the user id set by authMiddleware if the request is authenticated
    if (req.user?.id) return String(req.user.id);

    // For unauthenticated requests (login flow), read the JWT without
    // throwing — we only need the stable user id, not to verify signature here.
    // The authMiddleware does the full security verification separately.
    const token = req.cookies?.niraa_token;
    if (token) {
      try {
        const decoded = jwt.decode(token); // decode only, do NOT verify here
        if (decoded?.id) return String(decoded.id);
      } catch (_) { /* ignore */ }
    }
    return 'anonymous';
  }
});

module.exports = {
  generateToken: generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError
};
