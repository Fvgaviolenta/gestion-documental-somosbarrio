import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'

export function WorkerRoute({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const hasRole = useAuthStore((s) => s.hasRole)

  if (!accessToken) {
    return <Navigate to="/trabajador/login" replace />
  }

  if (!hasRole('COLABORADOR')) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
