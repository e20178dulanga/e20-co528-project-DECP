const jwt = require('jsonwebtoken');

/**
 * SOA Auth Middleware — Jobs Service
 * Verifies Bearer JWT locally using shared JWT_SECRET.
 * No HTTP call to Auth Service (port 5000).
 * Attaches { id, name, role } to req.user.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided. Authenticate via the Auth Service (port 5000).',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, name, role, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
