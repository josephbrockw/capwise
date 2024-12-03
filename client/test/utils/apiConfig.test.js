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

  describe('Token Refresh Handling', () => {
    // eslint-disable-next-line no-unused-vars
    let apiClient;
    let mockApi;

    beforeEach(() => {
      mockApi = {
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() }
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
      };

      apiClient = new ApiClient({ api: mockApi });
    });

    it('should retry failed request with new token after successful refresh', async () => {
      const originalRequest = {
        headers: {},
        url: '/api/data',
        _retry: false
      };

      const error = {
        config: originalRequest,
        response: { status: 401 }
      };

      const newToken = 'new-token';
      const refreshToken = 'refresh-token';

      // Mock auth store state
      vi.spyOn(useAuthStore.getState(), 'refreshToken', 'get')
        .mockReturnValue(refreshToken);
      vi.spyOn(useAuthStore.getState(), 'setToken')
        .mockImplementation(() => {});

      // Mock successful token refresh
      axios.post.mockResolvedValueOnce({
        data: {
          data: { access: newToken }
        }
      });

      // Mock successful retry of original request
      mockApi.mockResolvedValueOnce({ data: 'success' });

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];
      const result = await responseInterceptor(error);

      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/refresh'),
        { refresh: refreshToken }
      );
      expect(useAuthStore.getState().setToken).toHaveBeenCalledWith(newToken);
      expect(originalRequest.headers.Authorization).toBe(`Bearer ${newToken}`);
      expect(result).toEqual({ data: 'success' });
    });

    it('should not retry non-401 errors', async () => {
      const error = {
        config: { url: '/api/data' },
        response: { status: 500, data: { error: 'Server error' } }
      };

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toThrow('Server error');
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should not retry login endpoint', async () => {
      const error = {
        config: { url: '/api/auth/login' },
        response: { status: 401, data: { error: 'Invalid credentials' } }
      };

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toThrow('Invalid credentials');
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle missing refresh token', async () => {
      const error = {
        config: { url: '/api/data', headers: {} },
        response: { status: 401 }
      };

      // Mock auth store with no refresh token
      vi.spyOn(useAuthStore.getState(), 'refreshToken', 'get')
        .mockReturnValue(null);
      vi.spyOn(useAuthStore.getState(), 'logout')
        .mockImplementation(() => {});

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toThrow('No refresh token available');
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
    });

    it('should handle refresh token failure', async () => {
      const error = {
        config: { url: '/api/data', headers: {} },
        response: { status: 401 }
      };

      vi.spyOn(useAuthStore.getState(), 'refreshToken', 'get')
        .mockReturnValue('refresh-token');
      vi.spyOn(useAuthStore.getState(), 'logout')
        .mockImplementation(() => {});

      // Mock failed token refresh
      axios.post.mockRejectedValueOnce(new Error('Invalid refresh token'));

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toThrow('Session expired');
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
    });

    it('should handle network errors during refresh', async () => {
      const error = {
        config: { url: '/api/data', headers: {} },
        response: { status: 401 }
      };

      vi.spyOn(useAuthStore.getState(), 'refreshToken', 'get')
        .mockReturnValue('refresh-token');
      vi.spyOn(useAuthStore.getState(), 'logout')
        .mockImplementation(() => {});

      // Mock network error during refresh
      axios.post.mockRejectedValueOnce({ message: 'Network Error' });

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toThrow('Session expired');
      expect(useAuthStore.getState().logout).toHaveBeenCalled();
    });

    it('should prevent infinite refresh loops', async () => {
      const error = {
        config: {
          url: '/api/data',
          headers: {},
          _retry: true // Request has already been retried
        },
        response: { status: 401 }
      };

      const responseInterceptor = mockApi.interceptors.response.use.mock.calls[0][1];

      await expect(responseInterceptor(error)).rejects.toThrow('Session expired');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
});
