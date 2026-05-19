import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '@/store/authStore'

export function AdminRoute() {
  const hasRole = useAuthStore((s) => s.hasRole)

  if (!hasRole('ADMINISTRADOR')) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
