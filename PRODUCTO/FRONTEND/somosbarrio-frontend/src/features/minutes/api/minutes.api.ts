import { api } from '@/shared/lib/axios'
import { downloadBlob, filenameFromContentDisposition } from '@/shared/lib/download'
import type { PagedResponse } from '@/shared/types/api'

import type {
  CreateMinutePayload,
  MinuteAttachmentDto,
  MinuteDto,
  MinuteStatus,
  UpdateMinutePayload,
} from '../types'

export async function listMinutes(params?: {
  page?: number
  size?: number
  activityId?: string
  status?: MinuteStatus
}): Promise<PagedResponse<MinuteDto>> {
  const { data } = await api.get<PagedResponse<MinuteDto>>('/minutes', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      activityId: params?.activityId || undefined,
      status: params?.status || undefined,
      sort: 'createdAt,desc',
    },
  })
  return data
}

export async function getMinuteById(id: string): Promise<MinuteDto> {
  const { data } = await api.get<MinuteDto>(`/minutes/${id}`)
  return data
}

export async function createMinute(payload: CreateMinutePayload): Promise<MinuteDto> {
  const { data } = await api.post<MinuteDto>('/minutes', payload)
  return data
}

export async function updateMinute(
  id: string,
  payload: UpdateMinutePayload,
): Promise<MinuteDto> {
  const { data } = await api.put<MinuteDto>(`/minutes/${id}`, payload)
  return data
}

export async function deleteMinute(id: string): Promise<void> {
  await api.delete(`/minutes/${id}`)
}

export async function changeMinuteStatus(
  minuteId: string,
  status: MinuteStatus,
): Promise<MinuteDto> {
  const { data } = await api.patch<MinuteDto>(`/minutes/${minuteId}/status`, { status })
  return data
}

export async function uploadMinuteAttachment(minuteId: string, file: File): Promise<void> {
  const formData = new FormData()
  formData.append('file', file, file.name)
  await api.post(`/minutes/${minuteId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function listMinuteAttachments(
  minuteId: string,
): Promise<MinuteAttachmentDto[]> {
  const { data } = await api.get<MinuteAttachmentDto[]>(
    `/minutes/${minuteId}/attachments`,
  )
  return data
}

export async function downloadMinuteAttachment(
  minuteId: string,
  attachmentId: string,
  fallbackName: string,
): Promise<void> {
  const response = await api.get<Blob>(
    `/minutes/${minuteId}/attachments/${attachmentId}`,
    { responseType: 'blob' },
  )
  const filename = filenameFromContentDisposition(
    response.headers['content-disposition'] as string | undefined,
    fallbackName,
  )
  downloadBlob(response.data, filename)
}

export async function deleteMinuteAttachment(
  minuteId: string,
  attachmentId: string,
): Promise<void> {
  await api.delete(`/minutes/${minuteId}/attachments/${attachmentId}`)
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
