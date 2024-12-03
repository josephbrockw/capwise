import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../useAuthStore';

// Mock storage
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Set up localStorage mock
global.localStorage = mockStorage;

describe('useAuthStore', () => {
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
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User'
    };

    useAuthStore.setState({ user: testUser });
    expect(useAuthStore.getState().user).toEqual(testUser);
  });

  it('should set token', () => {
    const testToken = 'test-token';
    useAuthStore.setState({ token: testToken });
    expect(useAuthStore.getState().token).toBe(testToken);
  });

  it('should set refresh token', () => {
    const testRefreshToken = 'test-refresh-token';
    useAuthStore.setState({ refreshToken: testRefreshToken });
    expect(useAuthStore.getState().refreshToken).toBe(testRefreshToken);
  });

  it('should set loading state', () => {
    useAuthStore.setState({ loading: true });
    expect(useAuthStore.getState().loading).toBe(true);

    useAuthStore.setState({ loading: false });
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('should set error', () => {
    const testError = 'Test error message';
    useAuthStore.setState({ error: testError });
    expect(useAuthStore.getState().error).toBe(testError);
  });

  it('should handle login success', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    };

    // Create a mock JWT with encoded user data
    const mockJwt = `header.${btoa(JSON.stringify(mockUser))}.signature`;

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        access: mockJwt,
        refresh: 'test-refresh-token'
      })
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    await useAuthStore.getState().login('testuser', 'password');

    const state = useAuthStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockJwt);
    expect(state.refreshToken).toBe('test-refresh-token');
  });

  it('should handle login failure', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' })
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    await useAuthStore.getState().login('testuser', 'wrong-password');

    const state = useAuthStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
  });

  it('should handle logout', () => {
    // Set up initial state
    useAuthStore.setState({
      user: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User'
      },
      token: 'test-token',
      refreshToken: 'test-refresh-token'
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.error).toBeNull();
  });
});
