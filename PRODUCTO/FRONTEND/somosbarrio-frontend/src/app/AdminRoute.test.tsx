import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { useAuthStore } from '@/store/authStore'
import { renderWithProviders } from '@/test/test-utils'

import { AdminRoute } from './AdminRoute'

describe('AdminRoute', () => {
  it('allows admin users to access nested routes', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        email: 'admin@somosbarrio.cl',
        firstName: 'Admin',
        lastName: 'User',
        roles: ['ADMINISTRADOR'],
      },
      accessToken: 'token',
      refreshToken: 'refresh',
    })

    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Inicio</div>} />
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="users" element={<div>Usuarios admin</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/admin/users'] } },
    )

    expect(screen.getByText('Usuarios admin')).toBeInTheDocument()
  })

  it('redirects non-admin users to home', () => {
    useAuthStore.setState({
      user: {
        id: '2',
        email: 'colaborador1@somosbarrio.cl',
        firstName: 'Colab',
        lastName: 'Uno',
        roles: ['COLABORADOR'],
      },
      accessToken: 'token',
      refreshToken: 'refresh',
    })

    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Inicio</div>} />
        <Route path="/admin" element={<AdminRoute />}>
          <Route path="users" element={<div>Usuarios admin</div>} />
        </Route>
      </Routes>,
      { routerProps: { initialEntries: ['/admin/users'] } },
    )

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.queryByText('Usuarios admin')).not.toBeInTheDocument()
  })
})
