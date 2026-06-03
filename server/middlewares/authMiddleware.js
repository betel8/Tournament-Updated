const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

module.exports = {
  // Protect routes - require authentication
  protect: async (req, res, next) => {
    let token;
    
    // 1. Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      // 2. Verify token with proper error handling
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'] // Explicitly specify algorithm
      });

      // 3. Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ErrorResponse('User no longer exists', 401));
      }

      // 4. Attach user to request
      req.user = user;
      next();
      
    } catch (err) {
      // Specific error handling
      if (err.name === 'JsonWebTokenError') {
        return next(new ErrorResponse('Invalid token signature', 401));
      }
      if (err.name === 'TokenExpiredError') {
        return next(new ErrorResponse('Token has expired', 401));
      }
      return next(new ErrorResponse('Not authorized', 401));
    }
  },

  // Role-based authorization
  authorize: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ErrorResponse(`User role ${req.user.role} is not authorized`, 403)
        );
      }
      next();
    };
  }
};