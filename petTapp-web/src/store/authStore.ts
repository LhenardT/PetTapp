import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AuthState, User } from "@/types/auth"
import * as authApi from "@/lib/api/auth"

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch (error) {
          console.error("Logout API call failed:", error)
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: "auth-storage",
    }
  )
)
