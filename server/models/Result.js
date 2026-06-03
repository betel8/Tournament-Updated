const pool = require('../config/db');

class Result {
  static async create({ 
    pOneGoal, 
    pTwoGoal, 
    matchesId 
  }) {
    // Validate goals (optional, can be null)
    if (pOneGoal !== null && pOneGoal < 0) {
      throw new Error('Player one goal must be non-negative');
    }
    if (pTwoGoal !== null && pTwoGoal < 0) {
      throw new Error('Player two goal must be non-negative');
    }

    const [result] = await pool.execute(
      `INSERT INTO result 
       (p_one_goal, p_two_goal, matches_id) 
       VALUES (?, ?, ?)`,
      [pOneGoal, pTwoGoal, matchesId]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        p_one_goal, 
        p_two_goal, 
        matches_id
       FROM result 
       WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        p_one_goal, 
        p_two_goal, 
        matches_id
       FROM result 
       ORDER BY id ASC`
    );
    return rows;
  }

  static async findByMatchId(matchesId) {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        p_one_goal, 
        p_two_goal, 
        matches_id
       FROM result 
       WHERE matches_id = ?`,
      [matchesId]
    );
    return rows[0]; // Assuming one result per match
  }

  static async findByGoals(minGoals, maxGoals = null) {
    let query = `
      SELECT 
        id, 
        p_one_goal, 
        p_two_goal, 
        matches_id
      FROM result 
      WHERE (p_one_goal >= ? OR p_two_goal >= ?)
    `;
    const params = [minGoals, minGoals];

    if (maxGoals !== null) {
      query += ` AND (p_one_goal <= ? AND p_two_goal <= ?)`;
      params.push(maxGoals, maxGoals);
    }

    query += ` ORDER BY (p_one_goal + p_two_goal) DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updateData) {
    const fieldMap = {
      pOneGoal: 'p_one_goal',
      pTwoGoal: 'p_two_goal',
      matchesId: 'matches_id'
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

    // Validate goals if updating
    if (fieldsToUpdate.p_one_goal !== undefined && fieldsToUpdate.p_one_goal < 0) {
      throw new Error('Player one goal must be non-negative');
    }
    if (fieldsToUpdate.p_two_goal !== undefined && fieldsToUpdate.p_two_goal < 0) {
      throw new Error('Player two goal must be non-negative');
    }

    // Build dynamic query
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
      
    const values = Object.values(fieldsToUpdate);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE result SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  // REMOVED: static async delete(id) - Results cannot be deleted directly
  // REMOVED: static async deleteByMatchId(matchesId) - Results cannot be deleted directly

  // Reset method to set both player goals to null
  static async reset(matchId) {
    const [result] = await pool.execute(
      `UPDATE result 
       SET p_one_goal = NULL, p_two_goal = NULL 
       WHERE matches_id = ?`,
      [matchId]
    );
    
    return result.affectedRows > 0;
  }

  // Additional utility methods
  static async getMatchWinner(matchesId) {
    const result = await Result.findByMatchId(matchesId);
    if (!result) return null;

    const { p_one_goal, p_two_goal } = result;
    
    if (p_one_goal === null || p_two_goal === null) {
      return null; // Match not completed
    }

    if (p_one_goal > p_two_goal) return 1;
    if (p_two_goal > p_one_goal) return 2;
    return 0; // Draw
  }

  static async getTotalGoals() {
    const [rows] = await pool.execute(
      `SELECT 
        SUM(COALESCE(p_one_goal, 0) + COALESCE(p_two_goal, 0)) as total_goals,
        COUNT(*) as total_matches
       FROM result 
       WHERE p_one_goal IS NOT NULL AND p_two_goal IS NOT NULL`
    );
    return rows[0];
  }

  // New method to handle result updates safely
  static async safeUpdateResult(matchId, updateData) {
    // First check if result exists for this match
    const existingResult = await Result.findByMatchId(matchId);
    
    if (!existingResult) {
      // Create new result if doesn't exist
      const resultId = await Result.create({
        pOneGoal: updateData.pOneGoal || null,
        pTwoGoal: updateData.pTwoGoal || null,
        matchesId: matchId
      });
      return { created: true, id: resultId };
    } else {
      // Update existing result
      const updated = await Result.update(existingResult.id, updateData);
      return { created: false, updated: updated };
    }
  }
}

module.exports = Result;