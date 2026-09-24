/**
 * Role-based access control middleware
 * @param  {...string} roles Allowed roles ('student', 'librarian')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${roles.join(', ')} only. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

module.exports = authorize;
