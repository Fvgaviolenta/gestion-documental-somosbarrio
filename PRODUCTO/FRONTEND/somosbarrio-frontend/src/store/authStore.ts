import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  type UserDto,
} from '@/features/auth/api/auth.api'
import type { Role } from '@/shared/types/enums'

interface AuthState {
  user: UserDto | null
  accessToken: string | null
  refreshToken: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<string | null>
  hasRole: (...roles: Role[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async (email, password) => {
        const data = await loginRequest(email, password)
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        })
      },

      logout: async () => {
        const rt = get().refreshToken
        if (rt && !rt.startsWith('mock')) {
          try {
            await logoutRequest(rt)
          } catch {
            // Cierre de sesión idempotente en servidor
          }
        }
        set({ user: null, accessToken: null, refreshToken: null })
        localStorage.clear()
      },

      refresh: async () => {
        const rt = get().refreshToken
        if (!rt) return null
        try {
          const data = await refreshRequest(rt)
          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          })
          return data.accessToken
        } catch {
          get().logout()
          return null
        }
      },

      hasRole: (...roles) => {
        const u = get().user
        if (!u) return false
        return roles.some((role) => u.roles.includes(role))
      },
    }),
    {
      name: 'sb-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    },
  ),
)
