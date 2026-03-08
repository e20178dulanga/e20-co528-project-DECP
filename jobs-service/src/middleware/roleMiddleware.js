/**
 * Role-based access control — Jobs Service
 * Usage: requireRole('alumni', 'admin')
 * Must be used after authMiddleware.
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { requireRole };
