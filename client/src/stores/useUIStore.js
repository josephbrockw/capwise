import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useUIStore = create(
  devtools(
    // eslint-disable-next-line no-unused-vars
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      toasts: [], // Array of { id, message, type }

      // Toggle sidebar
      toggleSidebar: () => set((state) => ({
        sidebarOpen: !state.sidebarOpen
      })),

      // Toast notifications
      addToast: (message, type) => set((state) => ({
        toasts: [...state.toasts, {
          id: Date.now().toString(),
          message,
          type
        }]
      })),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      }))
    })
  )
)
