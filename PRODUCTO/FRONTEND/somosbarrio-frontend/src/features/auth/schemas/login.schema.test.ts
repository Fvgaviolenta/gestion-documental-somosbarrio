import { describe, expect, it } from 'vitest'

import { loginSchema } from './login.schema'

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@somosbarrio.cl',
      password: 'Admin123!',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'Admin123!',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toContain('Correo no válido')
    }
  })

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@somosbarrio.cl',
      password: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toContain('Ingresa tu contraseña')
    }
  })
})
