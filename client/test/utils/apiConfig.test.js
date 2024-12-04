import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../../src/utils/apiConfig';
import { useAuthStore } from '../../src/stores';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => {
  const mockPost = vi.fn();
  return {
    default: {
      create: vi.fn(() => ({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        get: vi.fn(),
        post: mockPost,
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
      })),
      post: mockPost
    }
  };
});

// Mock the auth store
vi.mock('../../src/stores', () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      token: null,
      refreshToken: null,
      setToken: vi.fn(),
      logout: vi.fn()
    }))
  }
}));

describe('ApiClient', () => {
  let apiClient;
  let mockAxiosInstance;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = vi.fn();
    Object.assign(mockAxiosInstance, {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    });

    // Mock axios.create to return our mockAxiosInstance
    axios.create = vi.fn().mockReturnValue(mockAxiosInstance);

    // Create ApiClient instance
    apiClient = new ApiClient();
    // Set the mock instance as the api property
    apiClient.api = mockAxiosInstance;
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', () => {
      // Mock auth store to return a token
      useAuthStore.getState.mockReturnValue({
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        setToken: vi.fn(),
        logout: vi.fn()
      });

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers.Authorization).toBe('Bearer test-token');
    });

    it('should not add authorization header when token does not exist', () => {
      // Mock auth store to return no token
      useAuthStore.getState.mockReturnValue({
        token: null,
        refreshToken: null,
        setToken: vi.fn(),
        logout: vi.fn()
      });

      // Get the request interceptor function
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      const config = { headers: {} };
      const result = requestInterceptor(config);

      expect(result.headers?.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should handle successful responses', () => {
      const response = { data: 'test' };
      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
      const result = responseInterceptor(response);

      expect(result).toBe(response);
    });

    it('should handle token refresh failure', async () => {
      // Simple error setup
      const error = {
        config: { url: '/api/data' },
        response: { status: 401 }
      };

      // Mock store with minimal required state
      useAuthStore.getState.mockReturnValue({
        refreshToken: 'test-refresh-token',
        logout: vi.fn()
      });

      // Mock refresh failure
      axios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Invalid refresh token' }
        }
      });

      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      // Verify error is thrown and logout is called
      await expect(responseErrorInterceptor(error)).rejects.toThrow('Session expired');
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
    });

    it('should not retry non-401 errors', async () => {
      // Setup a 404 error
      const error = {
        config: { url: '/api/data' },
        response: {
          status: 404,
          data: { error: 'Not found' }
        }
      };

      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      // Verify error is passed through as ApiError
      await expect(responseInterceptor(error)).rejects.toMatchObject({
        message: 'Not found',
        type: 'API_ERROR',
        statusCode: 404
      });
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should not retry login endpoint', async () => {
      // Setup a 401 error on login endpoint
      const error = {
        config: { url: '/api/auth/login' },
        response: {
          status: 401,
          data: { error: 'Invalid credentials' }
        }
      };

      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      // Verify login errors are passed through as ApiError
      await expect(responseInterceptor(error)).rejects.toMatchObject({
        message: 'Invalid credentials',
        type: 'API_ERROR',
        statusCode: 401
      });
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle missing refresh token', async () => {
      // Setup error and no refresh token
      const error = {
        config: { url: '/api/data' },
        response: { status: 401 }
      };

      useAuthStore.getState.mockReturnValue({
        refreshToken: null,
        logout: vi.fn()
      });

      const responseInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      // Verify session expired error and logout
      await expect(responseInterceptor(error)).rejects.toThrow('Session expired');
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
