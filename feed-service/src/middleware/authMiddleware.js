const jwt = require('jsonwebtoken');

/**
 * SOA Auth Middleware — Feed Service
 *
 * Verifies the Bearer JWT token locally using the shared JWT_SECRET.
 * No HTTP call to the Auth Service (port 5000) is made.
 * The token was issued by the Auth Service and is fully self-contained.
 *
 * Attaches decoded payload to req.user: { id, iat, exp }
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided. Please authenticate via the Auth Service (POST /api/auth/login on port 5000).',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user identity (id + name from token claims)
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;
