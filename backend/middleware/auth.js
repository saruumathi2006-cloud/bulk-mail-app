const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.admin = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

