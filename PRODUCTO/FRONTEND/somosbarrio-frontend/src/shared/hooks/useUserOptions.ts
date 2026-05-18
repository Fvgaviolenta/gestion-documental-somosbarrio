import { useQuery } from '@tanstack/react-query'

import { usersApi } from '@/features/users/api/users.api'
import { useAuthStore } from '@/store/authStore'

export function useUserOptions(enabled = true) {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMINISTRADOR'))

  return useQuery({
    queryKey: ['users', 'options'],
    queryFn: () => usersApi.getAll(),
    enabled: enabled && isAdmin,
    select: (users) =>
      users.map((u) => ({
        id: u.id,
        label:
          u.firstName || u.lastName
            ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
            : u.email,
        email: u.email,
      })),
  })
}
