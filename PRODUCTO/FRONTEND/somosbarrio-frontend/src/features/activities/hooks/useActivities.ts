import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  changeActivityStatus,
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  type ActivitiesFilter,
  type UpsertActivityRequest,
} from '@/features/activities/api/activities.api'
import type { ActivityStatus } from '@/shared/types/enums'

export const activityKeys = {
  all: ['activities'] as const,
  list: (filter: ActivitiesFilter) => ['activities', filter] as const,
  detail: (id: string) => ['activities', id] as const,
}

export function useActivities(filter: ActivitiesFilter) {
  return useQuery({
    queryKey: activityKeys.list(filter),
    queryFn: () => getActivities(filter),
  })
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivityById(id),
    enabled: Boolean(id),
  })
}

export function useCreateActivity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertActivityRequest) => createActivity(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

export function useUpdateActivity(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertActivityRequest) => updateActivity(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: activityKeys.all })
      void qc.invalidateQueries({ queryKey: activityKeys.detail(id) })
    },
  })
}

export function useChangeActivityStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ActivityStatus }) =>
      changeActivityStatus(id, status),
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: activityKeys.all })
      void qc.invalidateQueries({ queryKey: activityKeys.detail(vars.id) })
    },
  })
}
