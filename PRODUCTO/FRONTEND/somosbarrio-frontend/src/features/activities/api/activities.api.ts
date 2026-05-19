import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'
import type { ActivityStatus } from '@/shared/types/enums'

export interface ActivityDto {
  id: string
  title: string
  description?: string
  territory: string
  startDate: string
  status: ActivityStatus
  createdAt?: string
  updatedAt?: string
}

export interface ActivitiesFilter {
  page?: number
  size?: number
  status?: ActivityStatus | ''
  territory?: string
}

export interface UpsertActivityRequest {
  title: string
  description?: string
  territory: string
  startDate: string
}

export async function getActivities(
  filter: ActivitiesFilter,
): Promise<PagedResponse<ActivityDto>> {
  const { data } = await api.get<PagedResponse<ActivityDto>>('/activities', {
    params: {
      page: filter.page ?? 0,
      size: filter.size ?? 20,
      status: filter.status || undefined,
      territory: filter.territory || undefined,
      sort: 'startDate,desc',
    },
  })
  return data
}

export async function getActivityById(id: string): Promise<ActivityDto> {
  const { data } = await api.get<ActivityDto>(`/activities/${id}`)
  return data
}

export async function createActivity(
  payload: UpsertActivityRequest,
): Promise<ActivityDto> {
  const { data } = await api.post<ActivityDto>('/activities', payload)
  return data
}

export async function updateActivity(
  id: string,
  payload: UpsertActivityRequest,
): Promise<ActivityDto> {
  const { data } = await api.put<ActivityDto>(`/activities/${id}`, payload)
  return data
}

export async function changeActivityStatus(
  id: string,
  status: ActivityStatus,
): Promise<ActivityDto> {
  const { data } = await api.patch<ActivityDto>(`/activities/${id}/status`, {
    status,
  })
  return data
}

export async function deleteActivity(id: string): Promise<void> {
  await api.delete(`/activities/${id}`)
}
