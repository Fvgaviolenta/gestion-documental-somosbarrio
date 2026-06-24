import { mapLoginResponse } from './mapLoginResponse'

describe('mapLoginResponse', () => {
  it('maps camelCase Spring response', () => {
    const result = mapLoginResponse({
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresInSec: 900,
      user: {
        id: '1',
        email: 'admin@somosbarrio.cl',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['ADMINISTRADOR'],
      },
    })

    expect(result.accessToken).toBe('access')
    expect(result.refreshToken).toBe('refresh')
    expect(result.user.email).toBe('admin@somosbarrio.cl')
  })

  it('maps snake_case fallback fields', () => {
    const result = mapLoginResponse({
      access_token: 'access',
      refresh_token: 'refresh',
      expires_in: 600,
      user: {
        id: '2',
        email: 'colaborador1@somosbarrio.cl',
        first_name: 'Colab',
        last_name: 'Uno',
        roles: ['COLABORADOR'],
      },
    })

    expect(result.accessToken).toBe('access')
    expect(result.user.firstName).toBe('Colab')
    expect(result.user.lastName).toBe('Uno')
  })

  it('throws when tokens are missing', () => {
    expect(() =>
      mapLoginResponse({
        user: { id: '1', email: 'a@b.cl', firstName: 'A', lastName: 'B', roles: [] },
      }),
    ).toThrow(/sin tokens/i)
  })
})
