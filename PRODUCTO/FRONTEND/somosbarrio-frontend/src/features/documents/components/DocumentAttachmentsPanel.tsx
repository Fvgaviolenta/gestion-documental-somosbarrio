import { useState } from 'react'

import {
  useDeleteDocumentAttachment,
  useDownloadDocumentAttachment,
  useUploadDocumentAttachment,
} from '@/features/documents/hooks/useDocuments'
import { formatFileSize } from '@/features/documents/lib/format-file-size'
import type { DocumentAttachmentDto } from '@/features/documents/types'
import { Button } from '@/shared/components/ui/button'

interface DocumentAttachmentsPanelProps {
  documentId: string
  attachments: DocumentAttachmentDto[]
  canEdit: boolean
  onMessage?: (text: string) => void
  onError?: (text: string) => void
}

export function DocumentAttachmentsPanel({
  documentId,
  attachments,
  canEdit,
  onMessage,
  onError,
}: DocumentAttachmentsPanelProps) {
  const uploadMutation = useUploadDocumentAttachment(documentId)
  const deleteMutation = useDeleteDocumentAttachment(documentId)
  const downloadMutation = useDownloadDocumentAttachment()
  const [busyId, setBusyId] = useState<string | null>(null)

  return (
    <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
      <h3 className="text-base font-semibold">Adjuntos</h3>

      {attachments.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Sin archivos adjuntos.</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li
              key={att.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{att.originalFilename}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {formatFileSize(att.sizeBytes)}
                  {att.contentType ? ` · ${att.contentType}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={downloadMutation.isPending && busyId === att.id}
                  onClick={() => {
                    setBusyId(att.id)
                    downloadMutation.mutate(
                      {
                        documentId,
                        attachmentId: att.id,
                        filename: att.originalFilename,
                      },
                      {
                        onSettled: () => setBusyId(null),
                        onError: () => onError?.('No se pudo descargar el archivo.'),
                      },
                    )
                  }}
                >
                  Descargar
                </Button>
                {canEdit ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      if (!window.confirm(`¿Eliminar "${att.originalFilename}"?`)) return
                      deleteMutation.mutate(att.id, {
                        onSuccess: () => onMessage?.('Adjunto eliminado.'),
                        onError: () => onError?.('No se pudo eliminar el adjunto.'),
                      })
                    }}
                  >
                    Quitar
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canEdit ? (
        <div>
          <label className="mb-1 block text-sm font-medium">Subir archivo</label>
          <input
            type="file"
            className="text-sm"
            disabled={uploadMutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              uploadMutation.mutate(file, {
                onSuccess: () => onMessage?.('Adjunto subido.'),
                onError: () => onError?.('No se pudo subir el archivo.'),
              })
              e.target.value = ''
            }}
          />
        </div>
      ) : null}
    </section>
  )
}
