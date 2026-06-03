const pool = require('../config/db');

class League {
  static async create({ 
    leaguename, 
    tournament_id, 
    match_day, 
    start_time, 
    max_players = 16,
    min_strength = 0,
    max_strength = 100
  }) {
    const [result] = await pool.execute(
      `INSERT INTO leagues 
       (leaguename, tournament_id, match_day, start_time, max_players, min_strength, max_strength) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [leaguename, tournament_id, match_day, start_time, max_players, min_strength, max_strength]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        leaguename, 
        tournament_id, 
        match_day, 
        start_time, 
        max_players,
        min_strength,
        max_strength,
        is_completed,
        created_at
       FROM leagues 
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findByTournament(tournament_id) {
    const [rows] = await pool.execute(
      `SELECT 
        l.id, 
        l.leaguename, 
        l.match_day, 
        l.start_time,
        l.min_strength,
        l.max_strength,
        l.is_completed,
        l.max_players,
        COUNT(DISTINCT pt.player_id) as current_players
       FROM leagues l
       LEFT JOIN player_tournaments pt ON l.id = pt.league_id AND pt.tournament_id = ?
       WHERE l.tournament_id = ?
       GROUP BY l.id
       ORDER BY l.min_strength DESC, l.match_day, l.start_time`,
      [tournament_id, tournament_id]
    );
    return rows;
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT 
        l.id, 
        l.leaguename, 
        l.match_day, 
        l.start_time,
        l.min_strength,
        l.max_strength,
        l.is_completed,
        t.tournament_name
       FROM leagues l
       LEFT JOIN tournaments t ON l.tournament_id = t.tournament_id
       ORDER BY l.min_strength DESC, l.match_day, l.start_time`
    );
    return rows;
  }

  static async update(id, updateData) {
    const fieldMap = {
      leaguename: 'leaguename',
      tournament_id: 'tournament_id',
      match_day: 'match_day',
      start_time: 'start_time',
      max_players: 'max_players',
      min_strength: 'min_strength',
      max_strength: 'max_strength',
      is_completed: 'is_completed'
    };

    // Filter and map valid fields
    const fieldsToUpdate = {};
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && fieldMap[key]) {
        fieldsToUpdate[fieldMap[key]] = updateData[key];
      }
    });

    if (Object.keys(fieldsToUpdate).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    // Build dynamic query
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
      
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE leagues SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM leagues WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async completeLeague(id) {
    const [result] = await pool.execute(
      'UPDATE leagues SET is_completed = TRUE WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async countByTournament(tournament_id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as league_count FROM leagues WHERE tournament_id = ?',
      [tournament_id]
    );
    return rows[0].league_count;
  }

  // New method to find suitable leagues for a player's strength
  static async findLeaguesByStrength(tournament_id, player_strength) {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        leaguename, 
        match_day, 
        start_time,
        max_players
       FROM leagues 
       WHERE tournament_id = ? 
       AND min_strength <= ? 
       AND max_strength >= ?
       ORDER BY match_day, start_time`,
      [tournament_id, player_strength, player_strength]
    );
    return rows;
  }
}

module.exports = League;