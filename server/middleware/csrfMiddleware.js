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
    sameSite: 'lax',
    path: '/'
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) => req.headers['x-csrf-token'],
  getSessionIdentifier: (req) => {
    const token = req.cookies?.niraa_token;
    if (token) {
      try {
        const decoded = jwt.verify(token, csrfSecret);
        if (decoded && decoded.id) {
          return decoded.id;
        }
      } catch (err) {
        // Ignore
      }
    }
    return 'anonymous';
  }
});

module.exports = {
  generateToken: generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError
};
