// api/services/match.service.js
import { publicApi, privateApi } from '../httpClient';
import { ErrorResponse } from '../../utils/errorResponse';

const MatchService = {
  /**
   * Create a new match in a league
   * @param {Object} matchData - Match creation data
   * @param {number} matchData.league_id - League ID
   * @returns {Promise<Object>} - Created match data
   */
  createMatch: async (matchData) => {
    try {
      if (!matchData.league_id) {
        throw new ErrorResponse('League ID is required', 400);
      }
      
      const response = await privateApi.post('/api/matches', matchData, {
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to create match');
    }
  },

  /**
   * Get match by ID
   * @param {number} matchId - ID of the match to fetch
   * @returns {Promise<Object>} - Match data with league info
   */
  getMatch: async (matchId) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }
      
      const response = await privateApi.get(`/api/matches/${matchId}`);
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to fetch match');
    }
  },

  /**
   * Update match details
   * @param {number} matchId - ID of the match to update
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated match data
   */
  updateMatch: async (matchId, updateData) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }

      const response = await privateApi.put(
        `/api/matches/${matchId}`,
        updateData,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to update match');
    }
  },

  /**
   * Delete a match by ID
   * @param {number} matchId - ID of the match to delete
   * @returns {Promise<Object>} - Deletion confirmation
   */
  deleteMatch: async (matchId) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }

      const response = await privateApi.delete(
        `/api/matches/${matchId}`,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to delete match');
    }
  },

  /**
   * Set match winner
   * @param {number} matchId - ID of the match
   * @param {number} winnerId - ID of the winning player
   * @returns {Promise<Object>} - Updated match data
   */
  setMatchWinner: async (matchId, winnerId) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }
      if (!winnerId || isNaN(winnerId)) {
        throw new ErrorResponse('Valid winner ID is required', 400);
      }

      const response = await privateApi.put(
        `/api/matches/${matchId}/winner`,
        { winner_id: winnerId },
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to set match winner');
    }
  },

  /**
   * Get matches by league ID
   * @param {number} leagueId - League ID
   * @returns {Promise<Array>} - Array of matches
   */
  getMatchesByLeague: async (leagueId) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await publicApi.get(`/api/matches/league/${leagueId}`);
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to fetch matches by league');
    }
  },

  /**
   * Get matches by league and round
   * @param {number} leagueId - League ID
   * @param {number} roundLevel - Round number (1-4)
   * @returns {Promise<Array>} - Array of matches
   */
  getMatchesByLeagueAndRound: async (leagueId, roundLevel) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }
      if (!roundLevel || isNaN(roundLevel) || roundLevel < 1 || roundLevel > 4) {
        throw new ErrorResponse('Valid round level (1-4) is required', 400);
      }

      const response = await privateApi.get(
        `/api/matches/league/${leagueId}/round/${roundLevel}`
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to fetch matches by league and round');
    }
  },

  /**
   * Initialize tournament bracket with 16 players in a league
   * @param {number} leagueId - League ID
   * @param {Array<number>} playerIds - Array of exactly 16 player IDs
   * @returns {Promise<Object>} - Bracket initialization data
   */
  initializeBracket: async (leagueId, playerIds) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }
      if (!Array.isArray(playerIds) || playerIds.length !== 16) {
        throw new ErrorResponse('Exactly 16 player IDs are required', 400);
      }

      const response = await privateApi.post(
        '/api/matches/initialize-bracket',
        { league_id: leagueId, player_ids: playerIds },
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to initialize bracket');
    }
  },

  /**
   * Advance winners to next round in a league
   * @param {number} leagueId - League ID
   * @param {number} currentRound - Current round number (1-3)
   * @returns {Promise<Object>} - Next round matches
   */
  advanceWinners: async (leagueId, currentRound) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }
      if (!currentRound || isNaN(currentRound) || currentRound < 1 || currentRound > 3) {
        throw new ErrorResponse('Valid current round (1-3) is required', 400);
      }

      const response = await privateApi.post(
        '/api/matches/advance-winners',
        { league_id: leagueId, current_round: currentRound },
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to advance winners');
    }
  },

  /**
   * Get complete bracket structure for a league
   * @param {number} leagueId - League ID
   * @returns {Promise<Object>} - Complete bracket data
   */
  getCompleteBracket: async (leagueId) => {
    try {
      if (!leagueId || isNaN(leagueId)) {
        throw new ErrorResponse('Valid league ID is required', 400);
      }

      const response = await privateApi.get(
        `/api/matches/league/${leagueId}/complete-bracket`
      );
      return response.data;
    } catch (error) {
      return MatchService._handleApiError(error, 'Failed to fetch complete bracket');
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
      
      if (status === 400 && data?.message?.includes('already exists')) {
        throw new Error(`MATCH_EXISTS:${data.message || 'Match already exists'}`);
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

export default MatchService;