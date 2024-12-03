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

// Mock fetch
global.fetch = vi.fn();

// Mock JWT token with user data
const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzMzMjQ5MzQzLCJpYXQiOjE3MzMyNDU3NDMsImp0aSI6ImU3NWM1ZWVhYjI3MzRkYTA4MDcxOWU0NDBkNDM0NzQ0IiwiaWQiOiIzNmNhMzgzYS1lOGQ5LTQ3MWEtODNkYy05MGViMjU1OGI5YmMiLCJ1c2VybmFtZSI6ImpvZSIsImVtYWlsIjoibWVAdGhlam9ld2lsa2luc29uLmNvbSIsImZpcnN0X25hbWUiOiJKb2UiLCJsYXN0X25hbWUiOiJXaWxraW5zb24ifQ.Oz9E4mn7L3n6gaB6rGofVzrhaNlyzXfWXIenPPe2jAo';
const mockRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczMzMzMjE0MywiaWF0IjoxNzMzMjQ1NzQzLCJqdGkiOiJkNzczYjM4ZjY0ODA0N2M5YWIwYmZmNmUwZGU2YjdlNSIsImlkIjoiMzZjYTM4M2EtZThkOS00NzFhLTgzZGMtOTBlYjI1NThiOWJjIiwidXNlcm5hbWUiOiJqb2UiLCJlbWFpbCI6Im1lQHRoZWpvZXdpbGtpbnNvbi5jb20iLCJmaXJzdF9uYW1lIjoiSm9lIiwibGFzdF9uYW1lIjoiV2lsa2luc29uIn0.PHSDQyZntH_oxtGIBiRrtnhATpUW_YaEqYf5gP6zcpA';

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
    mockStorage.removeItem.mockReset();
    fetch.mockReset();
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
      id: '36ca383a-e8d9-471a-83dc-90eb2558b9bc',
      username: 'joe',
      email: 'me@thejoewilkinson.com',
      first_name: 'Joe',
      last_name: 'Wilkinson'
    };

    useAuthStore.getState().setUser(testUser);
    expect(useAuthStore.getState().user).toEqual(testUser);
  });

  it('should set token', () => {
    useAuthStore.getState().setToken(mockJWT);
    expect(useAuthStore.getState().token).toBe(mockJWT);
    expect(mockStorage.setItem).toHaveBeenCalledWith('token', mockJWT);
  });

  it('should set refresh token', () => {
    useAuthStore.getState().setRefreshToken(mockRefreshToken);
    expect(useAuthStore.getState().refreshToken).toBe(mockRefreshToken);
    expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', mockRefreshToken);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().loading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('should set error', () => {
    const testError = 'Test error message';
    useAuthStore.getState().setError(testError);
    expect(useAuthStore.getState().error).toBe(testError);
  });

  it('should fetch user data', async () => {
    const mockUserData = {
      id: '36ca383a-e8d9-471a-83dc-90eb2558b9bc',
      username: 'joe',
      email: 'me@thejoewilkinson.com',
      first_name: 'Joe',
      last_name: 'Wilkinson'
    };

    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: mockUserData,
        message: "Request successful",
        error: "",
        error_code: null
      })
    };

    fetch.mockResolvedValueOnce(mockResponse);

    // Set token first
    useAuthStore.getState().setToken(mockJWT);

    await useAuthStore.getState().fetchUserData();

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUserData);
  });

  it('should handle fetch user data failure', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({
        data: null,
        message: "Request failed",
        error: "Unauthorized",
        error_code: "AUTH_002"
      })
    };

    fetch.mockResolvedValueOnce(mockResponse);

    // Set token first
    useAuthStore.getState().setToken(mockJWT);

    try {
      await useAuthStore.getState().fetchUserData();
      // If fetchUserData doesn't throw, fail the test
      expect(true).toBe(false);
    } catch (error) {
      const state = useAuthStore.getState();
      expect(state.error).toBe('Unauthorized');
    }
  });

  it('should handle login success', async () => {
    // Mock login response
    const mockLoginResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: {
          refresh: mockRefreshToken,
          access: mockJWT
        },
        message: "Request successful",
        error: "",
        error_code: null
      })
    };

    // Mock user data response
    const mockUserResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: {
          id: '36ca383a-e8d9-471a-83dc-90eb2558b9bc',
          username: 'joe',
          email: 'me@thejoewilkinson.com',
          first_name: 'Joe',
          last_name: 'Wilkinson'
        },
        message: "Request successful",
        error: "",
        error_code: null
      })
    };

    // Setup fetch to return login response first, then user data response
    fetch
      .mockResolvedValueOnce(mockLoginResponse)
      .mockResolvedValueOnce(mockUserResponse);

    await useAuthStore.getState().login('joe', 'password');

    const state = useAuthStore.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.token).toBe(mockJWT);
    expect(state.refreshToken).toBe(mockRefreshToken);
    expect(state.user).toEqual({
      id: '36ca383a-e8d9-471a-83dc-90eb2558b9bc',
      username: 'joe',
      email: 'me@thejoewilkinson.com',
      first_name: 'Joe',
      last_name: 'Wilkinson'
    });

    // Verify localStorage calls
    expect(mockStorage.setItem).toHaveBeenCalledWith('token', mockJWT);
    expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', mockRefreshToken);
  });

  it('should handle login failure', async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({
        data: null,
        message: "Request failed",
        error: "Invalid credentials",
        error_code: "AUTH_001"
      })
    };

    fetch.mockResolvedValueOnce(mockResponse);

    try {
      await useAuthStore.getState().login('joe', 'wrong-password');
      // If login doesn't throw, fail the test
      expect(true).toBe(false);
    } catch (error) {
      const state = useAuthStore.getState();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.refreshToken).toBeNull();
    }
  });

  it('should handle logout', () => {
    // Set up initial state
    useAuthStore.setState({
      user: {
        id: '36ca383a-e8d9-471a-83dc-90eb2558b9bc',
        username: 'joe',
        email: 'me@thejoewilkinson.com',
        first_name: 'Joe',
        last_name: 'Wilkinson'
      },
      token: mockJWT,
      refreshToken: mockRefreshToken
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.error).toBeNull();

    // Verify localStorage cleanup
    expect(mockStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});
