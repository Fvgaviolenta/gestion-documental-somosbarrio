import type { LoginResponse, UserDto } from './types'

function pickStr(obj: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function mapUser(raw: unknown): UserDto {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Respuesta inválida: falta el objeto usuario.')
  }
  const o = raw as Record<string, unknown>
  return {
    id: String(o.id ?? ''),
    email: String(o.email ?? ''),
    firstName: String(o.firstName ?? o.first_name ?? ''),
    lastName: String(o.lastName ?? o.last_name ?? ''),
    roles: Array.isArray(o.roles) ? o.roles.map(String) : [],
  }
}

/** Normaliza camelCase (Spring por defecto) o snake_case si viniera así. */
export function mapLoginResponse(data: unknown): LoginResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Respuesta inválida del servidor.')
  }
  const o = data as Record<string, unknown>
  const accessToken = pickStr(o, 'accessToken', 'access_token')
  const refreshToken = pickStr(o, 'refreshToken', 'refresh_token')
  if (!accessToken || !refreshToken) {
    throw new Error(
      'El servidor respondió sin tokens. Revisa que el endpoint sea POST /api/v1/auth/login.',
    )
  }
  const expiresInSec = Number(
    o.expiresInSec ?? o.expires_in_sec ?? o.expires_in ?? 900,
  )
  return {
    accessToken,
    refreshToken,
    expiresInSec: Number.isFinite(expiresInSec) ? expiresInSec : 900,
    user: mapUser(o.user),
  }
}
