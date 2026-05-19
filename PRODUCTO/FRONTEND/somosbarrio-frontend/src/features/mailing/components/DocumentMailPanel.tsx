import { useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  getDocumentEmailLogs,
  sendDocumentByEmail,
} from '@/features/mailing/api/document-mail.api'
import { listRecipientGroups } from '@/features/mailing/api/recipient-groups.api'
import { Button } from '@/shared/components/ui/button'
import { formatDateOnly } from '@/shared/lib/formatters'
import type { ApiErrorBody } from '@/shared/types/api'
import { useAuthStore } from '@/store/authStore'

interface DocumentMailPanelProps {
  documentId: string
  documentStatus: string
  onMessage?: (msg: string) => void
  onError?: (msg: string) => void
}

export function DocumentMailPanel({
  documentId,
  documentStatus,
  onMessage,
  onError,
}: DocumentMailPanelProps) {
  const canSend = useAuthStore((s) =>
    s.hasRole('ADMINISTRADOR', 'COLABORADOR'),
  )
  const qc = useQueryClient()
  const [recipientGroupId, setRecipientGroupId] = useState('')
  const [additionalEmails, setAdditionalEmails] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const groupsQuery = useQuery({
    queryKey: ['recipient-groups'],
    queryFn: listRecipientGroups,
    enabled: canSend && documentStatus === 'APROBADA',
  })

  const logsQuery = useQuery({
    queryKey: ['email-logs', documentId],
    queryFn: () => getDocumentEmailLogs(documentId),
  })

  const sendMutation = useMutation({
    mutationFn: () =>
      sendDocumentByEmail(documentId, {
        recipientGroupId: recipientGroupId || undefined,
        additionalEmails: additionalEmails
          .split(/[,;\s]+/)
          .map((e) => e.trim())
          .filter(Boolean),
        subject: subject.trim() || undefined,
        body: body.trim() || undefined,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['email-logs', documentId] })
      onMessage?.('Correo enviado correctamente.')
      setAdditionalEmails('')
    },
    onError: (err) => {
      if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as ApiErrorBody | undefined
        onError?.(data?.message ?? 'No se pudo enviar el correo.')
      } else {
        onError?.('No se pudo enviar el correo.')
      }
    },
  })

  if (!canSend) return null

  return (
    <section className="rounded-xl border border-[var(--color-border)] p-4 space-y-4">
      <h3 className="text-base font-semibold">Correo institucional</h3>

      {documentStatus === 'APROBADA' ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            if (!recipientGroupId && !additionalEmails.trim()) {
              onError?.('Selecciona un grupo o indica correos adicionales.')
              return
            }
            sendMutation.mutate()
          }}
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Grupo de destinatarios</label>
            <select
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              value={recipientGroupId}
              onChange={(e) => setRecipientGroupId(e.target.value)}
            >
              <option value="">— Ninguno —</option>
              {(groupsQuery.data ?? []).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.emails.length} correos)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Correos adicionales</label>
            <input
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              placeholder="correo1@ejemplo.cl, correo2@ejemplo.cl"
              value={additionalEmails}
              onChange={(e) => setAdditionalEmails(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Asunto (opcional)</label>
            <input
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mensaje (opcional)</label>
            <textarea
              className="w-full min-h-20 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={sendMutation.isPending}>
            {sendMutation.isPending ? 'Enviando…' : 'Enviar PDF por correo'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Solo se pueden enviar documentos en estado APROBADA.
        </p>
      )}

      <div>
        <h4 className="text-sm font-medium mb-2">Historial de envíos</h4>
        {logsQuery.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Cargando…</p>
        ) : (logsQuery.data ?? []).length === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Sin envíos registrados.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {(logsQuery.data ?? []).map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-[var(--color-border)] px-3 py-2"
              >
                <p className="font-medium">{log.subject ?? 'Sin asunto'}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {log.toAddresses} · {log.status}
                  {log.sentAt ? ` · ${formatDateOnly(log.sentAt)}` : ''}
                  {log.sentByName ? ` · ${log.sentByName}` : ''}
                </p>
                {log.errorMessage ? (
                  <p className="text-xs text-[var(--color-destructive)]">{log.errorMessage}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
