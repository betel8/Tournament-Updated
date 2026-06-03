const express = require('express');
const router = express.Router();
const tournamentPlayerController = require('../controllers/tournamentPlayerController');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  validateAddPlayerToTournament,
  validateAddPlayersToTournament,
  validateRemovePlayerFromTournament,
  validateTournamentIdParam,
  validatePlayerIdParam,
  checkPlayerExists,
  checkTournamentExists,
  checkPlayerNotInTournament,
  checkPlayerInTournament,
  checkTournamentPlayerLimit
} = require('../middlewares/validation');

// ─────────────────────────────────────────────
// POST ROUTES
// ─────────────────────────────────────────────

// Add player to tournament (protected route - admin only)
router.post(
  '/:tournamentId',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateAddPlayerToTournament,
  checkTournamentExists,
  checkPlayerExists,
  checkPlayerNotInTournament,
  checkTournamentPlayerLimit,
  tournamentPlayerController.addPlayerToTournament
);

// Add multiple players to tournament (protected route - admin only)
router.post(
  '/:tournamentId/bulk',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateAddPlayersToTournament,
  checkTournamentExists,
  checkTournamentPlayerLimit,
  tournamentPlayerController.addPlayersToTournament
);

// ─────────────────────────────────────────────
// PUT ROUTES
// ─────────────────────────────────────────────

// Assign multiple players to a league (bulk operation)
router.put(
  '/:tournamentId/bulk/league',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateTournamentIdParam,
  checkTournamentExists,
  tournamentPlayerController.assignPlayersToLeague
);

// ─────────────────────────────────────────────
// GET ROUTES — specific before dynamic
// ─────────────────────────────────────────────

// Get all tournaments for a player (public route)
router.get(
  '/player/:playerId',
  validatePlayerIdParam,
  checkPlayerExists,
  tournamentPlayerController.getPlayerTournaments
);

// Get players NOT in a tournament (protected route - admin only)
router.get(
  '/:tournamentId/available',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateTournamentIdParam,
  checkTournamentExists,
  tournamentPlayerController.getAvailablePlayersForTournament
);

// Get tournament player count (public route)
router.get(
  '/:tournamentId/count',
  validateTournamentIdParam,
  checkTournamentExists,
  tournamentPlayerController.getTournamentPlayerCount
);

// Check if player is in tournament (public route)
router.get(
  '/:tournamentId/check/:playerId',
  validateTournamentIdParam,
  validatePlayerIdParam,
  checkTournamentExists,
  checkPlayerExists,
  tournamentPlayerController.checkPlayerInTournament
);

// Get all players in a tournament (public route)
router.get(
  '/:tournamentId',
  validateTournamentIdParam,
  checkTournamentExists,
  tournamentPlayerController.getTournamentPlayers
);

// ─────────────────────────────────────────────
// DELETE ROUTES — specific before dynamic
// ─────────────────────────────────────────────

// Remove all players from tournament (protected route - admin only)
router.delete(
  '/:tournamentId/clear',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateTournamentIdParam,
  checkTournamentExists,
  tournamentPlayerController.clearTournamentPlayers
);

// Remove player from league (protected route - admin only)
router.delete(
  '/:tournamentId/:playerId/league',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateTournamentIdParam,
  validatePlayerIdParam,
  checkTournamentExists,
  checkPlayerExists,
  checkPlayerInTournament,
  tournamentPlayerController.removePlayerFromLeague
);

// Remove player from tournament (protected route - admin only)
router.delete(
  '/:tournamentId/:playerId',
  authMiddleware.protect,
  authMiddleware.authorize('admin'),
  validateRemovePlayerFromTournament,
  checkTournamentExists,
  checkPlayerExists,
  checkPlayerInTournament,
  tournamentPlayerController.removePlayerFromTournament
);

module.exports = router;