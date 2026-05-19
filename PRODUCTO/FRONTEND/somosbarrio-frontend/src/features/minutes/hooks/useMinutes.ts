import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  changeMinuteStatus,
  deleteMinute,
  deleteMinuteAttachment,
  downloadMinuteAttachment,
  getMinuteById,
  listMinutes,
  updateMinute,
  uploadMinuteAttachment,
} from '@/features/minutes/api/minutes.api'
import type { MinuteStatus, UpdateMinutePayload } from '@/features/minutes/types'

export const minuteKeys = {
  all: ['minutes'] as const,
  list: (filter: {
    page?: number
    size?: number
    activityId?: string
    status?: MinuteStatus
  }) => ['minutes', 'list', filter] as const,
  detail: (id: string) => ['minutes', id] as const,
}

export function useMinutesList(
  filter: {
    page?: number
    size?: number
    activityId?: string
    status?: MinuteStatus
  } = {},
) {
  return useQuery({
    queryKey: minuteKeys.list(filter),
    queryFn: () =>
      listMinutes({
        page: filter.page ?? 0,
        size: filter.size ?? 20,
        activityId: filter.activityId,
        status: filter.status,
      }),
  })
}

export function useMinute(id: string) {
  return useQuery({
    queryKey: minuteKeys.detail(id),
    queryFn: () => getMinuteById(id),
    enabled: Boolean(id),
  })
}

export function useUpdateMinute(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateMinutePayload) => updateMinute(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: minuteKeys.all })
    },
  })
}

export function useDeleteMinute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteMinute,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: minuteKeys.all })
    },
  })
}

export function useChangeMinuteStatus(minuteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: MinuteStatus) => changeMinuteStatus(minuteId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: minuteKeys.all })
    },
  })
}

export function useUploadMinuteAttachment(minuteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadMinuteAttachment(minuteId, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: minuteKeys.detail(minuteId) })
    },
  })
}

export function useDownloadMinuteAttachment() {
  return useMutation({
    mutationFn: ({
      minuteId,
      attachmentId,
      filename,
    }: {
      minuteId: string
      attachmentId: string
      filename: string
    }) => downloadMinuteAttachment(minuteId, attachmentId, filename),
  })
}

export function useDeleteMinuteAttachment(minuteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: string) => deleteMinuteAttachment(minuteId, attachmentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: minuteKeys.detail(minuteId) })
    },
  })
}
