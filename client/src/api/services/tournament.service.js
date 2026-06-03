// api/services/tournament.service.js
import { publicApi, privateApi } from '../httpClient';
import { ErrorResponse } from '../../utils/errorResponse';

const TournamentService = {
  /**
   * Create a new tournament (admin only)
   * @param {Object} tournamentData - Tournament creation data (name, startDate, endDate)
   * @returns {Promise<Object>} - Created tournament data
   */
  createTournament: async (tournamentData) => {
    try {
      const response = await privateApi.post('/api/tournaments', tournamentData, {
        timeout: 15000
      });
      
      if (response.success) {
        return response.data;
      }
      throw new ErrorResponse('Tournament creation failed', 400);
    } catch (error) {
      return TournamentService._handleApiError(error, 'Tournament creation failed');
    }
  },

  /**
   * Get all tournaments with optional filtering
   * @param {string} [status] - Optional filter (upcoming/active)
   * @returns {Promise<Array>} - Array of tournament objects
   */
  getAllTournaments: async (status) => {
    try {
      const url = status 
        ? `/api/tournaments?status=${status}`
        : '/api/tournaments';
      
      const response = await publicApi.get(url);
      return response.data;
    } catch (error) {
      return TournamentService._handleApiError(error, 'Failed to fetch tournaments');
    }
  },

  /**
   * Get single tournament by ID
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<Object>} - Tournament details
   */
  getTournament: async (tournamentId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }

      const response = await publicApi.get(`/api/tournaments/${tournamentId}`);
      return response.data;
    } catch (error) {
      return TournamentService._handleApiError(error, 'Failed to fetch tournament');
    }
  },

  /**
   * Update tournament (admin only)
   * @param {number} tournamentId - ID of tournament to update
   * @param {Object} updateData - Data to update (name, startDate, endDate)
   * @returns {Promise<Object>} - Updated tournament data
   */
  updateTournament: async (tournamentId, updateData) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }

      const response = await privateApi.put(
        `/api/tournaments/${tournamentId}`,
        updateData,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return TournamentService._handleApiError(error, 'Tournament update failed');
    }
  },

  /**
   * Delete tournament (admin only)
   * @param {number} tournamentId - ID of tournament to delete
   * @returns {Promise<Object>} - Delete confirmation
   */
  deleteTournament: async (id) => {
    try {
      if (!id || isNaN(id)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }

      const response = await privateApi.delete(`/api/tournaments/${id}`);
      return response.data;
    } catch (error) {
      return TournamentService._handleApiError(error, 'Tournament deletion failed');
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
      
      if (data?.message?.includes('already exists')) {
        throw new Error(`TOURNAMENT_EXISTS:${data.message || 'Tournament already exists'}`);
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

export default TournamentService;