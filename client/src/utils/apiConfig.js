import axios from 'axios';
import { useAuthStore } from '../stores';

export class ApiError extends Error {
  constructor(message, type = 'API_ERROR', statusCode = null) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = statusCode;
  }
}

export class ApiClient {
  constructor(deps = {}) {
    this.deps = deps;

    // If deps.api is provided, use it (for testing)
    if (deps.api) {
      this.api = deps.api;
      return;
    }

    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for adding auth token
    this.api.interceptors.request.use(
      (config) => {
        // Get token from auth store
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(new ApiError(error.message, 'REQUEST_ERROR'));
      }
    );

    // Response interceptor for handling token refresh and errors
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried refreshing yet, and it's not the login endpoint
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/login')) {
          originalRequest._retry = true;

          try {
            // Get refresh token from auth store
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) {
              throw new ApiError('No refresh token available', 'AUTH_ERROR');
            }

            // Attempt to refresh token
            const response = await axios.post(
              `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
              { refresh: refreshToken }
            );

            const { access: newToken } = response.data.data;

            // Update token in auth store
            useAuthStore.getState().setToken(newToken);

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            // If refresh fails, log out
            useAuthStore.getState().logout();
            return Promise.reject(new ApiError('Session expired', 'AUTH_ERROR'));
          }
        }

        // Handle network errors
        if (!error.response) {
          return Promise.reject(new ApiError('Network error occurred', 'NETWORK_ERROR'));
        }

        // Handle API errors
        const message = error.response.data?.error || error.message || 'An error occurred';
        return Promise.reject(new ApiError(message, 'API_ERROR', error.response.status));
      }
    );
  }

  async handleRequest(requestPromise) {
    try {
      const response = await requestPromise;
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error.response) {
        const message = error.response.data?.error || error.message || 'An error occurred';
        throw new ApiError(message, 'API_ERROR', error.response.status);
      }
      throw new ApiError(error.message || 'Network error occurred', 'NETWORK_ERROR');
    }
  }

  async get(url) {
    return this.handleRequest(this.api.get(url));
  }

  async post(url, data) {
    return this.handleRequest(this.api.post(url, data));
  }

  async put(url, data) {
    return this.handleRequest(this.api.put(url, data));
  }

  async patch(url, data) {
    return this.handleRequest(this.api.patch(url, data));
  }

  async delete(url) {
    return this.handleRequest(this.api.delete(url));
  }
}

export const createApiClient = (deps = {}) => {
  return new ApiClient(deps);
};
