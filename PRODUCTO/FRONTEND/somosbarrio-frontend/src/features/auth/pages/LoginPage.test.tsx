import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { LoginPage } from './LoginPage'
import { useAuthStore } from '@/store/authStore'
import { renderWithProviders } from '@/test/test-utils'

describe('LoginPage', () => {
  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { routerProps: { initialEntries: ['/login'] } },
    )

    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Correo no válido')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
  })

  it('logs in admin and navigates to home', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Panel principal</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/login'] } },
    )

    await user.type(screen.getByLabelText('Correo'), 'admin@somosbarrio.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'Admin123!')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Panel principal')).toBeInTheDocument()
    expect(useAuthStore.getState().accessToken).toBe('test-access-token')
    expect(useAuthStore.getState().hasRole('ADMINISTRADOR')).toBe(true)
  })

  it('logs in colaborador and navigates to institutional dashboard', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div>Panel Territorial</div>} />
      </Routes>,
      { routerProps: { initialEntries: ['/login'] } },
    )

    await user.type(screen.getByLabelText('Correo'), 'colaborador1@somosbarrio.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'Admin123!')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Panel Territorial')).toBeInTheDocument()
    expect(useAuthStore.getState().hasRole('COLABORADOR')).toBe(true)
  })

  it('shows server error on invalid credentials', async () => {
    const user = userEvent.setup()

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>,
      { routerProps: { initialEntries: ['/login'] } },
    )

    await user.type(screen.getByLabelText('Correo'), 'admin@somosbarrio.cl')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument()
  })
})
