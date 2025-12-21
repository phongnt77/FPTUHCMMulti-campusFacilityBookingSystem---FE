import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';
import { getToken } from '../utils/auth';

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5252';

/**
 * Public API client for unauthenticated endpoints (login, register, etc.)
 * Does not include Authorization header
 */
export const publicApiClient: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Centralized Axios instance with default configuration and authentication
 * All authenticated API files should use this instance instead of creating their own
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: automatically add auth token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle common errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Optionally redirect to login or clear auth
      console.warn('Unauthorized request - token may be expired');
    }
    return Promise.reject(error);
  }
);

/**
 * Standardized error handler for API calls
 * Converts axios errors to user-friendly error messages
 */
export const handleApiError = (error: unknown, defaultMessage: string): Error => {
  if (axios.isAxiosError(error)) {
    // Server responded with error status
    if (error.response) {
      const responseData = error.response.data as { error?: { message?: string }; message?: string };
      const errorMessage = responseData?.error?.message || responseData?.message || error.response.statusText || defaultMessage;
      return new Error(errorMessage);
    }
    
    // Request made but no response received
    if (error.request) {
      return new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    }
  }
  
  // Unknown error
  console.error('API Error:', error);
  return new Error(defaultMessage || 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
};

/**
 * Helper to handle FormData requests (for file uploads)
 * Automatically removes Content-Type header to let browser set it with boundary
 */
export const createFormDataConfig = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      ...config?.headers,
      // Don't set Content-Type for FormData - browser will set it with boundary
    },
  };
};

