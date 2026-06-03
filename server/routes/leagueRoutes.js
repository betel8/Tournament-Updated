const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  validateLeague,
  validateLeagueId,
  validateCompleteLeague,
  checkLeagueExists,
  checkTournamentForLeague,
  validatePlayerIdParam,
} = require('../middlewares/validation');

// Create new league (protected - admin only)
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateLeague,
  checkTournamentForLeague,
  leagueController.createLeague
);

// Get all leagues (with optional tournament filter)
router.get(
  '/',
  leagueController.getAllLeagues
);

// Get single league by ID
router.get(
  '/:id',
  validateLeagueId,
  checkLeagueExists,
  leagueController.getLeague
);

// Update league (protected - admin only)
router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateLeagueId,
  checkLeagueExists,
  validateLeague,
  checkTournamentForLeague,
  leagueController.updateLeague
);

// Delete league (protected - admin only)
router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateLeagueId,
  checkLeagueExists,
  leagueController.deleteLeague
);

// Get all players in a league
router.get(
  '/:id/players',
  validateLeagueId,
  checkLeagueExists,
  leagueController.getLeaguePlayers
);

// Get available players for a specific round in a league
router.get(
  '/:id/round/:round_level/available-players',
  validateLeagueId,
  checkLeagueExists,
  leagueController.getAvailablePlayersForRound
);

// Mark league as completed (protected - admin only)
router.patch(
  '/:id/complete',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateLeagueId,
  checkLeagueExists,
  validateCompleteLeague,
  leagueController.completeLeague
);


module.exports = router;