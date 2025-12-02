import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createApiClient } from '@/utils/apiConfig'

// Create API client lazily to allow for testing
let api;
const getApi = (deps) => {
  if (!api) {
    api = createApiClient(deps);
  }
  return api;
};

// For testing purposes
export const resetApi = () => {
  api = null;
};

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        refreshToken: null,
        loading: false,
        error: null,
        isAuthenticated: false,

        init: () => {
          // Initialize store from localStorage
          const token = get().getStorageItem('token');
          const refreshToken = get().getStorageItem('refreshToken');
          const userData = get().getStorageItem('userData');

          set({
            token,
            refreshToken,
            user: userData,
            isAuthenticated: !!token
          });
        },

        setStorageItem: (key, value) => {
          const item = typeof value === 'object' ? JSON.stringify(value) : value;
          localStorage.setItem(key, item);
        },

        getStorageItem: (key) => {
          const item = localStorage.getItem(key);
          if (item && (item.startsWith('{') || item.startsWith('['))) {
            return JSON.parse(item);
          }
          return item;
        },

        removeStorageItem: (key) => {
          localStorage.removeItem(key);
        },

        setUser: (user) => {
          set({ user });
          get().setStorageItem('userData', user);
        },

        setToken: (token) => {
          set({ token });
          get().setStorageItem('token', token);
        },

        setRefreshToken: (refreshToken) => {
          set({ refreshToken });
          get().setStorageItem('refreshToken', refreshToken);
        },

        setError: (error) => set({ error }),
        setLoading: (loading) => set({ loading }),

        fetchUserData: async (deps) => {
          try {
            // First try to get from localStorage
            const localUserData = get().getStorageItem('userData');
            if (localUserData && localUserData.id && localUserData.username && localUserData.email) {
              set({ user: localUserData });
              return localUserData;
            }

            // If not in localStorage, fetch from API
            const response = await getApi(deps).get('/api/users/me');
            const userData = response.data.data;

            set({ user: userData });
            get().setStorageItem('userData', userData);
            return userData;
          } catch (error) {
            console.log('Error fetching user data:', error);
            const errorMessage = error.message;
            set({ error: errorMessage });
            throw error;
          }
        },

        updateUser: async (userData, deps) => {
          try {
            const response = await getApi(deps).patch('/api/users/me', userData);
            const updatedData = response.data.data;
            const updatedUser = { ...get().user, ...updatedData };

            set({ user: updatedUser });
            get().setStorageItem('userData', updatedUser);
            return updatedUser;
          } catch (error) {
            const errorMessage = error.message;
            set({ error: errorMessage });
            throw error;
          }
        },

        login: async (username, password, deps) => {
          set({ loading: true, error: null });
          try {
            const response = await getApi(deps).post('/api/auth/login', { username, password });
            const { data } = response.data;
            const { access, refresh, ...userData } = data;

            set({
              user: userData,
              token: access,
              refreshToken: refresh,
              loading: false,
              error: null
            });

            get().setStorageItem('userData', userData);
            get().setStorageItem('token', access);
            get().setStorageItem('refreshToken', refresh);

            return userData;
          } catch (error) {
            console.log('Login error:', error);
            set({ loading: false, error: error.message });
            throw error;
          }
        },

        logout: () => {
          set({
            user: null,
            token: null,
            refreshToken: null,
            error: null,
            loading: false,
            isAuthenticated: false
          });

          get().removeStorageItem('userData');
          get().removeStorageItem('token');
          get().removeStorageItem('refreshToken');
        },

        refreshAccessToken: async (deps) => {
          try {
            const refreshToken = get().getStorageItem('refreshToken');

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await getApi(deps).post('/api/auth/refresh', { refresh: refreshToken });
            const { access: newToken, refresh: newRefreshToken } = response.data.data;

            get().setToken(newToken);
            get().setRefreshToken(newRefreshToken);

            return newToken;
          } catch (error) {
            get().logout();
            throw error;
          }
        }
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken
        })
      }
    )
  )
);
