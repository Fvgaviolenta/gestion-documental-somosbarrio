import { useState } from 'react'

import {
  useDeleteMinuteAttachment,
  useDownloadMinuteAttachment,
  useUploadMinuteAttachment,
} from '@/features/minutes/hooks/useMinutes'
import { formatFileSize } from '@/features/documents/lib/format-file-size'
import type { MinuteAttachmentDto } from '@/features/minutes/types'
import { Button } from '@/shared/components/ui/button'

interface MinuteAttachmentsPanelProps {
  minuteId: string
  attachments: MinuteAttachmentDto[]
  canEdit: boolean
  onMessage?: (text: string) => void
  onError?: (text: string) => void
}

export function MinuteAttachmentsPanel({
  minuteId,
  attachments,
  canEdit,
  onMessage,
  onError,
}: MinuteAttachmentsPanelProps) {
  const uploadMutation = useUploadMinuteAttachment(minuteId)
  const deleteMutation = useDeleteMinuteAttachment(minuteId)
  const downloadMutation = useDownloadMinuteAttachment()
  const [busyId, setBusyId] = useState<string | null>(null)

  return (
    <section className="space-y-3 rounded-xl border border-[var(--color-border)] p-4">
      <h3 className="text-base font-semibold">Adjuntos del acta</h3>

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
                <p className="font-medium">{att.originalName}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {formatFileSize(att.sizeBytes)}
                  {att.mimeType ? ` · ${att.mimeType}` : ''}
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
                        minuteId,
                        attachmentId: att.id,
                        filename: att.originalName,
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
                      if (!window.confirm(`¿Eliminar "${att.originalName}"?`)) return
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
          <label className="mb-1 block text-sm font-medium">Agregar archivo</label>
          <input
            type="file"
            className="text-sm"
            disabled={uploadMutation.isPending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              uploadMutation.mutate(file, {
                onSuccess: () => onMessage?.('Adjunto subido.'),
                onError: () => onError?.('No se pudo subir el archivo.'),
              })
            }}
          />
        </div>
      ) : null}
    </section>
  )
}
