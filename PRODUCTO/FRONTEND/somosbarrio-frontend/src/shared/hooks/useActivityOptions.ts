import { useQuery } from '@tanstack/react-query'

import { getActivities } from '@/features/activities/api/activities.api'

export function useActivityOptions(enabled = true) {
  return useQuery({
    queryKey: ['activities', 'options'],
    queryFn: () => getActivities({ page: 0, size: 200 }),
    enabled,
    select: (page) =>
      page.content.map((a) => ({
        id: a.id,
        label: `${a.title} (${a.territory})`,
      })),
  })
}
