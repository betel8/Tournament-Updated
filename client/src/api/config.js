export const API_CONFIG = {
  // Base API configuration
  BASE_URL:'http://192.168.1.16:5000',
  //BASE_URL: 'https://www.playzon.org.et',
  TIMEOUT: 10000, // 10 seconds default
  MAX_RETRIES: 3, // For retry mechanism
  RETRY_DELAY: 1000, // 1 second between retries

  // Headers configuration
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Auth-specific headers (will be added when token is available)
  AUTH_HEADERS: {
    'Authorization': ''
  },

  // API endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      REFRESH: '/api/auth/refresh',
      LOGOUT: '/api/auth/logout',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password'
    },
    USER: {
      PROFILE: '/api/users/profile',
      UPDATE: '/api/users/update'
    }
  },

  // Error handling configuration
  ERROR_CONFIG: {
    RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504], // Status codes to retry
    NETWORK_ERRORS: ['ECONNABORTED', 'ETIMEDOUT'] // Network errors to handle
  },

  // Development mode settings
  DEV_MODE: {
    LOG_REQUESTS: true,
    LOG_RESPONSES: true,
    LOG_ERRORS: true
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token) => {
  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`
  };
};