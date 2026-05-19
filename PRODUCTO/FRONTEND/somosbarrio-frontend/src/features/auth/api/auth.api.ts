import { api } from '@/shared/lib/axios'

import { authClient } from './authClient'
import { mapLoginResponse } from './mapLoginResponse'
import type { LoginResponse, UserDto } from './types'

export type { LoginResponse, UserDto } from './types'

export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const { data } = await authClient.post<unknown>('/auth/login', {
    email,
    password,
  })
  return mapLoginResponse(data)
}

export async function refreshRequest(refreshToken: string): Promise<LoginResponse> {
  const { data } = await authClient.post<unknown>('/auth/refresh', {
    refreshToken,
  })
  return mapLoginResponse(data)
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await authClient.post('/auth/logout', { refreshToken })
}

export async function getMeRequest(): Promise<UserDto> {
  const { data } = await api.get<UserDto>('/auth/me')
  return data
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePasswordRequest(
  payload: ChangePasswordPayload,
): Promise<void> {
  await api.post('/auth/change-password', payload)
}
