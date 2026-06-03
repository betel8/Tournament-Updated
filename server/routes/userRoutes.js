const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// Player registration route
router.post(
  '/register',
  upload.single('avatar'),
  userController.register
);

// Phone number availability check
router.get(
  '/check-phone/:phoneNumber',
  userController.checkPhone
);

// Get user profile (protected route)
router.get(
  '/profile',
  authMiddleware.protect,
  userController.getProfile
);

// Update user profile (protected route)
router.put(
  '/profile',
  authMiddleware.protect,
  upload.single('avatar'),
  userController.updateProfile
);

// Get all players (protected route)
router.get(
  '/players', 
  authMiddleware.protect, 
  userController.getAllPlayers
);

// Get players by tournament (protected route)
router.get(
  '/players/tournament/:tournamentId', 
  authMiddleware.protect, 
  userController.getPlayersByTournament
);

// Update player profile (protected route - admin only)
router.put(
  '/players/:id',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  upload.single('avatar'),
  userController.updatePlayerProfile
);

// Delete player (protected route - admin only)
router.delete(
  '/players/:id',
  authMiddleware.protect,
  authMiddleware.authorize("admin"),
  userController.deletePlayer
);

module.exports = router;