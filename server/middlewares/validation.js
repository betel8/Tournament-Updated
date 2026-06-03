const { body, param, validationResult } = require('express-validator');
const { ErrorResponse } = require('../utils/errorResponse');

// Models from both files (duplicates removed)
const Tournament = require('../models/Tournament');
const League = require('../models/League');
const TournamentPlayer = require('../models/TournamentPlayer');
const User = require('../models/User');
const Match=require('../models/Match')
const Result=require('../models/Result')

// --- Validations ---

// Login Validation (from file 1)
exports.validateLogin = [
  body('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Tournament Validation (from file 1)
exports.validateTournament = [
  // Tournament name validation
  body('tournamentName')
    .trim()
    .notEmpty().withMessage('Tournament name is required')
    .isLength({ max: 255 }).withMessage('Tournament name cannot exceed 255 characters'),

  // Start date validation
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // strip time — compare dates only
      if (new Date(value) < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  // End date validation
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('Invalid end date format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Tournament ID Validation (using 'id' param) (from file 1)
exports.validateTournamentId = [
  param('id')
    .notEmpty().withMessage('Tournament ID is required')
    .isInt({ min: 1 }).withMessage('Invalid tournament ID')
];

// League Validation (from file 1)
exports.validateLeague = [
  // League name validation
  body('leaguename')
    .trim()
    .notEmpty().withMessage('League name is required')
    .isLength({ max: 255 }).withMessage('League name cannot exceed 255 characters'),

  // Tournament ID validation (optional)
  body('tournament_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid tournament ID'),

  // Match day validation
  body('match_day')
    .notEmpty().withMessage('Match day is required')
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DD)')
    .custom((value, { req }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // strip time — compare dates only
      if (new Date(value) < today) {
        throw new Error('Match day cannot be in the past');
      }
      return true;
    }),

  // Start time validation
  body('start_time')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid time format (HH:MM)'),

  // Max players validation
  body('max_players')
    .optional()
    .isInt({ min: 2, max: 32 }).withMessage('Max players must be between 2 and 32')
];

// League ID Validation (using 'id' param) (from file 1)
exports.validateLeagueId = [
  param('id')
    .notEmpty().withMessage('League ID is required')
    .isInt({ min: 1 }).withMessage('Invalid league ID')
];

// Complete League Validation (using 'id' param) (from file 1)
exports.validateCompleteLeague = [
  param('id')
    .notEmpty().withMessage('League ID is required')
    .isInt({ min: 1 }).withMessage('Invalid league ID'),
  body('is_completed')
    .optional()
    .isBoolean().withMessage('Completion status must be true or false')
];

// Add Single Player to Tournament Validation (from file 2)
exports.validateAddPlayerToTournament = [
  // Tournament ID validation
  param('tournamentId')
    .notEmpty().withMessage('Tournament ID is required')
    .isInt({ min: 1 }).withMessage('Invalid tournament ID'),

  // Player ID validation
  body('playerId')
    .notEmpty().withMessage('Player ID is required')
    .isInt({ min: 1 }).withMessage('Invalid player ID')
];

// Add Multiple Players to Tournament Validation (from file 2)
exports.validateAddPlayersToTournament = [
  // Tournament ID validation
  param('tournamentId')
    .notEmpty().withMessage('Tournament ID is required')
    .isInt({ min: 1 }).withMessage('Invalid tournament ID'),

  // Player IDs validation
  body('playerIds')
    .notEmpty().withMessage('Player IDs array is required')
    .isArray({ min: 1 }).withMessage('Must provide an array of player IDs'),

  body('playerIds.*')
    .isInt({ min: 1 }).withMessage('Each player ID must be a positive integer')
];

// Remove Player from Tournament Validation (from file 2)
exports.validateRemovePlayerFromTournament = [
  // Tournament ID validation
  param('tournamentId')
    .notEmpty().withMessage('Tournament ID is required')
    .isInt({ min: 1 }).withMessage('Invalid tournament ID'),

  // Player ID validation
  param('playerId')
    .notEmpty().withMessage('Player ID is required')
    .isInt({ min: 1 }).withMessage('Invalid player ID')
];

// Tournament ID Param Validation (using 'tournamentId' param) (from file 2)
exports.validateTournamentIdParam = [
  param('tournamentId')
    .notEmpty().withMessage('Tournament ID is required')
    .isInt({ min: 1 }).withMessage('Invalid tournament ID')
];

// Player ID Param Validation (using 'playerId' param) (from file 2)
exports.validatePlayerIdParam = [
  param('playerId')
    .notEmpty().withMessage('Player ID is required')
    .isInt({ min: 1 }).withMessage('Invalid player ID')
];
/**
 * Validate player ID (for request body)
 */
exports.validatePlayerId = [
  body('player_id')
    .notEmpty().withMessage('Player ID is required')
    .isInt({ min: 1 }).withMessage('Invalid player ID')
];

// --- Middleware Functions ---

// Check if tournament exists (uses req.params.id) (from file 1)
exports.checkTournamentExists = async (req, res, next) => {
  
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return next(new ErrorResponse('Tournament not found', 404));
    }
    req.tournament = tournament; // Attach tournament to request object
    next();
  } catch (error) {
    console.log("validation",error)
    next(error);
  }
};
/**
 * Check league capacity before adding player
 */
exports.checkLeagueCapacity = async (req, res, next) => {
  try {
    const playerCount = await TournamentPlayer.count({
      where: { league_id: req.params.id }
    });
    
    const league = await League.findByPk(req.params.id);
    
    if (playerCount >= league.max_players) {
      return next(new ErrorResponse(
        `League has reached maximum capacity of ${league.max_players} players`,
        400
      ));
    }
    next();
  } catch (error) {
    next(error);
  }
};
// Check if league exists (uses req.params.id) (from file 1)
exports.checkLeagueExists = async (req, res, next) => {
  try {
    
    const league = await League.findById(req.params.id);
    if (!league) {
      return next(new ErrorResponse('League not found', 404));
    }
    req.league = league; // Attach league to request object
    next();
  } catch (error) {
    next(error);
  }
};

// Check if tournament exists for league (if provided) (from file 1)
exports.checkTournamentForLeague = async (req, res, next) => {
  try {
    if (req.body.tournament_id) {
      const tournament = await Tournament.findById(req.body.tournament_id);
      if (!tournament) {
        return next(new ErrorResponse('Specified tournament does not exist', 404));
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Check if player exists and is actually a player (uses req.params.playerId or req.body.playerId) (from file 2)
exports.checkPlayerExists = async (req, res, next) => {
  try {
    // Determine player ID from params or body
    const playerId = req.params.playerId || req.body.playerId;
    if (!playerId) {
         return next(new ErrorResponse('Player ID not provided in params or body', 400));
    }
    const player = await User.findById(playerId);
    if (!player) {
      return next(new ErrorResponse('Player not found', 404));
    }
    if (player.role !== 'player') {
      return next(new ErrorResponse('Specified user is not a player', 400));
    }
    req.player = player; // Attach player to request object
    next();
  } catch (error) {
    next(error);
  }
};

// Check if tournament exists (uses req.params.tournamentId) (from file 2 - RENAMED)
// NOTE: This was renamed from checkTournamentExists to avoid collision with the one from file 1
// which uses req.params.id instead of req.params.tournamentId.
exports.checkTournamentExistsByTournamentId = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      return next(new ErrorResponse('Tournament not found', 404));
    }
    req.tournament = tournament; // Attach tournament to request object
    next();
  } catch (error) {
    next(error);
  }
};

// Check if player is already in tournament (uses req.params.playerId/req.body.playerId and req.params.tournamentId) (from file 2)
exports.checkPlayerNotInTournament = async (req, res, next) => {
  try {
    // Determine player ID from params or body
    const playerId = req.params.playerId || req.body.playerId;
     if (!playerId) {
         return next(new ErrorResponse('Player ID not provided in params or body', 400));
    }
    const exists = await TournamentPlayer.isPlayerInTournament(
      playerId,
      req.params.tournamentId
    );
    if (exists) {
      return next(new ErrorResponse('Player is already in this tournament', 400));
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Check if player is in tournament (for removal) (uses req.params.playerId and req.params.tournamentId) (from file 2)
exports.checkPlayerInTournament = async (req, res, next) => {
  try {
    const exists = await TournamentPlayer.isPlayerInTournament(
      req.params.playerId,
      req.params.tournamentId
    );
    if (!exists) {
      return next(new ErrorResponse('Player is not in this tournament', 404));
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Check tournament player limit (uses req.params.tournamentId and req.body.playerIds or implicitly 1 player) (from file 2)
exports.checkTournamentPlayerLimit = async (req, res, next) => {
  try {
    // Reuse tournament object if already fetched by another middleware
    const tournament = req.tournament || await Tournament.findById(req.params.tournamentId);
    if (!tournament) {
      // This check might be redundant if checkTournamentExistsByTournamentId runs first, but safe to keep.
      return next(new ErrorResponse('Tournament not found', 404));
    }
     // Ensure req.tournament is set for subsequent middleware if it wasn't already
    if (!req.tournament) {
        req.tournament = tournament;
    }

    const currentCount = await TournamentPlayer.getTournamentPlayerCount(req.params.tournamentId);
    // Check if adding single player (body.playerId) or multiple (body.playerIds)
    const playersToAdd = Array.isArray(req.body.playerIds)
                            ? req.body.playerIds.length
                            : (req.body.playerId ? 1 : 0); // If neither is present, adding 0

    if (playersToAdd > 0 && tournament.max_players && (currentCount + playersToAdd) > tournament.max_players) {
      return next(new ErrorResponse(
        `Cannot add players - tournament would exceed maximum of ${tournament.max_players} players. Currently ${currentCount} players.`,
        400
      ));
    }

    next();
  } catch (error) {
    next(error);
  }
};
// --- Match Validations ---

/**
 * Validate match creation
 */
exports.validateCreateMatch = [
  body('round_level')
    .notEmpty().withMessage('Round level is required')
    .isInt({ min: 1, max: 4 }).withMessage('Round level must be between 1 and 4'),
  
  body('bracket_position')
    .notEmpty().withMessage('Bracket position is required')
    .isInt({ min: 1 }).withMessage('Bracket position must be a positive integer'),
  
  body('player_one_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Player one ID must be a positive integer'),
  
  body('player_two_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Player two ID must be a positive integer'),
  
  body('scheduled_time')
    .optional()
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DDTHH:MM:SSZ)')
];

/**
 * Validate match ID in params
 */
exports.validateMatchId = [
  param('id')
    .notEmpty().withMessage('Match ID is required')
    .isInt({ min: 1 }).withMessage('Match ID must be a positive integer')
];

/**
 * Validate match update
 */
exports.validateUpdateMatch = [
  param('id')
    .notEmpty().withMessage('Match ID is required')
    .isInt({ min: 1 }).withMessage('Match ID must be a positive integer'),
  
  body('player_one_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Player one ID must be a positive integer'),
  
  body('player_two_id')
    .optional()
    .isInt({ min: 1 }).withMessage('Player two ID must be a positive integer'),
  
  body('scheduled_time')
    .optional()
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DDTHH:MM:SSZ)'),
  
  body('result')
    .optional()
    .isString().withMessage('Result must be a string')
];

/**
 * Validate setting match winner
 */
exports.validateSetMatchWinner = [
  param('id')
    .notEmpty().withMessage('Match ID is required')
    .isInt({ min: 1 }).withMessage('Match ID must be a positive integer'),
  
  body('winner_id')
    .notEmpty().withMessage('Winner ID is required')
    .isInt({ min: 1 }).withMessage('Winner ID must be a positive integer')
];

/**
 * Validate getting matches by round
 */
exports.validateRoundLevel = [
  param('round_level')
    .notEmpty().withMessage('Round level is required')
    .isInt({ min: 1, max: 4 }).withMessage('Round level must be between 1 and 4')
];

/**
 * Validate bracket initialization
 */
exports.validateInitializeBracket = [
  body('player_ids')
    .notEmpty().withMessage('Player IDs are required')
    .isArray({ min: 16, max: 16 }).withMessage('Exactly 16 player IDs are required'),
  
  body('player_ids.*')
    .isInt({ min: 1 }).withMessage('Each player ID must be a positive integer')
];

/**
 * Validate advancing winners
 */
exports.validateAdvanceWinners = [
  body('current_round')
    .notEmpty().withMessage('Current round is required')
    .isInt({ min: 1, max: 3 }).withMessage('Current round must be between 1 and 3')
];

// --- Match Middleware Functions ---

/**
 * Check if match exists
 */
exports.checkMatchExists = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return next(new ErrorResponse('Match not found', 404));
    }
    req.match = match; // Attach match to request object
    next();
  } catch (error) {
    console
    next(error);
  }
};

/**
 * Check if player exists (for match operations)
 */
exports.checkPlayerExistsForMatch = async (req, res, next) => {
  try {
    const playerId = req.body.player_one_id || req.body.player_two_id || req.body.winner_id;
    if (!playerId) {
      return next();
    }
    
    const player = await User.findById(playerId);
    if (!player) {
      return next(new ErrorResponse('Player not found', 404));
    }
    if (player.role !== 'player') {
      return next(new ErrorResponse('Specified user is not a player', 400));
    }
    next();
  } catch (error) {
    next(error);
  }
};
// Add these to your validation.js file

exports.validateResult = [
  body('pOneGoal')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Player one goal must be a non-negative integer'),
  body('pTwoGoal')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Player two goal must be a non-negative integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }
    next();
  }
];

exports.validateResultId = [
  param('resultId')
    .isInt({ min: 1 })
    .withMessage('Valid result ID is required')
    .customSanitizer(value => {
      // Convert to integer and validate
      
      const parsed = parseInt(value, 10);
      if (isNaN(parsed) || parsed < 1) {
        throw new Error('Valid result ID is required');
      }
      return parsed; // Return the parsed integer
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return next(new ErrorResponse(errors.array()[0].msg, 400));
    }
    next();
  }
];


exports.checkResultExists = async (req, res, next) => {
  try {
    const resultId = parseInt(req.params.resultId);
    
    if (isNaN(resultId)) {
      return next(new ErrorResponse('Invalid result ID format', 400));
    }
    const result = await Result.findById(resultId);
    if (!result) {
      return next(new ErrorResponse('Result not found', 404));
    }
    req.result = result;
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkResultByMatchExists = async (req, res, next) => {
  try {
    const result = await Result.findByMatchId(req.params.matchId);
    if (!result) {
      return next(new ErrorResponse('Result not found for this match', 404));
    }
    req.result = result; // Attach result to request object
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkMatchExistsForResult = async (req, res, next) => {
  
  try {
    const matchesId = req.body.matchesId || req.params.matchId;
    if (!matchesId) {
      return next();
    }
    
    const match = await Match.findById(matchesId);
    if (!match) {
      return next(new ErrorResponse('Match not found', 404));
    }
    req.match = match; // Attach match to request object
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkResultNotExistsForMatch = async (req, res, next) => {
  
  try {
    const matchesId = req.body.matchesId;
    if (!matchesId) {
      return next();
    }
    
    const existingResult = await Result.findByMatchId(matchesId);
    if (existingResult) {
      return next(new ErrorResponse('Result already exists for this match', 400));
    }
    next();
  } catch (error) {
    next(error);
  }
};

exports.validateGoalValues = async (req, res, next) => {
 
  try {
    const { pOneGoal, pTwoGoal } = req.body;
    
    // Check if both goals are provided or both are null
    if ((pOneGoal === null && pTwoGoal !== null) || (pOneGoal !== null && pTwoGoal === null)) {
      return next(new ErrorResponse('Both goals must be provided or both must be null', 400));
    }
    
    // Check if match is completed (both goals are numbers)
    if (pOneGoal !== null && pTwoGoal !== null) {
      if (pOneGoal < 0 || pTwoGoal < 0) {
        return next(new ErrorResponse('Goals cannot be negative', 400));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};