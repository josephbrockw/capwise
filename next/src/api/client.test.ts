import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from './client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/config', () => ({
  default: {
    apiBaseUrl: 'http://localhost:8000/api',
    auth: {
      tokenKey: 'auth_token',
    },
  },
}));

describe('APIClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('X-Team-Context header', () => {
    it('includes X-Team-Context header when team ID is in localStorage and request is authenticated', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('capwise_current_team_id', 'team-123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '1' } }),
      });

      await apiClient.get('/test', true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Team-Context': 'team-123',
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('does not include X-Team-Context header when team ID is not in localStorage', async () => {
      localStorage.setItem('auth_token', 'test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '1' } }),
      });

      await apiClient.get('/test', true);

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders['X-Team-Context']).toBeUndefined();
      expect(callHeaders['Authorization']).toBe('Bearer test-token');
    });

    it('does not include X-Team-Context header for unauthenticated requests', async () => {
      localStorage.setItem('capwise_current_team_id', 'team-123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '1' } }),
      });

      await apiClient.get('/test', false);

      const callHeaders = mockFetch.mock.calls[0][1].headers;
      expect(callHeaders['X-Team-Context']).toBeUndefined();
      expect(callHeaders['Authorization']).toBeUndefined();
    });

    it('includes X-Team-Context header in POST requests', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('capwise_current_team_id', 'team-456');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { success: true } }),
      });

      await apiClient.post('/test', { foo: 'bar' }, true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'X-Team-Context': 'team-456',
          }),
        })
      );
    });

    it('includes X-Team-Context header in PUT requests', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('capwise_current_team_id', 'team-789');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { success: true } }),
      });

      await apiClient.put('/test', { foo: 'bar' }, true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'X-Team-Context': 'team-789',
          }),
        })
      );
    });

    it('includes X-Team-Context header in PATCH requests', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('capwise_current_team_id', 'team-abc');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { success: true } }),
      });

      await apiClient.patch('/test', { foo: 'bar' }, true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'X-Team-Context': 'team-abc',
          }),
        })
      );
    });

    it('includes X-Team-Context header in DELETE requests', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('capwise_current_team_id', 'team-xyz');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { success: true } }),
      });

      await apiClient.delete('/test', true);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'X-Team-Context': 'team-xyz',
          }),
        })
      );
    });

    it('allows custom headers to override X-Team-Context', async () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('capwise_current_team_id', 'team-123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '1' } }),
      });

      await apiClient.get('/test', true, { 'X-Team-Context': 'custom-team' });

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Team-Context': 'custom-team',
          }),
        })
      );
    });
  });
});
