import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  user: string | null
  token: string | null
  isLoading: boolean
  error: string | null

  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  checkAuth: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          })

          const data = await response.json()

          if (response.ok && data.success) {
            set({
              isAuthenticated: true,
              user: data.user,
              token: data.token,
              isLoading: false,
              error: null,
            })
            return true
          } else {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
              error: data.message || 'Identifiants incorrects',
            })
            return false
          }
        } catch {
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: 'Erreur de connexion au serveur',
          })
          return false
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        })
      },

      clearError: () => {
        set({ error: null })
      },

      checkAuth: () => {
        const state = get()
        return state.isAuthenticated && state.token !== null
      },
    }),
    {
      name: 'ict-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
)
