import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'

import type { CreateMinutePayload, MinuteDto, MinuteStatus } from '../types'

export async function listMinutes(params?: {
  page?: number
  size?: number
  activityId?: string
  status?: MinuteStatus
}): Promise<PagedResponse<MinuteDto>> {
  const { data } = await api.get<PagedResponse<MinuteDto>>('/minutes', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      activityId: params?.activityId,
      status: params?.status,
      sort: 'createdAt,desc',
    },
  })
  return data
}

export async function createMinute(payload: CreateMinutePayload): Promise<MinuteDto> {
  const { data } = await api.post<MinuteDto>('/minutes', payload)
  return data
}

export async function uploadMinuteAttachment(minuteId: string, file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file, file.name)
  await api.post(`/minutes/${minuteId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function changeMinuteStatus(
  minuteId: string,
  status: MinuteStatus,
): Promise<MinuteDto> {
  const { data } = await api.patch<MinuteDto>(`/minutes/${minuteId}/status`, { status })
  return data
}

export async function createMinuteWithAttachments(
  payload: CreateMinutePayload,
  files: File[],
): Promise<MinuteDto> {
  const minute = await createMinute(payload)
  for (const file of files) {
    await uploadMinuteAttachment(minute.id, file)
  }
  await changeMinuteStatus(minute.id, 'EN_REVISION')
  return minute
}
