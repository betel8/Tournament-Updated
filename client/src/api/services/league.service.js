// api/services/league.service.js
import { publicApi, privateApi } from '../httpClient';
import { ErrorResponse } from '../../utils/errorResponse';

const LeagueService = {
  /**
   * Create a new league (admin only)
   * @param {Object} leagueData - League creation data
   * @returns {Promise<Object>} - Created league data
   */
  createLeague: async (leagueData) => {
    try {
      const response = await privateApi.post('/api/leagues', leagueData, {
        timeout: 15000
      });
      
      if (response.success) {
        return response.data;
      }
      throw new ErrorResponse('League creation failed', 400);
    } catch (error) {
      return LeagueService._handleApiError(error, 'League creation failed');
    }
  },

  /**
   * Get all leagues with optional filtering
   * @param {Object} [filters] - Optional filters
   * @param {number} [filters.tournamentId] - Tournament ID filter
   * @param {number} [filters.playerStrength] - Player strength for matching leagues
   * @returns {Promise<Array>} - Array of league objects
   */
  getAllLeagues: async (filters = {}) => {
    try {
      const { tournamentId, playerStrength } = filters;
      let url = '/api/leagues';
      if (tournamentId && playerStrength) {
        url += `?tournament_id=${tournamentId}&player_strength=${playerStrength}`;
      } else if (tournamentId) {
        url += `?tournament_id=${tournamentId}`;
      } else if (playerStrength) {
        url += `?player_strength=${playerStrength}`;
      }
      const response = await publicApi.get(url);
      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'Failed to fetch leagues');
    }
  },

  /**
   * Get leagues suitable for a player's strength
   * @param {number} tournamentId - Tournament ID
   * @param {number} playerStrength - Player's strength rating
   * @returns {Promise<Array>} - Array of matching league objects
   */
  findLeaguesForPlayer: async (tournamentId, playerStrength) => {
    try {
      if (!tournamentId || !playerStrength || isNaN(tournamentId) || isNaN(playerStrength)) {
        throw new ErrorResponse('Tournament ID and player strength are required', 400);
      }

      const response = await publicApi.get(
        `/api/leagues/for-player?tournament_id=${tournamentId}&player_strength=${playerStrength}`
      );
      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'Failed to find suitable leagues');
    }
  },

  /**
   * Get single league by ID
   * @param {number} leagueId - ID of the league
   * @returns {Promise<Object>} - League details
   */
  getLeague: async (leagueId) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await publicApi.get(`/api/leagues/${leagueId}`);
      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'Failed to fetch league');
    }
  },

  /**
   * Update league (admin only)
   * @param {number} leagueId - ID of league to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated league data
   */
  updateLeague: async (leagueId, updateData) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await privateApi.put(
        `/api/leagues/${leagueId}`,
        updateData,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'League update failed');
    }
  },

  /**
   * Delete league (admin only)
   * @param {number} leagueId - ID of league to delete
   * @returns {Promise<Object>} - Delete confirmation
   */
  deleteLeague: async (leagueId) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await privateApi.delete(`/api/leagues/${leagueId}`);
      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'League deletion failed');
    }
  },

  /**
   * Mark league as completed (admin only)
   * @param {number} leagueId - ID of league to complete
   * @returns {Promise<Object>} - Completion confirmation
   */
  completeLeague: async (leagueId) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await privateApi.patch(
        `/api/leagues/${leagueId}/complete`,
        null,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'Failed to complete league');
    }
  },

  /**
   * Get all players in a specific league
   * @param {number} leagueId - ID of the league
   * @returns {Promise<Array>} - Array of player objects with details
   */
  getLeaguePlayers: async (leagueId) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await publicApi.get(`/api/leagues/${leagueId}/players`);

      if (!response.data || !Array.isArray(response.data)) {
        throw new ErrorResponse('Invalid players data received', 500);
      }

      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'Failed to fetch league players');
    }
  },

  /**
   * Get available players for a specific round in a league
   * (Players not already assigned to matches in this round)
   * @param {number} leagueId - ID of the league
   * @param {number} roundLevel - Round level (1-4 typically)
   * @returns {Promise<Array>} - Array of available player objects
   */
  getAvailablePlayersForRound: async (leagueId, roundLevel) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }
      if (!roundLevel || isNaN(roundLevel)) {
        throw new ErrorResponse('Valid round level is required', 400);
      }

      const response = await publicApi.get(
        `/api/leagues/${leagueId}/round/${roundLevel}/available-players`
      );

      if (!response.data || !Array.isArray(response.data)) {
        throw new ErrorResponse('Invalid players data received', 500);
      }

      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(
        error, 
        'Failed to fetch available players for round'
      );
    }
  },

  /**
   * Assign player to a league (admin only)
   * @param {number} leagueId - ID of the league
   * @param {number} playerId - ID of the player
   * @returns {Promise<Object>} - Assignment confirmation
   */
  assignPlayerToLeague: async (leagueId, playerId) => {
    try {
      if (!leagueId || !playerId || isNaN(leagueId) || isNaN(playerId)) {
        throw new ErrorResponse('Valid league ID and player ID are required', 400);
      }

      const response = await privateApi.post(
        `/api/leagues/${leagueId}/players`,
        { player_id: playerId },
        { timeout: 10000 }
      );

      return response.data;
    } catch (error) {
      return LeagueService._handleApiError(error, 'Failed to assign player to league');
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
        throw new Error(`LEAGUE_EXISTS:${data.message || 'League already exists'}`);
      }

      if (data?.message?.includes('strength')) {
        throw new Error(`STRENGTH_ERROR:${data.message || 'Invalid strength range'}`);
      }

      if (data?.message?.includes('player limit')) {
        throw new Error(`PLAYER_LIMIT:${data.message || 'League player limit reached'}`);
      }

      if (data?.message?.includes('not found')) {
        throw new Error(`NOT_FOUND:${data.message || 'Resource not found'}`);
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

export default LeagueService;