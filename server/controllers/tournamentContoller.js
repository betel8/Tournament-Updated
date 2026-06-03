const Tournament = require('../models/Tournament');
const League = require('../models/League');
const ErrorResponse = require('../utils/errorResponse');
const { validationResult } = require('express-validator');

/**
 * League tiers auto-created with each tournament.
 * Each tier spans 10 strength points, descending from Legend (91-100) to Noob (61-70).
 */
const DEFAULT_LEAGUES = [
  { leaguename: 'Legend League',   min_strength: 91, max_strength: 100 },
  { leaguename: 'Champion League', min_strength: 81, max_strength: 90  },
  { leaguename: 'Pro League',      min_strength: 71, max_strength: 80  },
  { leaguename: 'Noob League',     min_strength: 61, max_strength: 70  },
];

/**
 * Creates a new tournament and optionally auto-creates the 4 default leagues.
 * auto_create_league defaults to true.
 *
 * League timing:
 *   match_day  → same day as tournament startDate
 *   start_time → 14:00:00 (2:00 PM fixed)
 */
exports.createTournament = async (req, res, next) => {
  // Validate request using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const {
      tournamentName,
      startDate,
      endDate,
      auto_create_league = true   // default ON
    } = req.body;

    // Date range validation
    if (new Date(endDate) < new Date(startDate)) {
      throw new ErrorResponse('End date must be after start date', 400);
    }

    // Create the tournament
    const tournamentId = await Tournament.create({
      tournamentName,
      startDate,
      endDate
    });

    const tournament = await Tournament.findById(tournamentId);

    // ── Auto-create leagues ───────────────────────────────────────────────────
    let leagues = [];

    if (auto_create_league) {
      // match_day = same day tournament starts
      // start_time = 14:00:00 (2:00 PM) fixed for all leagues
      const leagueCreatePromises = DEFAULT_LEAGUES.map((tier) =>
        League.create({
          leaguename:    tier.leaguename,
          tournament_id: tournamentId,
          match_day:     startDate,        // same day as tournament starts
          start_time:    '14:00:00',       // 2:00 PM fixed for all leagues
          max_players:   16,
          min_strength:  tier.min_strength,
          max_strength:  tier.max_strength,
        })
      );

      // Run all league inserts in parallel
      const leagueIds = await Promise.all(leagueCreatePromises);

      // Fetch full league records for the response
      leagues = await Promise.all(leagueIds.map((id) => League.findById(id)));
    }
    // ─────────────────────────────────────────────────────────────────────────

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      data: {
        ...tournament,
        leagues,                          // empty array when auto_create_league=false
      },
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Gets all tournaments with optional filtering
 */
exports.getAllTournaments = async (req, res, next) => {
  try {
    const { status } = req.query;
    let tournaments;

    if (status === 'upcoming') {
      tournaments = await Tournament.findUpcoming();
    } else if (status === 'active') {
      tournaments = await Tournament.findActive();
    } else {
      tournaments = await Tournament.findAll();
    }

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
 * Gets a single tournament by ID
 */
exports.getTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.tournamentId);

    if (!tournament) {
      throw new ErrorResponse('Tournament not found', 404);
    }

    res.status(200).json({
      success: true,
      data: tournament
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Updates a tournament
 */
exports.updateTournament = async (req, res, next) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }

  try {
    const { tournamentId } = req.params;
    const updateData = req.body;

    // Additional business logic validation
    if (updateData.endDate && updateData.startDate) {
      if (new Date(updateData.endDate) < new Date(updateData.startDate)) {
        throw new ErrorResponse('End date must be after start date', 400);
      }
    }

    // Check if tournament exists
    const existingTournament = await Tournament.findById(tournamentId);
    if (!existingTournament) {
      throw new ErrorResponse('Tournament not found', 404);
    }

    const updated = await Tournament.update(tournamentId, updateData);

    if (!updated) {
      throw new ErrorResponse('Tournament update failed', 400);
    }

    const tournament = await Tournament.findById(tournamentId);

    res.status(200).json({
      success: true,
      message: 'Tournament updated successfully',
      data: tournament
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a tournament
 */
exports.deleteTournament = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      throw new ErrorResponse('Tournament not found', 404);
    }

    const deleted = await Tournament.delete(tournamentId);

    if (!deleted) {
      throw new ErrorResponse('Tournament deletion failed', 400);
    }

    res.status(200).json({
      success: true,
      message: 'Tournament deleted successfully',
      data: { tournamentId }
    });

  } catch (err) {
    next(err);
  }
};