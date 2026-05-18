import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

import { MinuteAttachmentsPanel } from '@/features/minutes/components/MinuteAttachmentsPanel'
import { MinuteFieldsDisplay } from '@/features/minutes/components/MinuteFieldsDisplay'
import { MinuteStatusBadge } from '@/features/minutes/components/MinuteStatusBadge'
import {
  useChangeMinuteStatus,
  useDeleteMinute,
  useMinute,
  useUpdateMinute,
} from '@/features/minutes/hooks/useMinutes'
import { parseMinuteContent } from '@/features/minutes/lib/minute-content'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { formatDateOnly } from '@/shared/lib/formatters'
import { useAuthStore } from '@/store/authStore'

const inputClass =
  'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2'

export function MinuteDetailPage() {
  const { id: minuteId = '' } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const hasRole = useAuthStore((s) => s.hasRole)
  const isAdmin = hasRole('ADMINISTRADOR')

  const minuteQuery = useMinute(minuteId)
  const updateMutation = useUpdateMinute(minuteId)
  const deleteMutation = useDeleteMinute()
  const statusMutation = useChangeMinuteStatus(minuteId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const minute = minuteQuery.data
  const isAuthor = Boolean(user?.id && minute?.authorId && user.id === minute.authorId)
  const canEdit = minute?.status === 'BORRADOR' && (isAuthor || isAdmin)
  const canEditAttachments = canEdit

  useEffect(() => {
    if (!minute) return
    setTitle(minute.title)
    setContent(minute.content ?? '')
  }, [minute])

  const parsedFields = parseMinuteContent(minute?.content)

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    updateMutation.mutate(
      { title: title.trim(), content: content.trim() || undefined },
      {
        onSuccess: () => setMessage('Acta actualizada.'),
        onError: (err) => setError(formatError(err)),
      },
    )
  }

  const onDelete = () => {
    if (!window.confirm('¿Eliminar este borrador de acta?')) return
    deleteMutation.mutate(minuteId, {
      onSuccess: () => navigate('/minutes'),
      onError: (err) => setError(formatError(err)),
    })
  }

  if (minuteQuery.isLoading) {
    return <p className="p-margin text-sm text-[var(--color-muted-foreground)]">Cargando…</p>
  }

  if (minuteQuery.isError || !minute) {
    return (
      <div className="p-margin">
        <p className="text-sm text-[var(--color-destructive)]">No se pudo cargar el acta.</p>
        <Link to="/minutes" className="mt-2 inline-block text-sm font-medium hover:underline">
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="p-margin max-w-3xl space-y-6">
      <Link
        to="/minutes"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al listado
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={minute.title} description={minute.activityTitle ?? 'Acta de reunión'} />
        <MinuteStatusBadge status={minute.status} label={minute.statusLabel} />
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Actividad</dt>
          <dd className="font-medium">{minute.activityTitle ?? minute.activityId}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Autor</dt>
          <dd className="font-medium">{minute.authorName ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Creada</dt>
          <dd className="font-medium">{formatDateOnly(minute.createdAt)}</dd>
        </div>
        {minute.updatedAt ? (
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Actualizada</dt>
            <dd className="font-medium">{formatDateOnly(minute.updatedAt)}</dd>
          </div>
        ) : null}
      </dl>

      {canEdit ? (
        <form
          onSubmit={onSave}
          className="space-y-4 rounded-xl border border-[var(--color-border)] p-4 shadow-sm"
        >
          <h3 className="text-base font-semibold">Editar borrador</h3>
          <div>
            <label htmlFor="minute-title" className="mb-1 block text-sm font-medium">
              Título
            </label>
            <input
              id="minute-title"
              className={inputClass}
              value={title}
              required
              minLength={3}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="minute-content" className="mb-1 block text-sm font-medium">
              Contenido (JSON de campos)
            </label>
            <textarea
              id="minute-content"
              className={`${inputClass} min-h-40 font-mono text-xs`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      ) : (
        <section className="rounded-xl border border-[var(--color-border)] p-4 text-sm">
          <h3 className="mb-3 font-semibold">Contenido del acta</h3>
          {parsedFields ? (
            <MinuteFieldsDisplay fields={parsedFields} />
          ) : (
            <pre className="whitespace-pre-wrap text-xs text-[var(--color-muted-foreground)]">
              {minute.content ?? 'Sin contenido.'}
            </pre>
          )}
        </section>
      )}

      <MinuteAttachmentsPanel
        minuteId={minuteId}
        attachments={minute.attachments ?? []}
        canEdit={canEditAttachments}
        onMessage={setMessage}
        onError={setError}
      />

      <div className="flex flex-wrap gap-2">
        {minute.status === 'BORRADOR' && (isAuthor || isAdmin) ? (
          <Button
            type="button"
            onClick={() =>
              statusMutation.mutate('EN_REVISION', {
                onSuccess: () => setMessage('Acta enviada a revisión.'),
                onError: (err) => setError(formatError(err)),
              })
            }
            disabled={statusMutation.isPending}
          >
            Enviar a revisión
          </Button>
        ) : null}

        {isAdmin && minute.status === 'EN_REVISION' ? (
          <Button
            type="button"
            onClick={() =>
              statusMutation.mutate('APROBADA', {
                onSuccess: () => setMessage('Acta aprobada.'),
                onError: (err) => setError(formatError(err)),
              })
            }
            disabled={statusMutation.isPending}
          >
            Aprobar acta
          </Button>
        ) : null}

        {canEdit ? (
          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
          >
            Eliminar borrador
          </Button>
        ) : null}
      </div>

      {message ? (
        <p className="text-sm text-emerald-600" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function formatError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? err.message
  }
  if (err instanceof Error) return err.message
  return 'Ocurrió un error.'
}
