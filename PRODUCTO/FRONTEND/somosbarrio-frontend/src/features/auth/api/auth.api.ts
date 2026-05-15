import { authClient } from './authClient'
import { mapLoginResponse } from './mapLoginResponse'
import type { LoginResponse } from './types'

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
