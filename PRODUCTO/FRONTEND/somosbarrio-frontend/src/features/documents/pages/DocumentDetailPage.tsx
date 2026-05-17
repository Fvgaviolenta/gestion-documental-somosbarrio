import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

import { DocumentAttachmentsPanel } from '@/features/documents/components/DocumentAttachmentsPanel'
import { DocumentFieldsDisplay } from '@/features/documents/components/DocumentFieldsDisplay'
import { DocumentStatusBadge } from '@/features/documents/components/DocumentStatusBadge'
import { TemplateFieldsForm } from '@/features/documents/components/TemplateFieldsForm'
import {
  useApproveDocument,
  useDeleteDocument,
  useDocument,
  useDownloadDocumentPdf,
  useDownloadDocumentPreviewDocx,
  useRejectDocument,
  useReopenDocument,
  useSubmitDocumentReview,
  useUpdateDocument,
} from '@/features/documents/hooks/useDocuments'
import { useDocumentTemplates } from '@/features/documents/hooks/useDocumentTemplates'
import {
  buildFieldValuesJson,
  parseFieldValuesJson,
  parseTemplateFields,
} from '@/features/documents/lib/template-fields'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { formatDateOnly } from '@/shared/lib/formatters'
import { useAuthStore } from '@/store/authStore'

const inputClass =
  'w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm outline-none ring-[var(--color-primary)] focus:ring-2'

