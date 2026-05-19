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

function mapUser(raw: {
  id: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  isActive?: boolean
  enabled?: boolean
}): User {
  return {
    id: raw.id,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    roles: raw.roles,
    enabled: raw.isActive ?? raw.enabled ?? true,
  }
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get<PagedResponse<User>>('/users')
    return (response.data?.content ?? []).map(mapUser)
  },

  create: async (data: CreateUserDTO): Promise<User> => {
    const response = await api.post<User>('/users', data)
    return mapUser(response.data)
  },

  update: async (id: string, data: UpdateUserDTO): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data)
    return mapUser(response.data)
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
