import { describe, it, expect, beforeEach, vi, fail } from 'vitest';
import { useAuthStore, resetApi } from '../useAuthStore';

// Mock storage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Set up localStorage mock
global.localStorage = mockStorage;

describe('useAuthStore', () => {
  let mockAxiosInstance;

  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      loading: false,
      error: null
    });

    // Reset mocks
    mockStorage.getItem.mockReset();
    mockStorage.setItem.mockReset();
    mockStorage.removeItem.mockReset();
    vi.clearAllMocks();

    // Create mock axios instance
    mockAxiosInstance = {
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

    // Reset API instance
    resetApi();
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set user', () => {
    const testUser = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    };
    useAuthStore.getState().setUser(testUser);
    expect(useAuthStore.getState().user).toEqual(testUser);
    expect(mockStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(testUser));
  });

  it('should set token', () => {
    const testToken = 'test-token';
    useAuthStore.getState().setToken(testToken);
    expect(useAuthStore.getState().token).toBe(testToken);
    expect(mockStorage.setItem).toHaveBeenCalledWith('token', testToken);
  });

  it('should set refresh token', () => {
    const testRefreshToken = 'test-refresh-token';
    useAuthStore.getState().setRefreshToken(testRefreshToken);
    expect(useAuthStore.getState().refreshToken).toBe(testRefreshToken);
    expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', testRefreshToken);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().loading).toBe(true);
  });

  it('should set error', () => {
    const testError = 'test error';
    useAuthStore.getState().setError(testError);
    expect(useAuthStore.getState().error).toBe(testError);
  });

  it('should fetch user data', async () => {
    const mockUserData = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    };

    mockAxiosInstance.get.mockResolvedValueOnce({
      data: {
        data: mockUserData
      }
    });

    useAuthStore.getState().setToken('test-token');
    await useAuthStore.getState().fetchUserData({ api: mockAxiosInstance });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users/me');
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUserData);
    expect(state.error).toBeNull();
  });

  it('should handle fetch user data failure', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          error: 'Unauthorized'
        }
      }
    });

    useAuthStore.getState().setToken('test-token');

    try {
      await useAuthStore.getState().fetchUserData({ api: mockAxiosInstance });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users/me');
      const state = useAuthStore.getState();
      expect(state.error).toBe('Unauthorized');
      expect(state.user).toBeNull();
    }
  });

  it('should fetch user data from localStorage if available', async () => {
    const mockUserData = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    };

    mockStorage.getItem.mockReturnValueOnce(JSON.stringify(mockUserData));
    useAuthStore.getState().setToken('test-token');

    const result = await useAuthStore.getState().fetchUserData({ api: mockAxiosInstance });

    expect(result).toEqual(mockUserData);
    expect(mockAxiosInstance.get).not.toHaveBeenCalled();
  });

  it('should fetch user data from API if not in localStorage', async () => {
    const mockUserData = {
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    };

    // Mock localStorage without user data
    mockStorage.getItem.mockReturnValue(null);

    mockAxiosInstance.get.mockResolvedValueOnce({
      data: {
        data: mockUserData
      }
    });

    useAuthStore.getState().setToken('test-token');

    const result = await useAuthStore.getState().fetchUserData({ api: mockAxiosInstance });

    expect(result).toEqual(mockUserData);
    expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/users/me');
    expect(mockStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockUserData));
  });

  it('should handle login success', async () => {
    const mockLoginResponse = {
      data: {
        data: {
          access: 'test-token',
          refresh: 'test-refresh',
          id: '123',
          username: 'testuser',
          email: 'test@example.com'
        }
      }
    };

    mockAxiosInstance.post.mockResolvedValueOnce(mockLoginResponse);

    await useAuthStore.getState().login('testuser', 'password', { api: mockAxiosInstance });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', {
      username: 'testuser',
      password: 'password'
    });

    const state = useAuthStore.getState();
    expect(state.token).toBe('test-token');
    expect(state.refreshToken).toBe('test-refresh');
    expect(state.user).toEqual({
      id: '123',
      username: 'testuser',
      email: 'test@example.com'
    });
    expect(state.error).toBeNull();
  });

  it('should handle login failure', async () => {
    mockAxiosInstance.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: {
          error: 'Invalid credentials'
        }
      }
    });

    try {
      await useAuthStore.getState().login('testuser', 'wrong-password', { api: mockAxiosInstance });
      fail('Expected an error to be thrown');
    } catch (error) {
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/auth/login', {
        username: 'testuser',
        password: 'wrong-password'
      });

      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    }
  });

  it('should handle logout', () => {
    // Set initial state
    useAuthStore.setState({
      user: { id: '123' },
      token: 'test-token',
      refreshToken: 'test-refresh',
      loading: false,
      error: null
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.error).toBeNull();
    expect(mockStorage.removeItem).toHaveBeenCalledWith('userData');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  describe('Token Refresh and Session Management', () => {
    beforeEach(() => {
      mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn()
      };
    });

    it('should maintain auth state across page reloads', () => {
      const userData = {
        id: '123',
        username: 'testuser'
      };
      const token = 'valid-token';
      const refreshToken = 'valid-refresh';

      // Simulate stored auth state
      mockStorage.getItem.mockImplementation((key) => {
        switch(key) {
          case 'userData': return JSON.stringify(userData);
          case 'token': return token;
          case 'refreshToken': return refreshToken;
          default: return null;
        }
      });

      // Initialize store (simulates page load)
      useAuthStore.getState().init();

      // Verify state is restored
      expect(useAuthStore.getState().user).toEqual(userData);
      expect(useAuthStore.getState().token).toBe(token);
      expect(useAuthStore.getState().refreshToken).toBe(refreshToken);
    });
  });
});
