const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middlewares/validation');
const authMiddleware = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later'
});

// Login route with rate limiting and validation
router.post('/login',
   loginLimiter, 
   validateLogin, 
   authController.login);

router.patch(
  '/change-password',
  authMiddleware.protect, // Ensure user is logged in
  authController.changePassword
);
module.exports = router;