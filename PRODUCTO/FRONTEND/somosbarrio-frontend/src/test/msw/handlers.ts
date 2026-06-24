import { http, HttpResponse } from 'msw'

const API = '*/api/v1'

export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    if (body.password === 'wrong-password') {
      return HttpResponse.json({ message: 'Credenciales inválidas' }, { status: 401 })
    }

    const isWorker = body.email.includes('colaborador')

    return HttpResponse.json({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresInSec: 900,
      user: {
        id: 'user-1',
        email: body.email,
        firstName: 'Test',
        lastName: 'User',
        roles: isWorker ? ['COLABORADOR'] : ['ADMINISTRADOR'],
      },
    })
  }),

  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({
      accessToken: 'refreshed-access-token',
      refreshToken: 'refreshed-refresh-token',
      expiresInSec: 900,
      user: {
        id: 'user-1',
        email: 'admin@somosbarrio.cl',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['ADMINISTRADOR'],
      },
    }),
  ),
]
