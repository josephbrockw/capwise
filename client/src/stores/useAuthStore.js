import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useAuthStore = create(
  devtools(
    persist(
      // eslint-disable-next-line no-unused-vars
      (set, get) => ({
        // Initial state
        user: null,        // Stores user data (id, email, username, etc.)
        token: null,       // Stores the JWT or session token
        refreshToken: null, // Stores the refresh token
        loading: false,    // Tracks loading state during async operations
        error: null,       // Stores any error messages

        // Simple state setters
        setUser: (user) => set({ user }),
        setToken: (token) => {
          localStorage.setItem('token', token);
          set({ token });
        },
        setRefreshToken: (refreshToken) => {
          localStorage.setItem('refreshToken', refreshToken);
          set({ refreshToken });
        },
        setError: (error) => set({ error }),
        setLoading: (loading) => set({ loading }),

        // Fetch user data
        fetchUserData: async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
              headers: {
                'Authorization': `Bearer ${get().token}`
              }
            });

            const { data, error } = await response.json();

            if (!response.ok || error) {
              throw new Error(error || 'Failed to fetch user data');
            }

            set({ user: data });
            return data;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to fetch user data'
            });
            throw error;
          }
        },

        // Login action
        login: async (username, password) => {
          set({ loading: true, error: null });

          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            });

            const { data, error } = await response.json();

            if (!response.ok || error) {
              throw new Error(error || 'Login failed');
            }

            // Store tokens in localStorage
            localStorage.setItem('token', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // Set tokens in state
            set({
              token: data.access,
              refreshToken: data.refresh,
              loading: false,
              error: null
            });

            // Fetch user data
            await get().fetchUserData();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              loading: false
            });
            throw error;
          }
        },

        // Logout action
        logout: () => {
          // Clear all tokens from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');

          set({
            user: null,
            token: null,
            refreshToken: null,
            error: null
          });
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
)
