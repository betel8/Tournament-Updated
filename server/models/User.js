const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

class User {
  static async create({ 
    firstName, 
    lastName, 
    phoneNumber, 
    age, 
    profilePhoto, 
    password, 
    role = 'player'
  }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users 
       (first_name, last_name, phone_number, age, profile_photo, password, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, phoneNumber, age, profilePhoto, hashedPassword, role]
    );
    return result.insertId;
  }

  static async findByPhone(phoneNumber) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE phone_number = ?',
      [phoneNumber]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, first_name, last_name, phone_number, role, profile_photo ,age FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  

  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows > 0;
  }

  static async comparePasswords(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  static async updateProfile(id, updateData) {
    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      phoneNumber: 'phone_number',
      profilePhoto: 'profile_photo',
      age: 'age'
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
  
    // Phone number uniqueness check
    if (fieldsToUpdate.phone_number) {
      const existingUser = await User.findByPhone(fieldsToUpdate.phone_number);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Phone number already in use by another account');
      }
    }
  
    // Build dynamic query
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
      
    const values = Object.values(fieldsToUpdate);
    values.push(id);
  
    const [result] = await pool.execute(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );
  
    return result.affectedRows > 0;
  }
  static async findWithPassword(id) {
    const [rows] = await pool.execute(
      'SELECT id, password FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }
  static async findAllPlayers() {
    const [rows] = await pool.execute(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        phone_number, 
        profile_photo, 
        age, 
        strength, 
        role, 
        status 
      FROM users 
      WHERE role = 'player'`
    );
    return rows;
  }
  static async findPlayersByTournament(tournamentId) {
    const [rows] = await pool.execute(
      `SELECT id, first_name, last_name, profile_photo, age, strength 
       FROM users 
       WHERE role = 'player' AND tournament_id = ?`,
      [tournamentId]
    );
    return rows;
  }
  static async deletePlayer(id) {
    // First get the user to access their profile photo path
    const user = await User.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete the user from database
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found or already deleted');
      }

      // If user has a profile photo, delete it from storage
      if (user.profile_photo) {
        try {
          const photoPath = path.join(__dirname, '..', 'uploads', path.basename(user.profile_photo));
          await unlinkAsync(photoPath);
        } catch (err) {
          console.error('Failed to delete profile photo:', err);
          // Don't fail the whole operation if photo deletion fails
        }
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
  static async updatePlayerProfile(id, updateData) {
    const fieldMap = {
      firstName: 'first_name',
      lastName: 'last_name',
      phoneNumber: 'phone_number',
      profilePhoto: 'profile_photo',
      age: 'age',
      strength: 'strength',
      status: 'status',
      tournamentId: 'tournament_id'
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
  
    // Phone number uniqueness check
    if (fieldsToUpdate.phone_number) {
      const existingUser = await User.findByPhone(fieldsToUpdate.phone_number);
      if (existingUser && existingUser.id !== parseInt(id)) {
        throw new Error('Phone number already in use by another account');
      }
    }
  
    // Verify the user is a player
    const user = await User.findById(id);
    if (!user || user.role !== 'player') {
      throw new Error('Only player profiles can be updated with this method');
    }
  
    // Build dynamic query
    const setClause = Object.keys(fieldsToUpdate)
      .map(field => `${field} = ?`)
      .join(', ');
      
    const values = Object.values(fieldsToUpdate);
    values.push(id);
  
    const [result] = await pool.execute(
      `UPDATE users SET ${setClause} WHERE id = ? AND role = 'player'`,
      values
    );
  
    return result.affectedRows > 0;
  }

}

module.exports = User;