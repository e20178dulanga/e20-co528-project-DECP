/**
 * Role-based access control middleware factory.
 * Usage: requireRole('admin') or requireRole('admin', 'alumni')
 *
 * Must be used AFTER authMiddleware (requires req.user to be set).
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
