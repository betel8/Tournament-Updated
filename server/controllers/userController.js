const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const ErrorResponse = require('../utils/errorResponse');

const unlinkAsync = promisify(fs.unlink);

/**
 * Formats Ethiopian phone numbers to a consistent international format
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} Formatted phone number in E.164 format
 */
const formatEthiopianPhone = (phoneNumber) => {
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  
  if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
    return `+251${cleanNumber.substring(1)}`;
  } else if ((cleanNumber.startsWith('7') || cleanNumber.startsWith('9')) && cleanNumber.length === 9) {
    return `+251${cleanNumber}`;
  } else if (cleanNumber.startsWith('251') && cleanNumber.length === 12) {
    return `+${cleanNumber}`;
  }
  
  return phoneNumber; // return as-is if not matching local formats
};

/**
 * Checks if a phone number is already registered
 */
exports.checkPhone = async (req, res, next) => {
  try {
    const { phoneNumber } = req.params;
    
    if (!phoneNumber) {
      return next(new ErrorResponse('Phone number is required', 400));
    }
    
    const formattedNumber = formatEthiopianPhone(phoneNumber);

    if (!formattedNumber) {
      return next(new ErrorResponse('Invalid phone number format', 400));
    }

    const user = await User.findByPhone(formattedNumber);

    return res.status(200).json({
      success: true,
      exists: !!user,
      formattedNumber
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Registers a new user
 */
exports.register = async (req, res, next) => {

  try {
    const { firstName, lastName, phoneNumber, age, password } = req.body;

    if (!firstName || !lastName || !phoneNumber || !password) {
      throw new ErrorResponse('Missing required fields', 400);
    }

    const formattedNumber = formatEthiopianPhone(phoneNumber);
    
    const existingUser = await User.findByPhone(formattedNumber);
    if (existingUser) {
      if (req.file) await unlinkAsync(req.file.path);
      throw new ErrorResponse('Phone number already registered', 400);
    }

    if (age && (age < 13 || age > 100)) {
      throw new ErrorResponse('Age must be between 13 and 100', 400);
    }

    if (!req.file) {
      throw new ErrorResponse('Profile photo is required', 400);
    }

    const validMimeTypes = ['image/jpeg', 'image/png'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      await unlinkAsync(req.file.path);
      throw new ErrorResponse('Only JPEG/PNG images allowed', 400);
    }

    const profilePhotoPath = `/uploads/${req.file.filename}`;
    const userId = await User.create({
      firstName,
      lastName,
      phoneNumber: formattedNumber,
      age: age || null,
      profilePhoto: profilePhotoPath,
      password,
      role: 'player'
    });

    // Get the created user without sensitive data
    const user = await User.findById(userId);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: user
    });

  } catch (err) {
    if (req.file) {
      await unlinkAsync(req.file.path).catch(console.error);
    }
    next(err);
  }
};

/**
 * Gets user profile
 */
exports.getProfile = async (req, res, next) => {
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
/**
 * Updates user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, age, phoneNumber } = req.body;
    const updateData = { firstName, lastName, age };

    // Add phone number if provided (with formatting)
    if (phoneNumber) {
      updateData.phoneNumber = formatEthiopianPhone(phoneNumber);
      if (!updateData.phoneNumber) {
        throw new ErrorResponse('Invalid phone number format', 400);
      }
    }

    // Handle profile photo upload if exists
    if (req.file) {
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        await unlinkAsync(req.file.path);
        throw new ErrorResponse('Only JPEG/PNG images allowed', 400);
      }
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
      
      // Delete old profile photo if exists
      const currentUser = await User.findById(req.user.id);
      if (currentUser.profile_photo) {
        const oldPhotoPath = path.join(__dirname, '..', currentUser.profile_photo);
        await unlinkAsync(oldPhotoPath).catch(console.error);
      }
    }

    const updated = await User.updateProfile(req.user.id, updateData);
    
    if (!updated) {
      if (req.file) await unlinkAsync(req.file.path);
      throw new ErrorResponse('Profile update failed', 400);
    }

    // Get updated user data without sensitive fields
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (err) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      await unlinkAsync(req.file.path).catch(console.error);
    }
    next(err);
  }
};
/**
 * Gets all players (excluding sensitive data)
 */
exports.getAllPlayers = async (req, res, next) => {
  try {
    // Optional: Add admin check if needed
    // if (req.user.role !== 'admin') {
    //   throw new ErrorResponse('Unauthorized access', 403);
    // }

    const players = await User.findAllPlayers();
    
    if (!players || players.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No players found'
      });
    }

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
 * Gets players with optional filtering by tournament
 */
exports.getPlayersByTournament = async (req, res, next) => {
  try {
    const { tournamentId } = req.params;

    if (!tournamentId || isNaN(tournamentId)) {
      throw new ErrorResponse('Valid tournament ID is required', 400);
    }

    const players = await User.findPlayersByTournament(parseInt(tournamentId));

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
 * Deletes a player account (admin only)
 */
exports.deletePlayer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ErrorResponse('Player ID is required', 400);
    }

    // Optional: Add admin check
    // if (req.user.role !== 'admin') {
    //   throw new ErrorResponse('Unauthorized - Admin access required', 403);
    // }

    // Prevent users from deleting their own account through this endpoint
    // if (req.user.id === parseInt(id)) {
    //   throw new ErrorResponse('You cannot delete your own account this way', 400);
    // }

    const deleted = await User.deletePlayer(id);
    
    if (!deleted) {
      throw new ErrorResponse('Player deletion failed', 400);
    }

    res.status(200).json({
      success: true,
      message: 'Player deleted successfully',
      data: { id }
    });

  } catch (err) {
    next(err);
  }
};
/**
 * Updates a player's profile (admin or player themselves)
 */
exports.updatePlayerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phoneNumber, age, strength, status, tournamentId } = req.body;
    
    // Prepare update data
    const updateData = { 
      firstName, 
      lastName, 
      phoneNumber, 
      age,
      strength,
      status,
      tournamentId
    };

    // Format phone number if provided
    if (phoneNumber) {
      updateData.phoneNumber = formatEthiopianPhone(phoneNumber);
      if (!updateData.phoneNumber) {
        throw new ErrorResponse('Invalid phone number format', 400);
      }
    }

    // Handle profile photo upload if exists
    if (req.file) {
      const validMimeTypes = ['image/jpeg', 'image/png'];
      if (!validMimeTypes.includes(req.file.mimetype)) {
        await unlinkAsync(req.file.path);
        throw new ErrorResponse('Only JPEG/PNG images allowed', 400);
      }
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
      
      // Delete old profile photo if exists
      const currentUser = await User.findById(id);
      if (currentUser?.profile_photo) {
        const oldPhotoPath = path.join(__dirname, '..', currentUser.profile_photo);
        await unlinkAsync(oldPhotoPath).catch(console.error);
      }
    }

    // Authorization check - either admin or the player themselves
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      throw new ErrorResponse('Unauthorized to update this profile', 403);
    }

    // Validate strength if provided
    if (strength && (strength < 0 || strength > 100)) {
      throw new ErrorResponse('Strength must be between 0 and 100', 400);
    }

    const updated = await User.updatePlayerProfile(id, updateData);
    
    if (!updated) {
      if (req.file) await unlinkAsync(req.file.path);
      throw new ErrorResponse('Player profile update failed', 400);
    }

    // Get updated player data
    const player = await User.findById(id);
    
    res.status(200).json({
      success: true,
      message: 'Player profile updated successfully',
      data: player
    });

  } catch (err) {
    // Clean up uploaded file if error occurred
    if (req.file) {
      await unlinkAsync(req.file.path).catch(console.error);
    }
    next(err);
  }
};