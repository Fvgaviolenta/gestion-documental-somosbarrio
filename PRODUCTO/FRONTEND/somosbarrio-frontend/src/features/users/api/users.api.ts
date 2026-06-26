import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  enabled: boolean
}

export interface CreateUserDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface UpdateUserDTO {
  firstName: string
  lastName: string
  roles: string[]
  isActive: boolean
}

type UserApiRaw = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  /** Jackson serializa boolean isActive como "active" */
  active?: boolean
  isActive?: boolean
  enabled?: boolean
}

function mapUser(raw: UserApiRaw): User {
  const isEnabled = raw.isActive ?? raw.active ?? raw.enabled ?? true
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    roles: raw.roles,
    enabled: isEnabled,
  }
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<PagedResponse<UserApiRaw>>('/users')
    return (response.data?.content ?? []).map(mapUser)
  },

  create: async (data: CreateUserDTO): Promise<User> => {
    const response = await api.post<UserApiRaw>('/users', data)
    return mapUser(response.data)
  },

  update: async (id: string, data: UpdateUserDTO): Promise<User> => {
    const response = await api.put<UserApiRaw>(`/users/${id}`, data)
    return mapUser(response.data)
  },

  deactivate: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
