const TournamentPlayer = require('../models/TournamentPlayer');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Add player to tournament
 * @route   POST /api/tournament-players/:tournamentId
 * @access  Private/Admin
 */
exports.addPlayerToTournament = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return next(new ErrorResponse('Player ID is required', 400));
    }

    const result = await TournamentPlayer.addPlayerToTournament(playerId, tournamentId);
    
    res.status(201).json({
      success: true,
      message: result.leagueAssigned 
        ? 'Player added to tournament and assigned to league' 
        : 'Player added to tournament but no suitable league available',
      data: result
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add multiple players to tournament
 * @route   POST /api/tournament-players/:tournamentId/bulk
 * @access  Private/Admin
 */
exports.addPlayersToTournament = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const { playerIds } = req.body;

    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return next(new ErrorResponse('Array of player IDs is required', 400));
    }

    await TournamentPlayer.addPlayersToTournament(tournamentId, playerIds);
    
    res.status(201).json({
      success: true,
      message: 'Players added to tournament successfully',
      data: { count: playerIds.length }
    });

  } catch (err) {
    console.log(err)
    next(err);
  }
};

/**
 * @desc    Remove player from tournament
 * @route   DELETE /api/tournament-players/:tournamentId/:playerId
 * @access  Private/Admin
 */
exports.removePlayerFromTournament = async (req, res, next) => {
  try {
    const { tournamentId, playerId } = req.params;

    const removed = await TournamentPlayer.removePlayerFromTournament(playerId, tournamentId);
    
    if (!removed) {
      return next(new ErrorResponse('Player not found in tournament', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Player removed from tournament successfully',
      data: { playerId, tournamentId }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all players in a tournament
 * @route   GET /api/tournament-players/:tournamentId
 * @access  Public
 */
exports.getTournamentPlayers = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    const players = await TournamentPlayer.getTournamentPlayers(tournamentId);
    
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
 * @desc    Get players NOT in a tournament
 * @route   GET /api/tournament-players/:tournamentId/available
 * @access  Private/Admin
 */
exports.getAvailablePlayersForTournament = async (req, res, next) => {
    
  try {
    const { tournamentId } = req.params;

    const players = await TournamentPlayer.getPlayersNotInTournament(tournamentId);
    
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
 * @desc    Get all tournaments for a player
 * @route   GET /api/tournament-players/player/:playerId
 * @access  Public
 */
exports.getPlayerTournaments = async (req, res, next) => {
  try {
    const { playerId } = req.params;

    const tournaments = await TournamentPlayer.getPlayerTournaments(playerId);
    
    res.status(200).json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Check if player is in tournament
 * @route   GET /api/tournament-players/:tournamentId/check/:playerId
 * @access  Public
 */
exports.checkPlayerInTournament = async (req, res, next) => {
  try {
    const { tournamentId, playerId } = req.params;

    const isMember = await TournamentPlayer.isPlayerInTournament(playerId, tournamentId);
    
    res.status(200).json({
      success: true,
      data: { isMember }
    });

  } catch (err) {
    next(err);
  }
};
  /**
 * @desc    Assign multiple players to a league (bulk operation)
 * @route   PUT /api/tournament-players/:tournamentId/bulk/league
 * @access  Private/Admin
 */
exports.assignPlayersToLeague = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;
    const { player_ids: playerIds, league_id: leagueId } = req.body;

    // Validation
    if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
      return next(new ErrorResponse('Array of player IDs is required', 400));
    }
    if (!leagueId || isNaN(leagueId)) {
      return next(new ErrorResponse('Valid league ID is required', 400));
    }

    // Call the model method to assign players to league
    const result = await TournamentPlayer.updateLeague(tournamentId, playerIds, leagueId);
    
    res.status(200).json({
      success: true,
      message: `Successfully assigned ${result.assignedCount} players to league`,
      data: result
    });

  } catch (err) {
    console.error('Error in assignPlayersToLeague:', err);
    next(err);
  }
};
/**
 * @desc    Remove all players from tournament
 * @route   DELETE /api/tournament-players/:tournamentId/clear
 * @access  Private/Admin
 */
exports.clearTournamentPlayers = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    const count = await TournamentPlayer.clearTournamentPlayers(tournamentId);
    
    res.status(200).json({
      success: true,
      message: 'All players removed from tournament',
      data: { count }
    });

  } catch (err) {
    console.log(err)
    next(err);
  }
};

/**
 * @desc    Get tournament player count
 * @route   GET /api/tournament-players/:tournamentId/count
 * @access  Public
 */
exports.getTournamentPlayerCount = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    const count = await TournamentPlayer.getTournamentPlayerCount(tournamentId);
    
    res.status(200).json({
      success: true,
      data: { count }
    });

  } catch (err) {
    next(err);
  }
};
/**
 * @desc    Remove player from league (set league_id to null)
 * @route   DELETE /api/tournament-players/:tournamentId/:playerId/league
 * @access  Private/Admin
 */
exports.removePlayerFromLeague = async (req, res, next) => {
  try {
    const { tournamentId, playerId } = req.params;

    // Call the updatePlayerLeague method with leagueId = null
    await TournamentPlayer.updatePlayerLeague(playerId, tournamentId, null);

    res.status(200).json({
      success: true,
      message: 'Player successfully removed from league',
      data: { playerId, tournamentId }
    });

  } catch (err) {
    console.error('Error in removePlayerFromLeague:', err);
    next(err);
  }
};