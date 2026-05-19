import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  getMeRequest,
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
  syncUser: () => Promise<void>
  setUser: (user: UserDto | null) => void
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
        
        const sanitizedRoles = data.user?.roles.map(role => 
          role.startsWith('ROLE_') ? role.replace('ROLE_', '') : role
        ) as Role[]

        set({
          user: data.user ? { ...data.user, roles: sanitizedRoles } : null,
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

      setUser: (user) => set({ user }),

      syncUser: async () => {
        const token = get().accessToken
        if (!token || token.startsWith('mock')) return
        try {
          const me = await getMeRequest()
          const sanitizedRoles = me.roles.map((role: string) =>
            role.startsWith('ROLE_') ? role.replace('ROLE_', '') : role,
          ) as Role[]
          set({ user: { ...me, roles: sanitizedRoles } })
        } catch {
          // Perfil no crítico para navegación
        }
      },

      refresh: async () => {
        const rt = get().refreshToken
        if (!rt) return null
        try {
          const data = await refreshRequest(rt)
          
          const sanitizedRoles = data.user?.roles.map(role => 
            role.startsWith('ROLE_') ? role.replace('ROLE_', '') : role
          ) as Role[]

          set({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user ? { ...data.user, roles: sanitizedRoles } : null,
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