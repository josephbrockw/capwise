import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageHelper } from '../../src/utils/storageHelper';

describe('StorageHelper', () => {
  let storageHelper;
  let mockLocalStorage;
  let mockApi;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    };

    // Create mock api
    mockApi = {
      get: vi.fn()
    };

    // Create StorageHelper instance with mocked dependencies
    storageHelper = new StorageHelper({
      localStorage: mockLocalStorage,
      api: mockApi
    });
  });

  describe('setItem', () => {
    it('should store string values directly', () => {
      const key = 'testKey';
      const value = 'testValue';

      storageHelper.setItem(key, value);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, value);
    });

    it('should stringify object values before storing', () => {
      const key = 'testKey';
      const value = { test: 'value' };

      storageHelper.setItem(key, value);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });

    it('should stringify array values before storing', () => {
      const key = 'testKey';
      const value = ['test', 'value'];

      storageHelper.setItem(key, value);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(value));
    });
  });

  describe('getItem', () => {
    it('should return string values directly', () => {
      const key = 'testKey';
      const value = 'testValue';
      mockLocalStorage.getItem.mockReturnValue(value);

      const result = storageHelper.getItem(key);

      expect(result).toBe(value);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should parse JSON object strings', () => {
      const key = 'testKey';
      const value = { test: 'value' };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(value));

      const result = storageHelper.getItem(key);

      expect(result).toEqual(value);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should parse JSON array strings', () => {
      const key = 'testKey';
      const value = ['test', 'value'];
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(value));

      const result = storageHelper.getItem(key);

      expect(result).toEqual(value);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });

    it('should return null for non-existent keys', () => {
      const key = 'nonExistentKey';
      mockLocalStorage.getItem.mockReturnValue(null);

      const result = storageHelper.getItem(key);

      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(key);
    });
  });

  describe('getUserData', () => {
    it('should return existing userData if available', async () => {
      const userData = { id: 1, name: 'Test User' };
      vi.spyOn(storageHelper, 'getItem')
        .mockImplementation(key => key === 'userData' ? userData : 'token');

      const result = await storageHelper.getUserData();

      expect(result).toBe(userData);
      expect(mockApi.get).not.toHaveBeenCalled();
    });

    it('should fetch and store user data if token exists but no userData', async () => {
      const token = 'testToken';
      const userData = { id: 1, name: 'Test User' };
      vi.spyOn(storageHelper, 'getItem')
        .mockImplementation(key => key === 'token' ? token : null);
      vi.spyOn(storageHelper, 'setItem');

      mockApi.get.mockResolvedValueOnce({
        data: { data: userData }
      });

      const result = await storageHelper.getUserData();

      expect(result).toEqual(userData);
      expect(mockApi.get).toHaveBeenCalledWith('/api/users/me');
      expect(storageHelper.setItem).toHaveBeenCalledWith('userData', userData);
    });

    it('should return null if API call fails', async () => {
      const token = 'testToken';
      vi.spyOn(storageHelper, 'getItem')
        .mockImplementation(key => key === 'token' ? token : null);
      vi.spyOn(storageHelper, 'setItem');

      mockApi.get.mockRejectedValueOnce(new Error('API Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await storageHelper.getUserData();

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(storageHelper.setItem).not.toHaveBeenCalled();
    });

    it('should return null if no token exists', async () => {
      vi.spyOn(storageHelper, 'getItem').mockReturnValue(null);

      const result = await storageHelper.getUserData();

      expect(result).toBeNull();
      expect(mockApi.get).not.toHaveBeenCalled();
    });
  });

  describe('removeData', () => {
    it('should remove item from localStorage', () => {
      const key = 'testKey';

      storageHelper.removeData(key);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });

  describe('logout', () => {
    it('should remove token and userData', () => {
      vi.spyOn(storageHelper, 'removeData');

      storageHelper.logout();

      expect(storageHelper.removeData).toHaveBeenCalledWith('token');
      expect(storageHelper.removeData).toHaveBeenCalledWith('userData');
    });
  });
});
