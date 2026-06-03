const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;

    // 1. Validate input
    if (!phoneNumber || !password) {
      return next(new ErrorResponse('Phone number and password are required', 400));
    }

    // 2. Find user by phone number
    const user = await User.findByPhone(phoneNumber);
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // 3. Verify password
    const isMatch = await User.comparePasswords(password, user.password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // 4. Generate JWT token with explicit algorithm
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_EXPIRE || '7d',
        algorithm: 'HS256' // Explicitly set algorithm
      }
    );

    // 5. Send response (excluding sensitive data)
    res.status(200).json({
      success: true,
      token,
      data: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    next(new ErrorResponse('Server error', 500));
  }
};
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Secure password verification
    const user = await User.findWithPassword(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordCorrect = await User.comparePasswords(
      currentPassword, 
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const isUpdated = await User.changePassword(userId, newPassword);
    
    if (!isUpdated) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update password'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });

  } catch (err) {
    next(err);
  }
  
};