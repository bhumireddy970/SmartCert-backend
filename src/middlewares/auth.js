import jwt from 'jsonwebtoken';
export const verifyToken = (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Access Denied. No token provided.' });
  }
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trimLeft();
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_xyz_123');
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid Token' });
  }
};
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
export const authorizeOfficers = (req, res, next) => {
  if (!req.user || req.user.role === 'Student') {
    return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
  }
  next();
};
