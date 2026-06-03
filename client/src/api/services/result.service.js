// api/services/result.service.js
import { publicApi, privateApi } from '../httpClient';
import { ErrorResponse } from '../../utils/errorResponse';

const ResultService = {
  // REMOVED: createResult - Results are created automatically with matches

  /**
   * Get all results with optional filtering
   * @param {number} [matchId] - Optional filter by match ID
   * @param {number} [minGoals] - Optional minimum goals filter
   * @param {number} [maxGoals] - Optional maximum goals filter
   * @returns {Promise<Array>} - Array of result objects
   */
  getAllResults: async (matchId, minGoals, maxGoals) => {
    try {
      let url = '/api/results';
      const params = new URLSearchParams();
      
      if (matchId) params.append('matchId', matchId);
      if (minGoals !== undefined) params.append('minGoals', minGoals);
      if (maxGoals !== undefined) params.append('maxGoals', maxGoals);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await publicApi.get(url);
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Failed to fetch results');
    }
  },

  /**
   * Get single result by ID
   * @param {number} resultId - ID of the result
   * @returns {Promise<Object>} - Result details
   */
  getResult: async (resultId) => {
    try {
      if (!resultId || isNaN(resultId)) {
        throw new ErrorResponse('Valid result ID is required', 400);
      }

      const response = await publicApi.get(`/api/results/${resultId}`);
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Failed to fetch result');
    }
  },

  /**
   * Get result by match ID
   * @param {number} matchId - ID of the match
   * @returns {Promise<Object>} - Result details for the match
   */
  getResultByMatch: async (matchId) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }

      const response = await publicApi.get(`/api/results/match/${matchId}`);
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Failed to fetch result for match');
    }
  },

  /**
   * Get match winner information
   * @param {number} matchId - ID of the match
   * @returns {Promise<Object>} - Winner information
   */
  getMatchWinner: async (matchId) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }

      const response = await publicApi.get(`/api/results/match/${matchId}/winner`);
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Failed to fetch match winner');
    }
  },

  /**
   * Get total goals statistics
   * @returns {Promise<Object>} - Goals statistics
   */
  getTotalGoals: async () => {
    try {
      const response = await publicApi.get('/api/results/stats/goals');
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Failed to fetch goals statistics');
    }
  },

  /**
   * Update result (admin/referee only)
   * @param {number} resultId - ID of result to update
   * @param {Object} updateData - Data to update (pOneGoal, pTwoGoal, matchesId)
   * @returns {Promise<Object>} - Updated result data
   */
  updateResult: async (resultId, updateData) => {
    try {
      if (!resultId || isNaN(resultId)) {
        throw new ErrorResponse('Valid result ID is required', 400);
      }

      const response = await privateApi.put(
        `/api/results/${resultId}`,
        updateData,
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Result update failed');
    }
  },

  // REMOVED: deleteResult - Results cannot be deleted directly
  // REMOVED: deleteResultByMatch - Results cannot be deleted directly

  /**
   * Reset result goals for a match (admin/referee only)
   * @param {number} matchId - ID of match to reset goals for
   * @returns {Promise<Object>} - Reset result data
   */
  resetResult: async (matchId) => {
    try {
      if (!matchId || isNaN(matchId)) {
        throw new ErrorResponse('Valid match ID is required', 400);
      }

      const response = await privateApi.patch(
        `/api/results/match/${matchId}/reset`,
        {},
        { timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      return ResultService._handleApiError(error, 'Result reset failed');
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
        throw new Error(`RESULT_EXISTS:${data.message || 'Result already exists for this match'}`);
      }

      if (data?.message?.includes('not found')) {
        throw new Error(`NOT_FOUND:${data.message || 'Result not found'}`);
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

export default ResultService;