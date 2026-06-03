import axios from 'axios';
import { API_CONFIG } from './config';

// Public API client (no auth required)
export const publicApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Content-Type': 'application/json'
  }
});

// Private API client (requires auth token)
export const privateApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for privateApi
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('player_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced response interceptors
const handleResponse = (response) => {
  // Directly return the data if it exists
  return response.data || response;
};

const handleError = (error) => {
  // Preserve the complete error structure from backend
  if (error.response) {
    // Backend error with response
    return Promise.reject({
      ...error.response.data,
      status: error.response.status,
      headers: error.response.headers
    });
  } else if (error.request) {
    // No response received
    return Promise.reject({
      error: 'errors.network',
      errorType: 'NETWORK_ERROR',
      message: 'No response from server'
    });
  } else {
    // Request setup error
    return Promise.reject({
      error: 'errors.request',
      errorType: 'REQUEST_ERROR',
      message: error.message
    });
  }
};

// Apply interceptors
publicApi.interceptors.response.use(handleResponse, handleError);
privateApi.interceptors.response.use(handleResponse, handleError);

// Add timeout error handling
[publicApi, privateApi].forEach(api => {
  api.interceptors.request.use(config => {
    config.timeout = config.timeout || API_CONFIG.TIMEOUT;
    return config;
  });
});