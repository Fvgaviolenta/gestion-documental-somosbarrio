import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { getActivities } from '@/features/activities/api/activities.api'
import { TemplateFieldsForm } from '@/features/documents/components/TemplateFieldsForm'
import { createDocumentWithAttachments } from '@/features/documents/api/documents.api'
import { useDocumentTemplates } from '@/features/documents/hooks/useDocumentTemplates'
import {
  buildFieldValuesJson,
  parseTemplateFields,
} from '@/features/documents/lib/template-fields'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const inputClass =
  'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2'

export function CreateDocumentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const templatesQuery = useDocumentTemplates()

  const [templateId, setTemplateId] = useState('')
  const [activityId, setActivityId] = useState('')
  const [title, setTitle] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: () =>
      createDocumentWithAttachments(
        {
          templateId,
          activityId: activityId || undefined,
          title: title.trim(),
          fieldValues: buildFieldValuesJson(fieldValues),
        },
        pendingFiles,
      ),
    onSuccess: async (doc) => {
      await queryClient.invalidateQueries({ queryKey: ['documents'] })
      navigate(`/documents/${doc.id}`)
    },
  })

  const activitiesQuery = useQuery({
    queryKey: ['activities', 'picker'],
    queryFn: () => getActivities({ page: 0, size: 100 }),
  })

  const selectedTemplate = templatesQuery.data?.find((t) => t.id === templateId)
  const templateFields = useMemo(
    () => parseTemplateFields(selectedTemplate?.fieldsSchema),
    [selectedTemplate?.fieldsSchema],
  )

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!templateId) {
      setError('Selecciona una plantilla.')
      return
    }

    createMutation.mutate(undefined, {
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          const message = (err.response?.data as { message?: string } | undefined)?.message
          setError(message ?? err.message)
          return
        }
        setError('No se pudo crear el documento.')
      },
    })
  }

  return (
    <div className="p-margin max-w-3xl">
      <Link
        to="/documents"
        className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al listado
      </Link>

      <PageHeader
        title="Nueva solicitud"
        description="Crea un documento en estado borrador según la plantilla institucional."
      />

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-sm"
      >
        <div>
          <label htmlFor="doc-template" className="mb-1 block text-sm font-medium">
            Plantilla *
          </label>
          <select
            id="doc-template"
            className={inputClass}
            value={templateId}
            required
            onChange={(e) => {
              setTemplateId(e.target.value)
              setFieldValues({})
            }}
          >
            <option value="">Selecciona plantilla…</option>
            {(templatesQuery.data ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.documentType})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="doc-title" className="mb-1 block text-sm font-medium">
            Título del trámite *
          </label>
          <input
            id="doc-title"
            className={inputClass}
            value={title}
            required
            minLength={3}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Acta reunión vecinal — Mayo 2026"
          />
        </div>

        <div>
          <label htmlFor="doc-activity" className="mb-1 block text-sm font-medium">
            Actividad (opcional)
          </label>
          <select
            id="doc-activity"
            className={inputClass}
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
          >
            <option value="">Sin actividad asociada</option>
            {(activitiesQuery.data?.content ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} — {a.territory}
              </option>
            ))}
          </select>
        </div>

        {templateId ? (
          <fieldset className="space-y-3 border-t border-[var(--color-border)] pt-4">
            <legend className="text-sm font-semibold">Campos de la plantilla</legend>
            <TemplateFieldsForm
              fields={templateFields}
              values={fieldValues}
              onChange={(key, value) =>
                setFieldValues((prev) => ({ ...prev, [key]: value }))
              }
            />
          </fieldset>
        ) : null}

        <div className="border-t border-[var(--color-border)] pt-4">
          <label className="mb-1 block text-sm font-medium">Adjuntos (opcional)</label>
          <input
            type="file"
            multiple
            className="text-sm"
            onChange={(e) => {
              const files = e.target.files
              if (!files?.length) return
              setPendingFiles((prev) => [...prev, ...Array.from(files)])
              e.target.value = ''
            }}
          />
          {pendingFiles.length > 0 ? (
            <ul className="mt-2 space-y-1 text-sm">
              {pendingFiles.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2">
                  <span className="truncate">{file.name}</span>
                  <button
                    type="button"
                    className="text-xs text-[var(--color-destructive)] hover:underline"
                    onClick={() =>
                      setPendingFiles((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando…' : 'Crear borrador'}
          </Button>
          <Link to="/documents">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
