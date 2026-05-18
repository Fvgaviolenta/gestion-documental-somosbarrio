import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/shared/components/ui/button'
import type { ApiErrorBody } from '@/shared/types/api'
import { APP_NAME } from '@/shared/lib/constants'
import { loginSchema, type LoginFormValues } from '@/features/auth/schemas/login.schema'
import { useAuthStore } from '@/store/authStore'

export function WorkerLoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const logout = useAuthStore((s) => s.logout)
  const hasRole = useAuthStore((s) => s.hasRole)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: async ({ email, password }: LoginFormValues) => {
      await login(email, password)
      if (!hasRole('COLABORADOR')) {
        logout()
        throw new Error('Tu cuenta no tiene perfil de trabajador.')
      }
    },
    onSuccess: () => navigate('/trabajador', { replace: true }),
  })

  const serverMessage = (() => {
    if (!mutation.isError) return null
    if (!axios.isAxiosError(mutation.error)) {
      return mutation.error instanceof Error
        ? mutation.error.message
        : 'Error inesperado al iniciar sesión.'
    }
    const err = mutation.error
    if (!err.response) {
      return 'No hay conexión con el API. ¿Está el backend activo?'
    }
    if (err.response.status === 502) {
      return 'Error 502: el backend no responde. Asegúrate de tener corriendo Docker en tu terminal.'
    }
    const data = err.response.data as ApiErrorBody | undefined
    return data?.message ?? err.message
  })()

  return (
    <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background)] p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-[var(--color-foreground)]">{APP_NAME}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Acceso trabajador
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div>
          <label htmlFor="worker-email" className="mb-1 block text-sm font-medium">
            Correo
          </label>
          <input
            id="worker-email"
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
          <label htmlFor="worker-password" className="mb-1 block text-sm font-medium">
            Contraseña
          </label>
          <div className="relative flex items-center">
            <input
              id="worker-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2 pr-16"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-xs font-medium text-zinc-500 hover:text-black cursor-pointer select-none"
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
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
          {mutation.isPending ? 'Entrando…' : 'Entrar como trabajador'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-muted-foreground)]">
        ¿Acceso administrativo?{' '}
        <Link
          to="/login"
          className="font-medium text-[#1565c0] underline decoration-[#1565c0] transition-colors hover:text-black hover:decoration-black"
        >
          Iniciar sesión aquí
        </Link>
      </p>
    </div>
  )
}