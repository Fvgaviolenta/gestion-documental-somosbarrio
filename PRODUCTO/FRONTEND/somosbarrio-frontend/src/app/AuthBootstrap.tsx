import { useEffect, useState } from 'react'

import { useAuthStore } from '@/store/authStore'

const STORAGE_KEY = 'sb-auth'

/**
 * Espera la rehidratación de Zustand y, si hay refresh sin access, renueva el token proactivamente.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [tokenReady, setTokenReady] = useState(false)

  // Esperar que Zustand cargue los datos guardados en el almacenamiento local
  useEffect(() => {
    let cancelled = false
    Promise.resolve(useAuthStore.persist.rehydrate())
      .catch(() => {
        try {
          // Si el almacenamiento local está corrupto, limpia la sesión por seguridad
          localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* noop */
        }
        useAuthStore.getState().logout()
      })
      .finally(() => {
        if (!cancelled) {
          queueMicrotask(() => setHydrated(true))
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Si hay un token de refresco pero no hay token de acceso (caso típico de F5), renueva sesión
  useEffect(() => {
    if (!hydrated) return
    const { refreshToken, accessToken, refresh } = useAuthStore.getState()
    if (!refreshToken || accessToken) {
      queueMicrotask(() => setTokenReady(true))
      return
    }
    void refresh().finally(() => {
      queueMicrotask(() => setTokenReady(true))
    })
  }, [hydrated])

  // Pantalla de carga integrada al diseño moderno de Somos Barrio durante el F5
  if (!hydrated || !tokenReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-outline-variant border-t-sb-purple" />
          <p className="text-sm font-semibold text-sb-dark-purple animate-pulse">
            Sincronizando portal institucional...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}