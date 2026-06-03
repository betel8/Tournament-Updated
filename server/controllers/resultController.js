const Result = require('../models/Result');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

// REMOVED: exports.createResult - Results are created automatically with matches

/**
 * Gets all results with optional filtering
 */
exports.getAllResults = async (req, res, next) => {
  try {
    const { matchId, minGoals, maxGoals } = req.query;
    let results;

    if (matchId) {
      // Get result for specific match
      const result = await Result.findByMatchId(matchId);
      results = result ? [result] : [];
    } else if (minGoals !== undefined) {
      // Get results by goal range
      results = await Result.findByGoals(parseInt(minGoals), maxGoals ? parseInt(maxGoals) : null);
    } else {
      // Get all results
      results = await Result.findAll();
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets a single result by ID
 */
exports.getResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.resultId);

    if (!result) {
      throw new ErrorResponse('Result not found', 404);
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets result by match ID
 */
exports.getResultByMatch = async (req, res, next) => {
  try {
    const { matchId } = req.params;
    const result = await Result.findByMatchId(matchId);

    if (!result) {
      throw new ErrorResponse('Result not found for this match', 404);
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Updates a result
 */
exports.updateResult = async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const { resultId } = req.params;
    const updateData = req.body;

    // Additional business logic validation
    if (updateData.pOneGoal !== undefined && updateData.pOneGoal < 0) {
      throw new ErrorResponse('Player one goal must be non-negative', 400);
    }
    if (updateData.pTwoGoal !== undefined && updateData.pTwoGoal < 0) {
      throw new ErrorResponse('Player two goal must be non-negative', 400);
    }

    // Check if result exists
    const existingResult = await Result.findById(resultId);
    if (!existingResult) {
      throw new ErrorResponse('Result not found', 404);
    }

    const updated = await Result.update(resultId, updateData);
    
    if (!updated) {
      throw new ErrorResponse('Result update failed', 400);
    }

    const result = await Result.findById(resultId);

    res.status(200).json({
      success: true,
      message: 'Result updated successfully',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Resets result goals for a match (sets both goals to null)
 */
exports.resetResult = async (req, res, next) => {
  try {
    const { matchId } = req.params;

    // Check if result exists for this match
    const existingResult = await Result.findByMatchId(matchId);
    if (!existingResult) {
      throw new ErrorResponse('No result found for this match', 404);
    }

    const reset = await Result.reset(matchId);
    
    if (!reset) {
      throw new ErrorResponse('Result reset failed', 400);
    }

    const result = await Result.findByMatchId(matchId);

    res.status(200).json({
      success: true,
      message: 'Result goals reset successfully',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets match winner information
 */
exports.getMatchWinner = async (req, res, next) => {
  try {
    const { matchId } = req.params;

    const winner = await Result.getMatchWinner(matchId);

    let winnerMessage;
    if (winner === null) {
      winnerMessage = 'Match not completed or result not available';
    } else if (winner === 0) {
      winnerMessage = 'Match ended in a draw';
    } else {
      winnerMessage = `Player ${winner} won the match`;
    }

    res.status(200).json({
      success: true,
      data: {
        matchId,
        winner: winner,
        message: winnerMessage
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets total goals statistics
 */
exports.getTotalGoals = async (req, res, next) => {
  try {
    const stats = await Result.getTotalGoals();

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (err) {
    next(err);
  }
};