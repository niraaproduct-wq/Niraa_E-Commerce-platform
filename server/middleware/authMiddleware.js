const jwt = require('jsonwebtoken');
const firebaseStorage = require('../utils/firebaseStorage');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  const bearer = req.header('Authorization')?.replace('Bearer ', '');
  const cookieToken = req.cookies?.niraa_token;
  const token = cookieToken || bearer;
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user record from appropriate collection based on role
    let user;
    if (decoded.role === 'admin') {
      user = await firebaseStorage.findAdminById(decoded.id);
    } else {
      user = await firebaseStorage.findUserById(decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user account is suspended/blocked
    if (user.isActive === false) {
      return res.status(403).json({
        message: 'Access to your account has been suspended due to a violation of our Terms of Service.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  logger.warn(`[Auth] 403 Forbidden: User ${req.user?.id} has role '${req.user?.role}', but admin is required.`, {
    userId: req.user?.id,
    role: req.user?.role,
    path: req.originalUrl
  });
  res.status(403).json({ message: 'Admin access required' });
};

// Legacy middleware name for backward compatibility
const requireAuth = protect;

module.exports = { protect, adminOnly, requireAuth };
