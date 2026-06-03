const pool = require('../config/db');

class TournamentPlayer {
  /**
   * Add a player to a tournament and assign to matching league
   * @param {number} playerId - ID of the player
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<object>} - Returns insertion result with league assignment info
   */
  static async addPlayerToTournament(playerId, tournamentId) {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Verify player exists and get strength
      const [playerRows] = await connection.execute(
        `SELECT id, strength FROM users 
         WHERE id = ? AND role = 'player'`,
        [playerId]
      );

      if (playerRows.length === 0) {
        throw new Error('Player not found or not a player role');
      }

      const playerStrength = playerRows[0].strength;

      // 2. Find suitable league with available spots
      const [leagueRows] = await connection.execute(
        `SELECT l.id FROM leagues l
         LEFT JOIN (
           SELECT league_id, COUNT(*) as player_count 
           FROM player_tournaments 
           GROUP BY league_id
         ) pt ON l.id = pt.league_id
         WHERE l.tournament_id = ?
         AND ? BETWEEN l.min_strength AND l.max_strength
         AND (pt.player_count IS NULL OR pt.player_count < l.max_players)
         ORDER BY l.min_strength DESC
         LIMIT 1`,
        [tournamentId, playerStrength]
      );

      const leagueId = leagueRows[0]?.id || null;

      // 3. Insert the tournament-player-league relationship
      const [result] = await connection.execute(
        `INSERT INTO player_tournaments 
         (player_id, tournament_id, league_id, status) 
         VALUES (?, ?, ?, 'confirmed')`,
        [playerId, tournamentId, leagueId]
      );

      await connection.commit();

      return {
        id: result.insertId,
        playerId,
        tournamentId,
        leagueId,
        leagueAssigned: leagueId !== null,
        playerStrength
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  /**
 * Update league assignment for multiple players in bulk
 * @param {number} tournamentId - ID of the tournament
 * @param {number[]} playerIds - Array of player IDs to update
 * @param {number} leagueId - ID of the league to assign
 * @returns {Promise<object>} - Returns assignment results
 */
/**
 * Update league assignment for multiple players in bulk
 * @param {number} tournamentId - ID of the tournament
 * @param {number[]} playerIds - Array of player IDs to update
 * @param {number} leagueId - ID of the league to assign
 * @returns {Promise<object>} - Returns assignment results
 */
static async updateLeague(tournamentId, playerIds, leagueId) {
  if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
    throw new Error('Player IDs array cannot be empty');
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // Create placeholders for the IN clause
    const placeholders = playerIds.map(() => '?').join(',');
    
    // 1. Verify all players exist in the tournament
    const [existingPlayers] = await connection.execute(
      `SELECT player_id FROM player_tournaments 
       WHERE tournament_id = ? AND player_id IN (${placeholders})`,
      [tournamentId, ...playerIds]
    );

    const existingPlayerIds = existingPlayers.map(row => row.player_id);
    const missingPlayers = playerIds.filter(id => !existingPlayerIds.includes(id));

    if (missingPlayers.length > 0) {
      throw new Error(`Players not found in tournament: ${missingPlayers.join(', ')}`);
    }

    // 2. Verify league exists and belongs to the tournament
    const [league] = await connection.execute(
      `SELECT id, max_players FROM leagues 
       WHERE id = ? AND tournament_id = ?`,
      [leagueId, tournamentId]
    );

    if (league.length === 0) {
      throw new Error('League not found or does not belong to this tournament');
    }

    const maxPlayers = league[0].max_players;

    // 3. Check if league has enough capacity
    const [currentPlayers] = await connection.execute(
      `SELECT COUNT(*) as count FROM player_tournaments 
       WHERE league_id = ?`,
      [leagueId]
    );

    const currentCount = currentPlayers[0].count;
    const availableSpots = maxPlayers - currentCount;

    if (availableSpots < playerIds.length) {
      throw new Error(`League only has ${availableSpots} available spots, but ${playerIds.length} players requested`);
    }

    // 4. Update league assignments
    const [result] = await connection.execute(
      `UPDATE player_tournaments 
       SET league_id = ? 
       WHERE tournament_id = ? AND player_id IN (${placeholders})`,
      [leagueId, tournamentId, ...playerIds]
    );

    // 5. Get updated player information for response
    const [updatedPlayers] = await connection.execute(
      `SELECT 
         u.id as player_id,
         u.first_name,
         u.last_name,
         u.strength,
         pt.league_id
       FROM users u
       JOIN player_tournaments pt ON u.id = pt.player_id
       WHERE pt.tournament_id = ? AND pt.player_id IN (${placeholders})`,
      [tournamentId, ...playerIds]
    );

    await connection.commit();

    return {
      assignedCount: result.affectedRows,
      leagueId: leagueId,
      tournamentId: tournamentId,
      players: updatedPlayers,
      message: `Successfully assigned ${result.affectedRows} players to league ${leagueId}`
    };

  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
  /**
   * Add multiple players to a tournament with league assignments
   * @param {number} tournamentId - ID of the tournament
   * @param {number[]} playerIds - Array of player IDs
   * @returns {Promise<object>} - Returns assignment results
   */
  static async addPlayersToTournament(tournamentId, playerIds) {
    if (!playerIds || playerIds.length === 0) {
      throw new Error('Player IDs array cannot be empty');
    }
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 1. Get all players' data
      const [players] = await connection.execute(
        `SELECT id, strength FROM users 
         WHERE id IN (${playerIds.join(',')}) AND role = 'player'`
      );
      if (players.length !== playerIds.length) {
        throw new Error('One or more players not found');
      }

      // 2. Get all leagues with available capacity
      const [leagues] = await connection.execute(
        `SELECT l.id, l.min_strength, l.max_strength, l.max_players,
                IFNULL(pt.player_count, 0) as current_players
         FROM leagues l
         LEFT JOIN (
           SELECT league_id, COUNT(*) as player_count 
           FROM player_tournaments 
           GROUP BY league_id
         ) pt ON l.id = pt.league_id
         WHERE l.tournament_id = ?
         AND (pt.player_count IS NULL OR pt.player_count < l.max_players)`,
        [tournamentId]
      );

      // 3. Prepare assignments
      const assignments = [];
      const unassignedPlayers = [];
      const availableLeagues = [...leagues];

      // Sort players by strength (descending) for best-fit assignment
      const sortedPlayers = [...players].sort((a, b) => b.strength - a.strength);

      for (const player of sortedPlayers) {
        let assigned = false;

        // Find best matching league
        for (let i = 0; i < availableLeagues.length; i++) {
          const league = availableLeagues[i];
          
          if (player.strength >= league.min_strength && 
              player.strength <= league.max_strength) {
            
            assignments.push({
              playerId: player.id,
              leagueId: league.id,
              strength: player.strength
            });

            // Update league capacity
            league.current_players++;
            if (league.current_players >= league.max_players) {
              availableLeagues.splice(i, 1); // Remove full leagues
            }
            
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          unassignedPlayers.push(player.id);
        }
      }

      // 4. Remove existing relationships
      /*await connection.execute(
        `DELETE FROM player_tournaments 
         WHERE tournament_id = ? AND player_id IN (?)`,
        [tournamentId, playerIds]
      );*/

      // 5. Insert new assignments
      if (assignments.length > 0) {
        const assignmentValues = assignments.map(a => 
          [a.playerId, tournamentId, a.leagueId, 'confirmed']
        );

        await connection.query(
          `INSERT INTO player_tournaments 
           (player_id, tournament_id, league_id, status) 
           VALUES ?`,
          [assignmentValues]
        );
      }

      // 6. Insert unassigned players (without league)
      if (unassignedPlayers.length > 0) {
        const unassignedValues = unassignedPlayers.map(playerId => 
          [playerId, tournamentId, null, 'confirmed']
        );

        await connection.query(
          `INSERT INTO player_tournaments 
           (player_id, tournament_id, league_id, status) 
           VALUES ?`,
          [unassignedValues]
        );
      }

      await connection.commit();

      return {
        totalPlayers: playerIds.length,
        assignedToLeague: assignments.length,
        unassignedPlayers: unassignedPlayers.length,
        assignments,
        unassignedPlayers
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Remove a player from a tournament
   * @param {number} playerId - ID of the player
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<boolean>} - Returns true if deletion was successful
   */
  static async removePlayerFromTournament(playerId, tournamentId) {
    const [result] = await pool.execute(
      `DELETE FROM player_tournaments 
       WHERE player_id = ? AND tournament_id = ?`,
      [playerId, tournamentId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get all tournaments for a specific player
   * @param {number} playerId - ID of the player
   * @returns {Promise<array>} - Array of tournament objects
   */
  static async getPlayerTournaments(playerId) {
    const [rows] = await pool.execute(
      `SELECT 
         t.tournament_id, 
         t.tournament_name, 
         t.start_date, 
         t.end_date,
         pt.league_id,
         l.leaguename as league_name,
         pt.status,
         pt.registration_date
       FROM tournaments t
       JOIN player_tournaments pt ON t.tournament_id = pt.tournament_id
       LEFT JOIN leagues l ON pt.league_id = l.id
       WHERE pt.player_id = ?`,
      [playerId]
    );
    return rows;
  }

  /**
   * Get all players in a tournament
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<array>} - Array of player objects
   */
  static async getTournamentPlayers(tournamentId) {
    const [rows] = await pool.execute(
      `SELECT 
         u.id, 
         u.first_name, 
         u.last_name, 
         u.phone_number, 
         u.profile_photo, 
         u.age, 
         u.strength,
         pt.league_id,
         l.leaguename as league_name,
         pt.status,
         pt.registration_date
       FROM users u
       JOIN player_tournaments pt ON u.id = pt.player_id
       LEFT JOIN leagues l ON pt.league_id = l.id
       WHERE pt.tournament_id = ? AND u.role = 'player'`,
      [tournamentId]
    );
    return rows;
  }

  /**
   * Get players NOT in a tournament
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<array>} - Array of player objects
   */
  static async getPlayersNotInTournament(tournamentId) {
    const [rows] = await pool.execute(
      `SELECT 
         u.id, 
         u.first_name, 
         u.last_name, 
         u.phone_number, 
         u.profile_photo, 
         u.age, 
         u.strength
       FROM users u
       WHERE u.role = 'player' AND u.id NOT IN (
         SELECT player_id FROM player_tournaments WHERE tournament_id = ?
       )`,
      [tournamentId]
    );
    return rows;
  }

  /**
   * Get all players in a specific league
   * @param {number} leagueId - ID of the league
   * @returns {Promise<array>} - Array of player objects
   */
  static async getLeaguePlayers(leagueId) {
    const [rows] = await pool.execute(
      `SELECT 
         u.id, 
         u.first_name, 
         u.last_name, 
         u.phone_number, 
         u.profile_photo, 
         u.age, 
         u.strength,
         pt.status,
         pt.registration_date
       FROM users u
       JOIN player_tournaments pt ON u.id = pt.player_id
       WHERE pt.league_id = ?`,
      [leagueId]
    );
    return rows;
  }

  /**
   * Check if a player is in a tournament
   * @param {number} playerId - ID of the player
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<boolean>} - Returns true if player is in tournament
   */
  static async isPlayerInTournament(playerId, tournamentId) {
    const [rows] = await pool.execute(
      `SELECT 1 FROM player_tournaments 
       WHERE player_id = ? AND tournament_id = ?`,
      [playerId, tournamentId]
    );
    return rows.length > 0;
  }

  /**
   * Remove all players from a tournament
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<number>} - Number of players removed
   */
  static async clearTournamentPlayers(tournamentId) {
    const [result] = await pool.execute(
      `DELETE FROM player_tournaments 
       WHERE tournament_id = ?`,
      [tournamentId]
    );
    return result.affectedRows;
  }

  /**
   * Get tournament player count
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<number>} - Number of players in tournament
   */
  static async getTournamentPlayerCount(tournamentId) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM player_tournaments 
       WHERE tournament_id = ?`,
      [tournamentId]
    );
    return rows[0].count;
  }

  /**
   * Update player's league assignment
   * @param {number} playerId - ID of the player
   * @param {number} tournamentId - ID of the tournament
   * @param {number|null} leagueId - ID of the league (null to remove from league)
   * @returns {Promise<boolean>} - Returns true if update was successful
   */
  static async updatePlayerLeague(playerId, tournamentId, leagueId) {
    // Verify league exists and has capacity if assigning
    if (leagueId !== null) {
      const [league] = await pool.execute(
        `SELECT l.id, l.max_players, 
                COUNT(pt.id) as current_players
         FROM leagues l
         LEFT JOIN player_tournaments pt ON l.id = pt.league_id
         WHERE l.id = ? AND l.tournament_id = ?
         GROUP BY l.id
         HAVING current_players < l.max_players`,
        [leagueId, tournamentId]
      );

      if (league.length === 0) {
        throw new Error('League not found or already full');
      }
    }

    const [result] = await pool.execute(
      `UPDATE player_tournaments 
       SET league_id = ? 
       WHERE player_id = ? AND tournament_id = ?`,
      [leagueId, playerId, tournamentId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Get player's league assignment in a tournament
   * @param {number} playerId - ID of the player
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<object|null>} - League information or null if not assigned
   */
  static async getPlayerLeague(playerId, tournamentId) {
    const [rows] = await pool.execute(
      `SELECT 
         l.id, 
         l.leaguename, 
         l.min_strength, 
         l.max_strength
       FROM player_tournaments pt
       JOIN leagues l ON pt.league_id = l.id
       WHERE pt.player_id = ? AND pt.tournament_id = ?`,
      [playerId, tournamentId]
    );
    return rows[0] || null;
  }
}

module.exports = TournamentPlayer;