export function DocumentDetailPage() {
  const { id: documentId = '' } = useParams()
  const navigate = useNavigate()
  const hasRole = useAuthStore((s) => s.hasRole)

  const docQuery = useDocument(documentId)
  const templatesQuery = useDocumentTemplates()
  const updateMutation = useUpdateDocument(documentId)
  const deleteMutation = useDeleteDocument()
  const submitMutation = useSubmitDocumentReview(documentId)
  const approveMutation = useApproveDocument(documentId)
  const rejectMutation = useRejectDocument(documentId)
  const reopenMutation = useReopenDocument(documentId)
  const pdfMutation = useDownloadDocumentPdf()
  const previewMutation = useDownloadDocumentPreviewDocx()

  const [title, setTitle] = useState('')
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [rejectionReason, setRejectionReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const doc = docQuery.data
  const canEdit = doc?.status === 'BORRADOR' || doc?.status === 'RECHAZADA'
  const canEditAttachments = canEdit
  const canPreviewDocx =
    doc?.status === 'BORRADOR' || doc?.status === 'RECHAZADA' || doc?.status === 'EN_REVISION'
  const isAdmin = hasRole('ADMINISTRADOR')

  const templateFields = useMemo(() => {
    const template = templatesQuery.data?.find((t) => t.id === doc?.templateId)
    return parseTemplateFields(template?.fieldsSchema)
  }, [templatesQuery.data, doc?.templateId])

  useEffect(() => {
    if (!doc) return
    setTitle(doc.title)
    setFieldValues(parseFieldValuesJson(doc.fieldValues))
  }, [doc])

  const onSave = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    updateMutation.mutate(
      { title: title.trim(), fieldValues: buildFieldValuesJson(fieldValues) },
      {
        onSuccess: () => setMessage('Documento actualizado.'),
        onError: (err) => setError(formatError(err)),
      },
    )
  }

  const onDelete = () => {
    if (!window.confirm('¿Eliminar este borrador?')) return
    deleteMutation.mutate(documentId, {
      onSuccess: () => navigate('/documents'),
      onError: (err) => setError(formatError(err)),
    })
  }

  if (docQuery.isLoading) {
    return <p className="p-margin text-sm text-[var(--color-muted-foreground)]">Cargando…</p>
  }

  if (docQuery.isError || !doc) {
    return (
      <div className="p-margin">
        <p className="text-sm text-[var(--color-destructive)]">No se pudo cargar el documento.</p>
        <Link to="/documents" className="mt-2 inline-block text-sm font-medium hover:underline">
          Volver al listado
        </Link>
      </div>
    )
  }

  return (
    <div className="p-margin max-w-3xl space-y-6">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al listado
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={doc.title} description={doc.templateName ?? doc.documentType} />
        <DocumentStatusBadge status={doc.status} label={doc.statusLabel} />
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Código</dt>
          <dd className="font-medium">{doc.code ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Actividad</dt>
          <dd className="font-medium">{doc.activityTitle ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Creado</dt>
          <dd className="font-medium">{formatDateOnly(doc.createdAt)}</dd>
        </div>
        {doc.createdByName ? (
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Autor</dt>
            <dd className="font-medium">{doc.createdByName}</dd>
          </div>
        ) : null}
        {doc.rejectionReason ? (
          <div className="sm:col-span-2">
            <dt className="text-[var(--color-muted-foreground)]">Motivo de rechazo</dt>
            <dd className="font-medium text-[var(--color-destructive)]">{doc.rejectionReason}</dd>
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
            <label htmlFor="edit-title" className="mb-1 block text-sm font-medium">
              Título
            </label>
            <input
              id="edit-title"
              className={inputClass}
              value={title}
              required
              minLength={3}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <TemplateFieldsForm
            fields={templateFields}
            values={fieldValues}
            onChange={(key, value) => setFieldValues((prev) => ({ ...prev, [key]: value }))}
          />
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </form>
      ) : (
        <section className="rounded-xl border border-[var(--color-border)] p-4 text-sm">
          <h3 className="mb-3 font-semibold">Campos registrados</h3>
          <DocumentFieldsDisplay fieldValues={doc.fieldValues} fields={templateFields} />
        </section>
      )}

      <DocumentAttachmentsPanel
        documentId={documentId}
        attachments={doc.attachments ?? []}
        canEdit={canEditAttachments}
        onMessage={setMessage}
        onError={setError}
      />

      <div className="flex flex-wrap gap-2">
        {canPreviewDocx ? (
          <Button
            type="button"
            variant="outline"
            disabled={previewMutation.isPending}
            onClick={() =>
              previewMutation.mutate(documentId, {
                onError: (err) => setError(formatError(err)),
              })
            }
          >
            {previewMutation.isPending ? 'Generando…' : 'Vista previa Word'}
          </Button>
        ) : null}

        {doc.status === 'APROBADA' ? (
          <Button
            type="button"
            variant="outline"
            disabled={pdfMutation.isPending}
            onClick={() =>
              pdfMutation.mutate(documentId, {
                onSuccess: () => setMessage('PDF descargado.'),
                onError: (err) => setError(formatError(err)),
              })
            }
          >
            {pdfMutation.isPending ? 'Descargando…' : 'Descargar PDF'}
          </Button>
        ) : null}

        {doc.status === 'RECHAZADA' ? (
          <Button
            type="button"
            variant="outline"
            disabled={reopenMutation.isPending}
            onClick={() =>
              reopenMutation.mutate(undefined, {
                onSuccess: () => setMessage('Documento reabierto como borrador.'),
                onError: (err) => setError(formatError(err)),
              })
            }
          >
            Reabrir como borrador
          </Button>
        ) : null}

        {doc.status === 'BORRADOR' ? (
          <Button
            type="button"
            onClick={() =>
              submitMutation.mutate(undefined, {
                onSuccess: () => setMessage('Enviado a revisión.'),
                onError: (err) => setError(formatError(err)),
              })
            }
            disabled={submitMutation.isPending}
          >
            Enviar a revisión
          </Button>
        ) : null}

        {isAdmin && doc.status === 'EN_REVISION' ? (
          <>
            <Button
              type="button"
              onClick={() =>
                approveMutation.mutate(undefined, {
                  onSuccess: () => setMessage('Documento aprobado.'),
                  onError: (err) => setError(formatError(err)),
                })
              }
              disabled={approveMutation.isPending}
            >
              Aprobar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const reason = rejectionReason.trim()
                if (reason.length < 3) {
                  setError('Indica un motivo de rechazo (mín. 3 caracteres).')
                  return
                }
                rejectMutation.mutate(
                  { rejectionReason: reason },
                  {
                    onSuccess: () => setMessage('Documento rechazado.'),
                    onError: (err) => setError(formatError(err)),
                  },
                )
              }}
              disabled={rejectMutation.isPending}
            >
              Rechazar
            </Button>
          </>
        ) : null}

        {doc.status === 'BORRADOR' ? (
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

      {isAdmin && doc.status === 'EN_REVISION' ? (
        <div>
          <label htmlFor="reject-reason" className="mb-1 block text-sm font-medium">
            Motivo de rechazo
          </label>
          <textarea
            id="reject-reason"
            className={`${inputClass} min-h-20`}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      ) : null}

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
