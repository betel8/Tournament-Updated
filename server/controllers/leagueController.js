const League = require('../models/League');
const Tournament = require('../models/Tournament');
const TournamentPlayer = require('../models/TournamentPlayer');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const Match= require('../models/Match') 

/**
 * Creates a new league
 */
exports.createLeague = async (req, res, next) => {
  try {
    const { leaguename, tournament_id, match_day, start_time, max_players, min_strength, max_strength } = req.body;

    // Validate required fields
    if (!leaguename || !match_day || !start_time) {
      throw new ErrorResponse('League name, match day and start time are required', 400);
    }

    // Validate tournament exists if provided
    if (tournament_id) {
      const tournament = await Tournament.findById(tournament_id);
      if (!tournament) {
        throw new ErrorResponse('Specified tournament does not exist', 404);
      }
    }

    // Validate strength range
    if (min_strength !== undefined && max_strength !== undefined) {
      if (min_strength < 0 || max_strength > 100 || min_strength > max_strength) {
        throw new ErrorResponse('Invalid strength range (must be 0-100 and min ≤ max)', 400);
      }
    }

    // Create the league
    const leagueId = await League.create({
      leaguename,
      tournament_id: tournament_id || null,
      match_day,
      start_time,
      max_players: max_players || 16,
      min_strength: min_strength || 0,
      max_strength: max_strength || 100
    });

    // Get the created league for response
    const league = await League.findById(leagueId);

    res.status(201).json({
      success: true,
      message: 'League created successfully',
      data: league
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets all leagues
 */
exports.getAllLeagues = async (req, res, next) => {
  try {
    const { tournament_id, playerStrength } = req.query;
    let leagues;
    
    if (tournament_id && playerStrength) {
      // Get leagues matching tournament and player strength
      leagues = await League.findLeaguesByStrength(tournament_id, playerStrength);
    } else if (tournament_id) {
      // Get leagues for specific tournament
      leagues = await League.findByTournament(tournament_id);
    } else {
      // Get all leagues
      leagues = await League.findAll();
    }

    res.status(200).json({
      success: true,
      count: leagues.length,
      data: leagues
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets a single league by ID
 */
exports.getLeague = async (req, res, next) => {
  try {
    const league = await League.findById(req.params.id);

    if (!league) {
      throw new ErrorResponse('League not found', 404);
    }

    res.status(200).json({
      success: true,
      data: league
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Updates a league
 */
exports.updateLeague = async (req, res, next) => {
  
  try {
    const { leaguename, tournament_id, match_day, start_time, max_players, is_completed, min_strength, max_strength } = req.body;

    // Check if league exists
    const league = await League.findById(req.params.id);
    if (!league) {
      throw new ErrorResponse('League not found', 404);
    }

    // Validate strength range if provided
    if (min_strength !== undefined || max_strength !== undefined) {
      const newMin = min_strength !== undefined ? min_strength : league.min_strength;
      const newMax = max_strength !== undefined ? max_strength : league.max_strength;
      
      if (newMin > newMax) {
        throw new ErrorResponse('Min strength cannot be greater than max strength', 400);
      }
    }

    // Prepare update data
    const updateData = {
      leaguename,
      tournament_id,
      match_day,
      start_time,
      max_players,
      min_strength,
      max_strength,
      is_completed
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const updated = await League.update(req.params.id, updateData);

    if (!updated) {
      throw new ErrorResponse('League update failed', 400);
    }

    // Get updated league
    const updatedLeague = await League.findById(req.params.id);

    res.status(200).json({
      success: true,
      message: 'League updated successfully',
      data: updatedLeague
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a league
 */
exports.deleteLeague = async (req, res, next) => {
  try {
    const deleted = await League.delete(req.params.id);

    if (!deleted) {
      throw new ErrorResponse('League not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'League deleted successfully',
      data: { id: req.params.id }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Marks a league as completed
 */
exports.completeLeague = async (req, res, next) => {
  try {
    const updated = await League.completeLeague(req.params.id);

    if (!updated) {
      throw new ErrorResponse('League not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'League marked as completed',
      data: { id: req.params.id }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Get all players in a league
 */
exports.getLeaguePlayers = async (req, res, next) => {
  try {
    const players = await TournamentPlayer.getLeaguePlayers(req.params.id);

    res.status(200).json({
      success: true,
      count: players.length,
      data: players
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Add player to league
 */
exports.addPlayerToLeague = async (req, res, next) => {
  try {
    // Check if player already in league
    const existing = await TournamentPlayer.isPlayerInTournament(
      req.body.player_id,
      req.params.id
    );

    if (existing) {
      throw new ErrorResponse('Player already in this league', 400);
    }

    // Add player to league
    const result = await TournamentPlayer.addPlayerToTournament(
      req.body.player_id,
      req.params.id
    );

    if (!result.leagueAssigned) {
      throw new ErrorResponse('Player added but no suitable league found', 400);
    }

    // Get player details for response
    const player = await User.findById(req.body.player_id);

    res.status(201).json({
      success: true,
      message: 'Player added to league successfully',
      data: {
        ...player,
        status: 'confirmed',
        registration_date: new Date()
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Get available players for a specific round in a league
 * (Players not already assigned to matches in this round)
 */
exports.getAvailablePlayersForRound = async (req, res, next) => {
  
  try {
    const { id, round_level } = req.params;
    
    // 1. Get all players in the league
    const allPlayers = await TournamentPlayer.getLeaguePlayers(id);
    
    // 2. Get all matches in this league for the specified round
    const matches = await Match.getMatchesByLeagueAndRound(id, round_level);
    
    // 3. Find players already assigned in this round
    const assignedPlayerIds = matches.flatMap(match => [
      match.player_one_id, 
      match.player_two_id
    ]).filter(Boolean); // Remove null/undefined
    
    // 4. Filter out assigned players
    const availablePlayers = allPlayers.filter(player => 
      !assignedPlayerIds.includes(player.id)
    );
    
    res.status(200).json({
      success: true,
      count: availablePlayers.length,
      data: availablePlayers
    });
    
  } catch (err) {
    
    next(err);
  }
};