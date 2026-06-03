// api/services/tournamentPlayer.service.js
import { privateApi } from '../httpClient';
import { ErrorResponse } from '../../utils/errorResponse';

const TournamentPlayerService = {
  /**
   * Add player to tournament (admin only)
   * @param {number} tournamentId - ID of the tournament
   * @param {number} playerId - ID of the player to add
   * @returns {Promise<Object>} - Response data
   */
  addPlayerToTournament: async (tournamentId, playerId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const response = await privateApi.post(
        `/api/tournament-players/${tournamentId}`,
        { playerId }
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to add player to tournament');
    }
  },

  /**
   * Add multiple players to tournament (admin only)
   * @param {number} tournamentId - ID of the tournament
   * @param {Array<number>} playerIds - Array of player IDs to add
   * @returns {Promise<Object>} - Response data
   */
  addPlayersToTournament: async (tournamentId, playerIds) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      if (!Array.isArray(playerIds) || playerIds.length === 0) {
        throw new ErrorResponse('Array of player IDs is required', 400);
      }

      const response = await privateApi.post(
        `/api/tournament-players/${tournamentId}/bulk`,
        { playerIds }
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to add players to tournament');
    }
  },

  /**
   * Assign multiple players to a league (bulk operation)
   * @param {number} tournamentId - ID of the tournament
   * @param {Array<number>} playerIds - Array of player IDs to assign
   * @param {number} leagueId - ID of the league to assign to
   * @returns {Promise<Object>} - Response data
   */
  assignPlayersToLeague: async (tournamentId, playerIds, leagueId) => {
    try {
      
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      if (!Array.isArray(playerIds) || playerIds.length === 0) {
        throw new ErrorResponse('Array of player IDs is required', 400);
      }
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }
      console.log(tournamentId)
      const response = await privateApi.put(
        `/api/tournament-players/${tournamentId}/bulk/league`,
        { 
          player_ids: playerIds, 
          league_id: leagueId 
        }
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to assign players to league');
    }
  },

  /**
   * Remove player from tournament (admin only)
   * @param {number} tournamentId - ID of the tournament
   * @param {number} playerId - ID of the player to remove
   * @returns {Promise<Object>} - Response data
   */
  removePlayerFromTournament: async (tournamentId, playerId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const response = await privateApi.delete(
        `/api/tournament-players/${tournamentId}/${playerId}`
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to remove player from tournament');
    }
  },
  /**
 * Remove player from league (admin only)
 * @param {number} tournamentId - ID of the tournament
 * @param {number} playerId - ID of the player to remove from league
 * @returns {Promise<Object>} - Response data
 */
  removePlayerFromLeague: async (tournamentId, playerId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const response = await privateApi.delete(
        `/api/tournament-players/${tournamentId}/${playerId}/league`
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to remove player from league');
    }
  },

  /**
   * Get all players in a tournament
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<Array>} - Array of player objects
   */
  getTournamentPlayers: async (tournamentId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }

      const response = await privateApi.get(
        `/api/tournament-players/${tournamentId}`
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to fetch tournament players');
    }
  },

  /**
   * Get players NOT in a tournament (admin only)
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<Array>} - Array of player objects
   */
  getAvailablePlayersForTournament: async (tournamentId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }

      const response = await privateApi.get(
        `/api/tournament-players/${tournamentId}/available`
      );
      return response.data;
    } catch (error) {
        console.log(error)
      return TournamentPlayerService._handleApiError(error, 'Failed to fetch available players');
    }
  },

  /**
   * Get all tournaments for a player
   * @param {number} playerId - ID of the player
   * @returns {Promise<Array>} - Array of tournament objects
   */
  getPlayerTournaments: async (playerId) => {
    try {
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const response = await privateApi.get(
        `/api/tournament-players/player/${playerId}`
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to fetch player tournaments');
    }
  },

  /**
   * Check if player is in tournament
   * @param {number} tournamentId - ID of the tournament
   * @param {number} playerId - ID of the player
   * @returns {Promise<boolean>} - Whether player is in tournament
   */
  checkPlayerInTournament: async (tournamentId, playerId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      if (!playerId || isNaN(playerId)) {
        throw new ErrorResponse('Valid player ID is required', 400);
      }

      const response = await privateApi.get(
        `/api/tournament-players/${tournamentId}/check/${playerId}`
      );
      return response.data.isMember;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to check player membership');
    }
  },

  /**
   * Remove all players from tournament (admin only)
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<Object>} - Response data
   */
  clearTournamentPlayers: async (tournamentId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }
      const response = await privateApi.delete(
        `/api/tournament-players/${tournamentId}/clear`
      );
      return response.data;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to clear tournament players');
    }
  },

  /**
   * Get tournament player count
   * @param {number} tournamentId - ID of the tournament
   * @returns {Promise<number>} - Number of players in tournament
   */
  getTournamentPlayerCount: async (tournamentId) => {
    try {
      if (!tournamentId || isNaN(tournamentId)) {
        throw new ErrorResponse('Valid tournament ID is required', 400);
      }

      const response = await privateApi.get(
        `/api/tournament-players/${tournamentId}/count`
      );
      return response.data.count;
    } catch (error) {
      return TournamentPlayerService._handleApiError(error, 'Failed to get player count');
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
      
      if (data?.message?.includes('already in')) {
        throw new Error(`PLAYER_EXISTS:${data.message || 'Player already in tournament'}`);
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

export default TournamentPlayerService;