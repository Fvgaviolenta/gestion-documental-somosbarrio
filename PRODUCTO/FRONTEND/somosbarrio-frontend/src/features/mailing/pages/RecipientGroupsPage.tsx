import { useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createRecipientGroup,
  deactivateRecipientGroup,
  listRecipientGroups,
  updateRecipientGroup,
  type RecipientGroupDto,
  type UpsertRecipientGroupPayload,
} from '@/features/mailing/api/recipient-groups.api'
import { SB_COLORS } from '@/shared/constants/colors'
import type { ApiErrorBody } from '@/shared/types/api'
const emptyForm = (): UpsertRecipientGroupPayload => ({
  name: '',
  description: '',
  emails: [''],
})

export function RecipientGroupsPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<RecipientGroupDto | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['recipient-groups'],
    queryFn: listRecipientGroups,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const emails = form.emails.map((e) => e.trim()).filter(Boolean)
      const payload = { ...form, emails }
      return editing
        ? updateRecipientGroup(editing.id, payload)
        : createRecipientGroup(payload)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['recipient-groups'] })
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm())
      setFormError(null)
    },
    onError: (err) => setFormError(formatApiError(err)),
  })

  const deactivateMutation = useMutation({
    mutationFn: deactivateRecipientGroup,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['recipient-groups'] }),
  })

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto">
        <section className="mb-stack-lg flex justify-between items-start gap-4">
          <div>
            <h2 className="text-4xl font-bold text-sb-dark-purple">Grupos de destinatarios</h2>
            <p className="text-on-surface-variant">Listas de correo para envío de documentos aprobados.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditing(null)
              setForm(emptyForm())
              setShowForm(true)
            }}
            style={{ backgroundColor: SB_COLORS.PURPLE }}
            className="px-4 py-2 text-white rounded-lg text-sm font-semibold"
          >
            Nuevo grupo
          </button>
        </section>

        {showForm && (
          <form
            className="mb-stack-lg border border-outline-variant rounded-xl p-stack-md bg-surface-container-lowest space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
          >
            <h3 className="font-bold text-sb-dark-purple">{editing ? 'Editar grupo' : 'Nuevo grupo'}</h3>
            {formError && <p className="text-sm text-error">{formError}</p>}
            <input
              className="w-full p-2 border rounded-lg text-sm"
              placeholder="Nombre"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <textarea
              className="w-full p-2 border rounded-lg text-sm min-h-16"
              placeholder="Descripción"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <p className="text-xs font-bold uppercase text-on-surface-variant">Correos (uno por línea)</p>
            <textarea
              className="w-full p-2 border rounded-lg text-sm font-mono min-h-24"
              value={form.emails.join('\n')}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  emails: e.target.value.split('\n'),
                }))
              }
            />
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-4 py-2 border rounded-lg text-sm" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="px-4 py-2 bg-black text-white rounded-lg text-sm" disabled={saveMutation.isPending}>
                Guardar
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="animate-pulse text-on-surface-variant">Cargando…</p>
        ) : (
          <table className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden text-sm">
            <thead className="bg-surface-container-low text-xs uppercase font-bold">
              <tr>
                <th className="p-4 text-left">Nombre</th>
                <th className="p-4 text-left">Correos</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {groups.map((g) => (
                <tr key={g.id}>
                  <td className="p-4 font-semibold">{g.name}</td>
                  <td className="p-4 text-xs text-on-surface-variant">{g.emails.join(', ')}</td>
                  <td className="p-4 text-center space-x-2">
                    <button
                      type="button"
                      className="text-sb-purple font-semibold"
                      onClick={() => {
                        setEditing(g)
                        setForm({
                          name: g.name,
                          description: g.description ?? '',
                          emails: g.emails,
                        })
                        setShowForm(true)
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-sb-red"
                      onClick={() => {
                        if (window.confirm(`¿Desactivar "${g.name}"?`)) {
                          deactivateMutation.mutate(g.id)
                        }
                      }}
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function formatApiError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response) {
    return (err.response.data as ApiErrorBody | undefined)?.message ?? err.message
  }
  return 'Error al guardar el grupo.'
}
