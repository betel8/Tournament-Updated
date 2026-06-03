const Match = require('../models/Match');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Creates a new match in a league
 */
exports.createMatch = async (req, res, next) => {
  try {
    const { round_level, bracket_position, player_one_id, player_two_id, scheduled_time, league_id } = req.body;

    if (!round_level || !bracket_position || !league_id) {
      throw new ErrorResponse('Round level, bracket position and league ID are required', 400);
    }

    // Validate round level
    if (round_level < 1 || round_level > 4) {
      throw new ErrorResponse('Round level must be between 1 and 4', 400);
    }
    const matchId = await Match.create({
      round_level,
      bracket_position,
      player_one_id: player_one_id || null,
      player_two_id: player_two_id || null,
      scheduled_time: scheduled_time || null,
      league_id
    });
    const match = await Match.findById(matchId);

    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      data: match
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets match details by ID
 */
exports.getMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ErrorResponse('Match ID is required', 400);
    }

    const match = await Match.findById(id);

    if (!match) {
      throw new ErrorResponse('Match not found', 404);
    }

    res.status(200).json({
      success: true,
      data: match
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Updates match details
 */
exports.updateMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { player_one_id, player_two_id, scheduled_time, result, league_id } = req.body;

    if (!id) {
      throw new ErrorResponse('Match ID is required', 400);
    }

    const updateData = {
      playerOneId: player_one_id,
      playerTwoId: player_two_id,
      scheduledTime: scheduled_time,
      result,
      leagueId: league_id
    };

    const updated = await Match.update(id, updateData);

    if (!updated) {
      throw new ErrorResponse('Match update failed', 400);
    }

    const match = await Match.findById(id);

    res.status(200).json({
      success: true,
      message: 'Match updated successfully',
      data: match
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Sets match winner
 */
exports.setMatchWinner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { winner_id } = req.body;

    if (!id || !winner_id) {
      throw new ErrorResponse('Match ID and winner ID are required', 400);
    }

    const updated = await Match.setWinner(id, winner_id);

    if (!updated) {
      throw new ErrorResponse('Failed to set match winner', 400);
    }

    const match = await Match.findById(id);

    res.status(200).json({
      success: true,
      message: 'Match winner set successfully',
      data: match
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets all matches for a specific league and round
 */
exports.getMatchesByLeagueAndRound = async (req, res, next) => {
  try {
    const { id, round_level } = req.params; // Changed from league_id to id

    if (!id || !round_level || isNaN(round_level)) {
      throw new ErrorResponse('League ID and valid round level are required', 400);
    }

    const round = parseInt(round_level);
    if (round < 1 || round > 4) {
      throw new ErrorResponse('Round level must be between 1 and 4', 400);
    }

    const matches = await Match.findByLeagueAndRound(id, round); // Changed parameter

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets all matches for a specific league
 */
exports.getMatchesByLeague = async (req, res, next) => {
  try {
    const { id } = req.params; // Changed from league_id to id

    if (!id) {
      throw new ErrorResponse('League ID is required', 400);
    }

    const matches = await Match.findByLeagueId(id); // Changed parameter

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Initializes a 16-player knockout bracket for a league
 */
exports.initializeBracket = async (req, res, next) => {
  try {
    const { id, player_ids } = req.body; // Changed from league_id to id

    if (!id) {
      throw new ErrorResponse('League ID is required', 400);
    }

    if (!player_ids || !Array.isArray(player_ids) || player_ids.length !== 16) {
      throw new ErrorResponse('Exactly 16 player IDs are required', 400);
    }

    const initialized = await Match.initializeBracket(id, player_ids); // Changed parameter

    if (!initialized) {
      throw new ErrorResponse('Bracket initialization failed', 500);
    }

    const roundOf16Matches = await Match.findByLeagueAndRound(id, 1); // Changed parameter

    res.status(201).json({
      success: true,
      message: 'Bracket initialized successfully',
      data: {
        matches: roundOf16Matches,
        next_round: 1
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Advances winners to the next round in a league
 */
exports.advanceWinners = async (req, res, next) => {
  try {
    const { id, current_round } = req.body; // Changed from league_id to id

    if (!id) {
      throw new ErrorResponse('League ID is required', 400);
    }

    if (!current_round || isNaN(current_round)) {
      throw new ErrorResponse('Current round is required', 400);
    }

    const round = parseInt(current_round);
    if (round < 1 || round > 3) {
      throw new ErrorResponse('Can only advance from rounds 1-3', 400);
    }

    const advanced = await Match.advanceWinners(id, round); // Changed parameter

    if (!advanced) {
      throw new ErrorResponse('Failed to advance winners', 500);
    }

    const nextRound = round + 1;
    const nextRoundMatches = await Match.findByLeagueAndRound(id, nextRound); // Changed parameter

    res.status(200).json({
      success: true,
      message: `Winners advanced to round ${nextRound}`,
      data: {
        matches: nextRoundMatches,
        current_round: nextRound
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets complete bracket structure for a league
 */
exports.getCompleteBracket = async (req, res, next) => {
  try {
    const { id } = req.params; // Changed from league_id to id

    if (!id) {
      throw new ErrorResponse('League ID is required', 400);
    }

    const allRounds = await Promise.all([
      Match.findByLeagueAndRound(id, 1), // Changed parameter
      Match.findByLeagueAndRound(id, 2), // Changed parameter
      Match.findByLeagueAndRound(id, 3), // Changed parameter
      Match.findByLeagueAndRound(id, 4)  // Changed parameter
    ]);

    res.status(200).json({
      success: true,
      data: {
        round_of_16: allRounds[0],
        quarterfinals: allRounds[1],
        semifinals: allRounds[2],
        final: allRounds[3]
      }
    });

  } catch (err) {
    next(err);
  }
};
/**
 * Deletes a match by ID
 */
exports.deleteMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ErrorResponse('Match ID is required', 400);
    }

    // First check if the match exists
    const match = await Match.findById(id);
    if (!match) {
      throw new ErrorResponse('Match not found', 404);
    }

    const deleted = await Match.delete(id);

    if (!deleted) {
      throw new ErrorResponse('Match deletion failed', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Match deleted successfully',
      data: {
        id: id,
        league_id: match.league_id
      }
    });

  } catch (err) {
    next(err);
  }
};