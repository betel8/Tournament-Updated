const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const {
  validateResult,
  validateResultId,
  validateMatchId,
  checkResultExists,
  checkResultByMatchExists,
  checkMatchExistsForResult,
  validateGoalValues
} = require('../middlewares/validation');

/**
 * Result Routes
 */

// REMOVED: POST / - Create result (results are created automatically with matches)

// Get all results
router.get(
  '/',
  resultController.getAllResults
);

// Get a single result by ID
router.get(
  '/:resultId',
  validateResultId,
  checkResultExists,
  resultController.getResult
);

// Get result by match ID
router.get(
  '/match/:matchId',
  validateMatchId,
  checkMatchExistsForResult, // Check if match exists
  checkResultByMatchExists, // Check if result exists for this match
  resultController.getResultByMatch
);

// Get match winner information
router.get(
  '/match/:matchId/winner',
  validateMatchId,
  checkMatchExistsForResult, // Check if match exists
  resultController.getMatchWinner
);

// Get total goals statistics
router.get(
  '/stats/goals',
  resultController.getTotalGoals
);

// Update a result
router.put(
  '/:resultId',
  validateResultId,
  checkResultExists,
  validateResult,
  validateGoalValues, // Validate goal values consistency
  resultController.updateResult
);

// Reset result goals for a match
router.patch(
  '/match/:matchId/reset',
  validateMatchId,
  checkMatchExistsForResult, // Check if match exists
  checkResultByMatchExists, // Check if result exists for this match
  resultController.resetResult
);

module.exports = router;