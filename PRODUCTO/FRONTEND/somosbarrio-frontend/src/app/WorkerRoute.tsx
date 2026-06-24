import { Navigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'

export function WorkerRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const hasRole = useAuthStore((s) => s.hasRole)

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!hasRole('COLABORADOR')) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
