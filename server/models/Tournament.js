const pool = require('../config/db');

class Tournaments {
  static async create({ 
    tournamentName, 
    startDate, 
    endDate
  }) {
    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error('End date must be after start date');
    }

    const [result] = await pool.execute(
      `INSERT INTO tournaments 
       (tournament_name, start_date, end_date) 
       VALUES (?, ?, ?)`,
      [tournamentName, startDate, endDate]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        tournament_id, 
        tournament_name, 
        start_date, 
        end_date
       FROM tournaments 
       WHERE tournament_id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT 
        tournament_id, 
        tournament_name, 
        start_date, 
        end_date
       FROM tournaments 
       ORDER BY start_date ASC`
    );
    return rows;
  }

  static async findUpcoming() {
    const [rows] = await pool.execute(
      `SELECT 
        tournament_id, 
        tournament_name, 
        start_date, 
        end_date
       FROM tournaments 
       WHERE start_date > CURDATE() 
       ORDER BY start_date ASC`
    );
    return rows;
  }

  static async findActive() {
    const [rows] = await pool.execute(
      `SELECT 
        tournament_id, 
        tournament_name, 
        start_date, 
        end_date
       FROM tournaments 
       WHERE start_date <= CURDATE() AND end_date >= CURDATE() 
       ORDER BY start_date ASC`
    );
    return rows;
  }

  static async update(id, updateData) {
    const fieldMap = {
      tournamentName: 'tournament_name',
      startDate: 'start_date',
      endDate: 'end_date'
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

    // Date validation if updating dates
    if (fieldsToUpdate.end_date && fieldsToUpdate.start_date) {
      if (new Date(fieldsToUpdate.end_date) < new Date(fieldsToUpdate.start_date)) {
        throw new Error('End date must be after start date');
      }
    } else if (fieldsToUpdate.end_date) {
      const tournament = await Tournaments.findById(id);
      if (new Date(fieldsToUpdate.end_date) < new Date(tournament.start_date)) {
        throw new Error('End date must be after start date');
      }
    } else if (fieldsToUpdate.start_date) {
      const tournament = await Tournaments.findById(id);
      if (new Date(tournament.end_date) < new Date(fieldsToUpdate.start_date)) {
        throw new Error('End date must be after start date');
      }
    }

    // Build dynamic query
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
      
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE tournaments SET ${setClause} WHERE tournament_id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute(
      'DELETE FROM tournaments WHERE tournament_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Tournaments;