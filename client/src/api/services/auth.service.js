import { publicApi, privateApi } from '../httpClient';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const AuthService = {
  /**
   * Login with phone number and password
   * @param {Object} credentials - { phoneNumber: string, password: string }
   * @returns {Promise<{user: Object, token: string}>}
   */
  async login(credentials) {
    try {
      const response = await publicApi.post('/api/auth/login', credentials);
      return {
        user: response.data,
        token: response.token
      };
    } catch (error) {
      // Already properly formatted by httpClient interceptor
      throw error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwords - { currentPassword: string, newPassword: string }
   * @returns {Promise<{message: string}>}
   */
  async changePassword(passwords) {
    try {
      const response = await privateApi.patch('/api/auth/change-password', passwords);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise<Object>} User data
   */
  async getCurrentUser() {
    try {
      const response = await privateApi.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout the current user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await privateApi.post('/api/auth/logout');
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<{token: string}>}
   */
  async refreshToken() {
    try {
      const response = await publicApi.post('/api/auth/refresh-token');
      return {
        token: response.token
      };
    } catch (error) {
      throw error;
    }
  }
};