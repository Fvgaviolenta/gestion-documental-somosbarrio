// import { useEffect, useState } from 'react'

// import { useAuthStore } from '@/store/authStore'

// const STORAGE_KEY = 'sb-auth'

/**
 * Espera rehidratación de Zustand y, si hay refresh sin access, renueva token.
 */
export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  // const [hydrated, setHydrated] = useState(false)
  // const [tokenReady, setTokenReady] = useState(false)

  // useEffect(() => {
  //   let cancelled = false
  //   Promise.resolve(useAuthStore.persist.rehydrate())
  //     .catch(() => {
  //       try {
  //         localStorage.removeItem(STORAGE_KEY)
  //       } catch {
  //         /* noop */
  //       }
  //       useAuthStore.getState().logout()
  //     })
  //     .finally(() => {
  //       if (!cancelled) {
  //         queueMicrotask(() => setHydrated(true))
  //       }
  //     })
  //   return () => {
  //     cancelled = true
  //   }
  // }, [])

  // useEffect(() => {
  //   if (!hydrated) return
  //   const { refreshToken, accessToken, refresh } = useAuthStore.getState()
  //   if (!refreshToken || accessToken) {
  //     queueMicrotask(() => setTokenReady(true))
  //     return
  //   }
  //   void refresh().finally(() => {
  //     queueMicrotask(() => setTokenReady(true))
  //   })
  // }, [hydrated])

  // if (!hydrated || !tokenReady) {
  //   return (
  //     <div className='flex min-h-dvh items-center justify-center bg-[var(--color-background)] text-[var(--color-muted-foreground)]'>
  //       Cargando…
  //     </div>
  //   )
  // }

  return <>{children}</>
}
