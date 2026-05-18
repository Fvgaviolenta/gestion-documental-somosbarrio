import { useQuery } from '@tanstack/react-query'

import { getActivities } from '@/features/activities/api/activities.api'

const FALLBACK_ACTIVITY_ID = '10000000-0000-0000-0000-000000000005'

export function useDefaultActivityId() {
  return useQuery({
    queryKey: ['worker', 'default-activity'],
    queryFn: async () => {
      const page = await getActivities({ page: 0, size: 10 })
      const preferred =
        page.content.find((a) => a.status === 'EN_CURSO') ??
        page.content.find((a) => a.status === 'PLANIFICADA') ??
        page.content[0]
      return preferred?.id ?? FALLBACK_ACTIVITY_ID
    },
    staleTime: 5 * 60_000,
  })
}
