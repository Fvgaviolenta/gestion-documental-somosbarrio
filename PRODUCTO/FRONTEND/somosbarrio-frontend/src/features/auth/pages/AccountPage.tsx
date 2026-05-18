import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'

import { changePasswordRequest } from '@/features/auth/api/auth.api'
import { useSyncCurrentUser } from '@/features/auth/hooks/useSyncCurrentUser'
import type { ApiErrorBody } from '@/shared/types/api'
import { useAuthStore } from '@/store/authStore'

const inputClass =
  'w-full rounded-lg border border-outline-variant px-3 py-2 text-sm bg-surface focus:outline-none focus:border-sb-purple'

export function AccountPage() {
  useSyncCurrentUser()
  const user = useAuthStore((s) => s.user)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      changePasswordRequest({
        currentPassword,
        newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFormError(null)
      setSuccess('Contraseña actualizada correctamente.')
    },
    onError: (err) => {
      setSuccess(null)
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorBody | undefined
        setFormError(data?.message ?? 'No se pudo cambiar la contraseña.')
      } else {
        setFormError('No se pudo cambiar la contraseña.')
      }
    },
  })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSuccess(null)
    if (newPassword.length < 8 || newPassword.length > 100) {
      setFormError('La nueva contraseña debe tener entre 8 y 100 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setFormError('La confirmación no coincide con la nueva contraseña.')
      return
    }
    mutation.mutate()
  }

  const displayName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()
      : user?.email ?? 'Usuario'

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-lg mx-auto space-y-6">
        <section>
          <h2 className="text-4xl font-bold text-sb-dark-purple">Mi cuenta</h2>
          <p className="text-base text-on-surface-variant">
            Perfil de sesión y cambio de contraseña.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm">
          <h3 className="text-lg font-bold text-sb-dark-purple mb-stack-sm">Perfil</h3>
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="text-xs font-bold text-on-surface-variant uppercase">Nombre</dt>
              <dd className="font-semibold text-on-surface">{displayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-on-surface-variant uppercase">Correo</dt>
              <dd className="font-mono text-on-surface-variant">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-on-surface-variant uppercase">Roles</dt>
              <dd className="flex flex-wrap gap-1">
                {user?.roles.map((role) => (
                  <span
                    key={role}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container uppercase"
                  >
                    {role}
                  </span>
                )) ?? '—'}
              </dd>
            </div>
          </dl>
        </section>

        <form
          onSubmit={onSubmit}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm space-y-4"
        >
          <h3 className="text-lg font-bold text-sb-dark-purple">Cambiar contraseña</h3>

          {formError ? (
            <p className="text-sm text-on-error-container bg-error-container p-2 rounded-lg" role="alert">
              {formError}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-green-800 bg-green-100 p-2 rounded-lg" role="status">
              {success}
            </p>
          ) : null}

          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">
              Contraseña actual
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">
              Nueva contraseña (8–100 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-on-surface-variant uppercase block mb-1">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={100}
              autoComplete="new-password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50"
          >
            {mutation.isPending ? 'Guardando…' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
