import { describe, it, expect, vi, beforeEach, fail } from 'vitest';
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

    it('should handle token expiration and refresh successfully', async () => {
      const originalResponse = { data: { data: 'test' } };
      const newToken = 'new-token';
      const error = {
        config: {
          headers: {},
          url: '/api/users/me'
        },
        response: {
          status: 401,
          data: {
            error: 'Token expired'
          }
        }
      };

      // Mock auth store with refresh token
      useAuthStore.getState.mockReturnValue({
        token: 'old-token',
        refreshToken: 'test-refresh-token',
        setToken: vi.fn(),
        logout: vi.fn()
      });

      // Mock successful token refresh
      axios.post.mockResolvedValueOnce({
        data: {
          data: {
            access: newToken
          }
        }
      });

      mockAxiosInstance.mockResolvedValueOnce(originalResponse);

      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      const result = await responseErrorInterceptor(error);

      expect(axios.post).toHaveBeenCalledWith(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
        { refresh: 'test-refresh-token' }
      );

      expect(useAuthStore.getState().setToken).toHaveBeenCalledWith(newToken);
      expect(error.config.headers.Authorization).toBe(`Bearer ${newToken}`);
      expect(result).toEqual(originalResponse);
    });

    it('should handle token refresh failure', async () => {
      const error = {
        config: {
          headers: {},
          url: '/api/users/me'
        },
        response: {
          status: 401,
          data: {
            error: 'Token expired'
          }
        }
      };

      useAuthStore.getState.mockReturnValue({
        token: 'old-token',
        refreshToken: 'test-refresh-token',
        setToken: vi.fn(),
        logout: vi.fn()
      });

      axios.post.mockRejectedValueOnce(new Error('Session expired'));

      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      try {
        await responseErrorInterceptor(error);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e.message).toBe('Session expired');
      }
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
    });

    it('should reject immediately for non-token-expiration errors', async () => {
      const error = {
        config: {
          headers: {},
          url: '/api/users/me'
        },
        response: {
          status: 400,
          data: {
            error: 'Bad Request'
          }
        }
      };

      const responseErrorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
      await expect(responseErrorInterceptor(error)).rejects.toMatchObject({
        message: 'Bad Request',
        type: 'API_ERROR',
        statusCode: 400
      });
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
