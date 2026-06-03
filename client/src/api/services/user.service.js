// api/services/user.service.js
import { publicApi, privateApi } from '../httpClient';
import { ErrorResponse } from '../../utils/errorResponse';

const UserService = {
  /**
   * Register a new user (formerly registerPlayer)
   * @param {FormData} formData - User registration data
   * @returns {Promise<Object>} - Response data
   */
  register: async (formData) => {
    try {
      const response = await publicApi.post('/api/users/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000
      });
      if (response.success) {
        return response;
      }
      throw new ErrorResponse('Registration failed', 400);
    } catch (error) {
      console.log(error)
      return UserService._handleApiError(error, 'Registration failed');
    }
  },

  /**
   * Check phone number availability (formerly checkPhoneNumber)
   * @param {string} phoneNumber - Phone number to check
   * @returns {Promise<Object>} - Response data
   */
  checkPhoneNumber: async (phoneNumber) => {
    try {
      const response = await publicApi.get(`/api/users/check-phone/${encodeURIComponent(phoneNumber)}`);
      return response;
    } catch (error) {
      return UserService._handleApiError(error, 'Phone check failed');
    }
  },

  /**
   * Get user profile data
   * @returns {Promise<Object>} - User profile data
   */
  getProfile: async () => {
    try {
      const response = await privateApi.get('/api/users/profile');
      return response.data;
    } catch (error) {
      console.log(error)
      return UserService._handleApiError(error, 'Failed to fetch profile');
    }
  },

  /**
   * Update user profile
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated profile data
   */
  updateProfile: async (updateData) => {
    try {
      const formData = new FormData();
      
      // Append all non-file fields
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Append profile photo if exists
      if (updateData.profilePhoto instanceof File) {
        formData.append('avatar', updateData.profilePhoto);
      }

      const response = await privateApi.put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 15000
      });
      console.log(response)
      return response.data;
    } catch (error) {
      return UserService._handleApiError(error, 'Profile update failed');
    }
  },

  /**
   * Get all players (private)
   * @returns {Promise<Array>} Array of player objects
   */
  getAllPlayers: async () => {
    try {
      const response = await privateApi.get('/api/users/players');
      return response.data;
    } catch (error) {
      return UserService._handleApiError(error, 'Failed to fetch players');
    }
  }, 

  /**
   * Get players by tournament (private)
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<Array>} Array of player objects
   */
  getPlayersByTournament: async (tournamentId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      
      const response = await privateApi.get(`/api/users/players/tournament/${tournamentId}`);
      return response.data;
    } catch (error) {
      return UserService._handleApiError(error, 'Failed to fetch tournament players');
    }
  },

  /**
   * Delete a player (private - admin only)
   * @param {number} playerId - ID of the player to delete
   * @returns {Promise<Object>} - Response data
   */
  deletePlayer: async (playerId) => {
    try {
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const response = await privateApi.delete(`/api/users/players/${playerId}`);
      return response.data;
    } catch (error) {
      return UserService._handleApiError(error, 'Failed to delete player');
    }
  },

  /**
   * ADMIN: Update player profile (admin only)
   * @param {number} playerId - ID of the player to update
   * @param {Object} updateData - Data to update (including optional File for avatar)
   * @returns {Promise<Object>} - Updated player data
   */
  updatePlayerProfile: async (playerId, updateData) => {
    try {
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const formData = new FormData();
      
      // Append all non-file fields
      Object.entries(updateData).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Append profile photo if exists
      if (updateData.profilePhoto instanceof File) {
        formData.append('avatar', updateData.profilePhoto);
      }

      const response = await privateApi.put(
        `/api/users/players/${playerId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      return UserService._handleApiError(error, 'Player profile update failed');
    }
  },

  /**
   * Shared error handler
   * @private
   */
  _handleApiError: (error, defaultMessage) => {
    // Handle timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error(`REQUEST_TIMEOUT:${defaultMessage}`);
    }

    // Handle backend responses
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific error cases
      if (status === 401) {
        throw new Error('UNAUTHORIZED:Please login again');
      }
      
      if (data?.message?.includes('already in use')) {
        throw new Error(`PHONE_EXISTS:${data.message || 'Phone number already in use'}`);
      }

      throw new ErrorResponse(
        data?.message || data?.error || defaultMessage,
        status
      );
    }

    // Network errors
    if (error.request) {
      throw new Error('NETWORK_ERROR:Please check your internet connection');
    }

    // Other errors
    throw new Error(`UNKNOWN_ERROR:${error.message || defaultMessage}`);
  }
};

export default UserService;