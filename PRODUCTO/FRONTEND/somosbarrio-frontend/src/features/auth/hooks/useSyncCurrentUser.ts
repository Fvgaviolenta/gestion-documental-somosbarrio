import { useEffect } from 'react'

import { useAuthStore } from '@/store/authStore'

export function useSyncCurrentUser() {
  const syncUser = useAuthStore((s) => s.syncUser)
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken || accessToken.startsWith('mock')) return
    void syncUser()
  }, [accessToken, syncUser])
}
