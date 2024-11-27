import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../../src/utils/apiConfig';

describe('ApiClient', () => {
  // eslint-disable-next-line no-unused-vars
  let apiClient;
  let mockAxios;
  let mockStorageHelper;
  let mockAxiosInstance;
  let requestHandler;
  let responseHandler;
  let responseErrorHandler;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    };

    // Create mock axios with both function and object properties
    const axiosRequest = vi.fn();
    mockAxios = Object.assign(axiosRequest, {
      create: vi.fn(() => mockAxiosInstance),
      post: vi.fn()
    });

    // Create mock storage helper
    mockStorageHelper = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      logout: vi.fn()
    };

    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true
    });

    // Create ApiClient instance with mocked dependencies
    apiClient = new ApiClient('http://test.api', {
      axios: mockAxios,
      storageHelper: mockStorageHelper
    });

    // Capture the interceptor handlers
    requestHandler = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    responseHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];
    responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];
  });

  describe('Request Interceptor', () => {
    it('should add authorization header when token exists', () => {
      const token = 'test-token';
      mockStorageHelper.getItem.mockReturnValue(token);

      const config = { headers: {} };
      const result = requestHandler(config);

      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add authorization header when token does not exist', () => {
      mockStorageHelper.getItem.mockReturnValue(null);

      const config = { headers: {} };
      const result = requestHandler(config);

      expect(result.headers?.Authorization).toBeUndefined();
    });
  });

  describe('Response Interceptor', () => {
    it('should handle successful responses', () => {
      const response = { data: 'test' };
      const result = responseHandler(response);

      expect(result).toBe(response);
    });

    it('should handle token expiration and refresh successfully', async () => {
      const newToken = 'new-token';
      const originalRequest = {
        headers: {}
      };
      const error = {
        config: originalRequest,
        response: {
          data: {
            error_code: 'TOKEN_EXPIRED'
          }
        }
      };

      mockAxios.post.mockResolvedValueOnce({
        data: {
          data: { token: newToken }
        }
      });
      mockAxios.mockResolvedValueOnce({ data: 'success' });

      await responseErrorHandler(error);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'http://test.api/api/auth/refresh',
        {},
        expect.any(Object)
      );
      expect(mockStorageHelper.setItem).toHaveBeenCalledWith('token', newToken);
      expect(originalRequest.headers.Authorization).toBe(`Bearer ${newToken}`);
      expect(mockAxios).toHaveBeenCalledWith(originalRequest);
    });

    it('should handle token refresh failure', async () => {
      const originalRequest = {
        headers: {}
      };
      const error = {
        config: originalRequest,
        response: {
          data: {
            error_code: 'TOKEN_EXPIRED'
          }
        }
      };

      mockAxios.post.mockRejectedValueOnce(new Error('Refresh failed'));

      await expect(responseErrorHandler(error)).rejects.toThrow();
      expect(mockStorageHelper.logout).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
    });

    it('should reject immediately for non-token-expiration errors', async () => {
      const error = {
        response: {
          data: {
            error_code: 'OTHER_ERROR'
          }
        }
      };

      await expect(responseErrorHandler(error)).rejects.toBe(error);
      expect(mockAxios.post).not.toHaveBeenCalled();
    });
  });
});
