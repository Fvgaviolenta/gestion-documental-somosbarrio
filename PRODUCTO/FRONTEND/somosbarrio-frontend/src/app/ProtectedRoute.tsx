// import { Navigate, useLocation } from 'react-router-dom'
// import { useAuthStore } from '@/store/authStore'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // const user = useAuthStore((s) => s.user)
  // const accessToken = useAuthStore((s) => s.accessToken)
  // const location = useLocation()

  // if (!accessToken || !user) {
  //   return <Navigate to="/login" replace state={{ from: location.pathname }} />
  // }

  return <>{children}</>
}
