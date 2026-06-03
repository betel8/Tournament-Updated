const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentContoller');
const {
  validateTournament,
  validateTournamentId,
  checkTournamentExists
} = require('../middlewares/validation');

/**
 * Tournament Routes
 */

// Create a new tournament
router.post(
  '/',
  validateTournament, // Uses body validation for tournamentName, startDate, endDate
  tournamentController.createTournament
);

// Get all tournaments (optionally filtered by status)
router.get(
  '/',
  tournamentController.getAllTournaments
);

// Get a single tournament by ID
router.get(
  '/:tournamentId',
  validateTournamentId, // Validates the ID param
  checkTournamentExists, // Checks if tournament exists and attaches to req
  tournamentController.getTournament
);

// Update a tournament
router.put(
  '/:tournamentId',
  validateTournamentId, // Validates the ID param
  checkTournamentExists, // Checks if tournament exists
  validateTournament, // Validates the update data
  tournamentController.updateTournament
);

// Delete a tournament
router.delete(
  '/:tournamentId',
  validateTournamentId, // Validates the ID param
  checkTournamentExists, // Checks if tournament exists
  tournamentController.deleteTournament
);

module.exports = router;