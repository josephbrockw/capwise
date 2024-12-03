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
        setToken: (token) => set({ token }),
        setRefreshToken: (refreshToken) => set({ refreshToken }),
        setError: (error) => set({ error }),
        setLoading: (loading) => set({ loading }),

        // Login action
        login: async (username, password) => {
          // Start loading and clear any previous errors
          set({ loading: true, error: null })

          try {
            // Make API call to your login endpoint
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            // If response isn't ok, throw the error message
            if (!response.ok) {
              throw new Error(data.error || 'Login failed')
            }

            // Decode the JWT payload to get user info
            const [, payload] = data.access.split('.')
            const decodedUser = JSON.parse(atob(payload))

            // On success, update the state with user and tokens
            set({
              user: {
                id: decodedUser.id,
                username: decodedUser.username,
                email: decodedUser.email,
                first_name: decodedUser.first_name,
                last_name: decodedUser.last_name
              },
              token: data.access,
              refreshToken: data.refresh,
              loading: false
            })
          } catch (error) {
            // On error, store the error message and clear loading state
            set({
              error: error instanceof Error ? error.message : 'An error occurred',
              loading: false
            })
          }
        },

        // Logout action
        logout: () => {
          // Clear all auth-related state
          set({
            user: null,
            token: null,
            refreshToken: null,
            error: null
          })
          // You can add additional cleanup here if needed
        }
      }),
      {
        name: 'auth-storage', // Name for localStorage key
        partialize: (state) => ({
          // Only persist these fields in localStorage
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken
        })
      }
    )
  )
)
