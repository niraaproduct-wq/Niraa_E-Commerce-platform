const jwt = require('jsonwebtoken');
const firebaseStorage = require('../utils/firebaseStorage');

const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user record to check status
    const user = await firebaseStorage.findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user account is suspended/blocked
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Access to your account has been suspended due to a violation of our Terms of Service."
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
  res.status(403).json({ message: 'Admin access required' });
};

// Legacy middleware name for backward compatibility
const requireAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user record to check status
    const user = await firebaseStorage.findUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Check if user account is suspended/blocked
    if (user.isActive === false) {
      return res.status(403).json({
        message: "Access to your account has been suspended due to a violation of our Terms of Service."
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = { protect, adminOnly, requireAuth };

