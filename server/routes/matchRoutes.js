const express = require('express');
const router = express.Router();
const matchesController = require('../controllers/matchController');
const validation = require('../middlewares/validation');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new match
router.post(
  '/',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validation.validateCreateMatch,
  validation.checkPlayerExistsForMatch,
  matchesController.createMatch
);

// Get match by ID
router.get(
  '/:id',
  authMiddleware.protect,
  validation.validateMatchId,
  validation.checkMatchExists,
  matchesController.getMatch
);

// Update match
router.put(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validation.validateMatchId,
  validation.validateUpdateMatch,
  validation.checkMatchExists,
  validation.checkPlayerExistsForMatch,
  matchesController.updateMatch
);

// Set match winner
router.put(
  '/:id/winner',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validation.validateMatchId,
  validation.validateSetMatchWinner,
  validation.checkMatchExists,
  validation.checkPlayerExistsForMatch,
  matchesController.setMatchWinner
);

// Delete match
router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validation.validateMatchId,
  validation.checkMatchExists,
  matchesController.deleteMatch
);

// Get matches by league ID
router.get(
  '/league/:id',
  validation.validateLeagueId,
  validation.checkLeagueExists,
  matchesController.getMatchesByLeague
);

// Get matches by league and round
router.get(
  '/league/:id/round/:round_level',
  authMiddleware.protect,
  validation.validateLeagueId,
  validation.validateRoundLevel,
  validation.checkLeagueExists,
  matchesController.getMatchesByLeagueAndRound
);

// Initialize bracket
router.post(
  '/initialize-bracket',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validation.validateInitializeBracket,
  matchesController.initializeBracket
);

// Advance winners
router.post(
  '/advance-winners',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validation.validateAdvanceWinners,
  matchesController.advanceWinners
);

// Get complete bracket
router.get(
  '/league/:id/complete-bracket',
  authMiddleware.protect,
  validation.validateLeagueId,
  validation.checkLeagueExists,
  matchesController.getCompleteBracket
);

module.exports = router;