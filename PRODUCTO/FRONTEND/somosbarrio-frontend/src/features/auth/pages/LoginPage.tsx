import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import type { ApiErrorBody } from '@/shared/types/api'
import { APP_NAME } from '@/shared/lib/constants'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useAuthStore } from '@/store/authStore'

const MOCK_ADMIN_EMAIL = 'admin@demo.cl'
const MOCK_ADMIN_PASSWORD = 'admin123'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((s) => s.accessToken)
  const user = useAuthStore((s) => s.user)
  const login = useAuthStore((s) => s.login)

  const from = (() => {
    const s = location.state as { from?: string } | undefined
    if (s?.from && s.from !== '/login') return s.from
    return '/'
  })()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginFormValues) => {
      if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
        useAuthStore.setState({
          accessToken: 'mock-admin-token',
          refreshToken: 'mock-admin-refresh',
          user: {
            id: 'admin-demo',
            email: MOCK_ADMIN_EMAIL,
            firstName: 'Administrador',
            lastName: 'Demo',
            roles: ['ADMIN'],
          },
        })
        return
      }
      await login(email, password)
    },
    onSuccess: () => navigate(from, { replace: true }),
  })

  if (accessToken && user) {
    return <Navigate to="/" replace />
  }

  const serverMessage = (() => {
    if (!mutation.isError) return null
    if (!axios.isAxiosError(mutation.error)) {
      return mutation.error instanceof Error
        ? mutation.error.message
        : 'Error inesperado al iniciar sesión.'
    }
    const err = mutation.error
    if (!err.response) {
      return 'No hay conexión con el API. ¿Está el backend en marcha en el puerto 8080? (En dev, VITE_API_URL=/api/v1 usa el proxy de Vite.)'
    }
    const data = err.response.data as ApiErrorBody | undefined
    return data?.message ?? err.message
  })()

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">
          {APP_NAME}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Gestión documental — inicia sesión
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Correo
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="mt-1 text-sm text-[var(--color-destructive)]" role="alert">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="mt-1 text-sm text-[var(--color-destructive)]" role="alert">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {serverMessage ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {serverMessage}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-zinc-700"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-muted-foreground)]">
        ¿Eres trabajador en terreno?{' '}
        <Link
          to="/trabajador/login"
          className="font-medium text-[#1565c0] underline decoration-[#1565c0] transition-colors hover:text-black hover:decoration-black"
        >
          Iniciar sesión aquí
        </Link>
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-[var(--color-border)] p-3 text-xs text-[var(--color-muted-foreground)]">
        <p className="font-semibold">Modo mock (sin backend)</p>
        <p>Correo: {MOCK_ADMIN_EMAIL}</p>
        <p>Clave: {MOCK_ADMIN_PASSWORD}</p>
      </div>
    </div>
  )
}
