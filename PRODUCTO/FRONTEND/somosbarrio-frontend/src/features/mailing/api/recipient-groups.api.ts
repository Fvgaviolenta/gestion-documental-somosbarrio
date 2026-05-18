import { api } from '@/shared/lib/axios'

export interface RecipientGroupDto {
  id: string
  name: string
  description?: string
  emails: string[]
  createdAt?: string
}

export interface UpsertRecipientGroupPayload {
  name: string
  description?: string
  emails: string[]
}

export async function listRecipientGroups(): Promise<RecipientGroupDto[]> {
  const { data } = await api.get<RecipientGroupDto[]>('/recipient-groups')
  return data
}

export async function createRecipientGroup(
  payload: UpsertRecipientGroupPayload,
): Promise<RecipientGroupDto> {
  const { data } = await api.post<RecipientGroupDto>('/recipient-groups', payload)
  return data
}

export async function updateRecipientGroup(
  id: string,
  payload: UpsertRecipientGroupPayload,
): Promise<RecipientGroupDto> {
  const { data } = await api.put<RecipientGroupDto>(`/recipient-groups/${id}`, payload)
  return data
}

export async function deactivateRecipientGroup(id: string): Promise<void> {
  await api.patch(`/recipient-groups/${id}/deactivate`)
}
