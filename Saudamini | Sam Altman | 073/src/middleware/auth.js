const { verifyToken } = require('../utils/jwt');
const { db } = require('../config/firebase');

/**
 * JWT Authentication Middleware
 * Checks for Bearer token in Authorization header, verifies it,
 * and attaches authenticated user data to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Malformed token.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please login again.',
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.',
      });
    }

    // Verify user exists in Firestore
    const userDoc = await db.collection('users').doc(decoded.userId).get();
    if (!userDoc.exists) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    const userData = userDoc.data();
    req.user = {
      userId: userDoc.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    };

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication internal error',
      error: error.message,
    });
  }
};

module.exports = authenticate;
