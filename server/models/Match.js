const pool = require('../config/db');

class Match {
  /**
   * Create a new match
   * @param {Object} matchData - Match details
   * @param {number} matchData.round_level - Tournament round (1-4)
   * @param {number} matchData.bracket_position - Position in bracket
   * @param {number|null} matchData.player_one_id - First player ID
   * @param {number|null} matchData.player_two_id - Second player ID
   * @param {Date|null} matchData.scheduled_time - When match occurs
   * @param {number|null} matchData.league_id - League ID
   * @returns {Promise<number>} Insert ID
   */
static async create({ 
    round_level, 
    bracket_position, 
    player_one_id = null, 
    player_two_id = null, 
    scheduled_time = null,
    league_id = null
}) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. First create a result record
        const [resultResult] = await connection.execute(
            `INSERT INTO result (p_one_goal, p_two_goal) VALUES (NULL, NULL)`
        );
        const resultId = resultResult.insertId;

        // 2. Then create the match with the result ID
        const [matchResult] = await connection.execute(
            `INSERT INTO matches 
             (round_level, bracket_position, player_one_id, player_two_id, scheduled_time, league_id, result) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [round_level, bracket_position, player_one_id, player_two_id, scheduled_time, league_id, resultId]
        );
        const matchId = matchResult.insertId;

        // 3. Update the result record with the match ID
        await connection.execute(
            `UPDATE result SET matches_id = ? WHERE id = ?`,
            [matchId, resultId]
        );

        await connection.commit();
        return matchId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
  /**
   * Find match by ID
   * @param {number} id - Match ID
   * @returns {Promise<Object|null>} Match data or null
   */
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        m.id, 
        m.round_level, 
        m.bracket_position, 
        m.player_one_id, 
        m.player_two_id, 
        m.winner_id,
        m.scheduled_time,
        m.result,
        m.league_id,
        l.leaguename as league_name,
        t.tournament_id,
        t.tournament_name
      FROM matches m
      LEFT JOIN leagues l ON m.league_id = l.id
      LEFT JOIN tournaments t ON l.tournament_id = t.tournament_id
      WHERE m.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Update match details
   * @param {number} id - Match ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<boolean>} True if updated
   */
  static async update(id, updateData) {
    const fieldMap = {
      playerOneId: 'player_one_id',
      playerTwoId: 'player_two_id',
      winnerId: 'winner_id',
      scheduledTime: 'scheduled_time',
      result: 'result',
      roundLevel: 'round_level',
      bracketPosition: 'bracket_position',
      leagueId: 'league_id'
    };

    const fieldsToUpdate = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && fieldMap[key]) {
        fieldsToUpdate[fieldMap[key]] = updateData[key];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
      
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE matches SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  /**
   * Set match winner
   * @param {number} matchId - Match ID
   * @param {number} winnerId - Winning player ID
   * @returns {Promise<boolean>} True if updated
   */
  static async setWinner(matchId, winnerId) {
    const [result] = await pool.execute(
      'UPDATE matches SET winner_id = ? WHERE id = ?',
      [winnerId, matchId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get all matches for a league
   * @param {number} leagueId - League ID
   * @returns {Promise<Array>} Array of matches
   */
  static async findByLeagueId(leagueId) {
    const [rows] = await pool.execute(
      `SELECT 
        m.id,
        m.round_level,
        m.bracket_position,
        m.player_one_id,
        m.player_two_id,
        m.winner_id,
        m.scheduled_time,
        m.result,
        p1.first_name as player_one_name,
        p1.last_name as player_one_last_name,
        p2.first_name as player_two_name,
        p2.last_name as player_two_last_name,
        r.p_one_goal,
        r.p_two_goal
      FROM matches m
      LEFT JOIN users p1 ON m.player_one_id = p1.id
      LEFT JOIN users p2 ON m.player_two_id = p2.id
      LEFT JOIN result r ON m.id = r.matches_id
      WHERE m.league_id = ?
      ORDER BY m.round_level, m.bracket_position`,
      [leagueId]
    );
    return rows;
  }

  /**
   * Get all matches for a tournament round in a league
   * @param {number} leagueId - League ID
   * @param {number} roundLevel - Round number (1-4)
   * @returns {Promise<Array>} Array of matches
   */
  static async findByLeagueAndRound(leagueId, roundLevel) {
    const [rows] = await pool.execute(
      `SELECT 
        m.id,
        m.round_level,
        m.bracket_position,
        m.player_one_id,
        m.player_two_id,
        m.winner_id,
        m.scheduled_time,
        p1.first_name as player_one_name,
        p2.first_name as player_two_name
      FROM matches m
      LEFT JOIN users p1 ON m.player_one_id = p1.id
      LEFT JOIN users p2 ON m.player_two_id = p2.id
      WHERE m.league_id = ? AND m.round_level = ?
      ORDER BY m.bracket_position`,
      [leagueId, roundLevel]
    );
    return rows;
  }

  /**
   * Initialize a 16-player knockout bracket for a league
   * @param {number} leagueId - League ID
   * @param {Array<number>} playerIds - Array of 16 player IDs
   * @returns {Promise<boolean>} True if bracket created
   */
  static async initializeBracket(leagueId, playerIds) {
    if (playerIds.length !== 16) {
      throw new Error('Bracket requires exactly 16 players');
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Clear existing matches for this league
      await connection.execute('DELETE FROM matches WHERE league_id = ?', [leagueId]);

      // Round of 16 (8 matches)
      for (let i = 0; i < 8; i++) {
        await connection.execute(
          `INSERT INTO matches 
           (round_level, bracket_position, player_one_id, player_two_id, league_id) 
           VALUES (1, ?, ?, ?, ?)`,
          [i + 1, playerIds[i * 2], playerIds[i * 2 + 1], leagueId]
        );
      }

      // Quarterfinals (4 matches) - empty initially
      for (let i = 0; i < 4; i++) {
        await connection.execute(
          `INSERT INTO matches 
           (round_level, bracket_position, league_id) 
           VALUES (2, ?, ?)`,
          [i + 1, leagueId]
        );
      }

      // Semifinals (2 matches)
      for (let i = 0; i < 2; i++) {
        await connection.execute(
          `INSERT INTO matches 
           (round_level, bracket_position, league_id) 
           VALUES (3, ?, ?)`,
          [i + 1, leagueId]
        );
      }

      // Final (1 match)
      await connection.execute(
        `INSERT INTO matches 
         (round_level, bracket_position, league_id) 
         VALUES (4, 1, ?)`,
        [leagueId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Advance winners to next round in a league
   * @param {number} leagueId - League ID
   * @param {number} currentRound - The round that just completed
   * @returns {Promise<boolean>} True if advancement succeeded
   */
  static async advanceWinners(leagueId, currentRound) {
    if (currentRound < 1 || currentRound > 3) {
      throw new Error('Can only advance from rounds 1-3');
    }

    const nextRound = currentRound + 1;
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get all winners from current round in this league
      const [winners] = await connection.execute(
        `SELECT id, bracket_position, winner_id 
         FROM matches 
         WHERE league_id = ? AND round_level = ? AND winner_id IS NOT NULL`,
        [leagueId, currentRound]
      );

      if (winners.length !== Math.pow(2, 4 - currentRound)) {
        throw new Error(`Not all matches in round ${currentRound} have winners`);
      }

      // Update next round matches in this league
      for (const winner of winners) {
        const nextBracketPos = Math.ceil(winner.bracket_position / 2);
        const isFirstPlayer = winner.bracket_position % 2 === 1;

        await connection.execute(
          `UPDATE matches 
           SET ${isFirstPlayer ? 'player_one_id' : 'player_two_id'} = ? 
           WHERE league_id = ? AND round_level = ? AND bracket_position = ?`,
          [winner.winner_id, leagueId, nextRound, nextBracketPos]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  /**
 * Get all matches for a specific league and round with player details
 * @param {number} leagueId - League ID
 * @param {number} roundLevel - Round number (1-4)
 * @returns {Promise<Array>} Array of match objects with player details
 */
static async getMatchesByLeagueAndRound(leagueId, roundLevel) {
    const [rows] = await pool.execute(
      `SELECT 
        m.id,
        m.round_level,
        m.bracket_position,
        m.player_one_id,
        m.player_two_id,
        m.winner_id,
        m.scheduled_time,
        m.result,
        p1.first_name as player_one_name,
        p1.last_name as player_one_last_name,
        p2.first_name as player_two_name,
        p2.last_name as player_two_last_name,
        p1.strength as player_one_strength,
        p2.strength as player_two_strength,
        p1.profile_photo as player_one_photo,
        p2.profile_photo as player_two_photo
      FROM matches m
      LEFT JOIN users p1 ON m.player_one_id = p1.id
      LEFT JOIN users p2 ON m.player_two_id = p2.id
      WHERE m.league_id = ? AND m.round_level = ?
      ORDER BY m.bracket_position`,
      [leagueId, roundLevel]
    );
    return rows;
  }
  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM matches WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Match;