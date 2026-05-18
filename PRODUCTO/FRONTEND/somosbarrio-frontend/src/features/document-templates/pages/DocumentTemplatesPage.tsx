import { useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createDocumentTemplate,
  deleteDocumentTemplate,
  getDocumentTemplateById,
  listDocumentTemplates,
  updateDocumentTemplate,
  type UpsertDocumentTemplatePayload,
} from '@/features/documents/api/document-templates.api'
import type { DocumentTemplateDto, DocumentType } from '@/features/documents/types'
import { SB_COLORS } from '@/shared/constants/colors'
import type { ApiErrorBody } from '@/shared/types/api'
const DOCUMENT_TYPES: DocumentType[] = ['ACTA', 'INFORME', 'OFICIO', 'MEMO', 'OTRO']

const emptyForm = (): UpsertDocumentTemplatePayload => ({
  code: '',
  name: '',
  documentType: 'INFORME',
  description: '',
  fieldsSchema: '[]',
  templateFilePath: '',
})

export function DocumentTemplatesPage() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<DocumentTemplateDto | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey: ['document-templates', 'admin'],
    queryFn: () => listDocumentTemplates(),
  })

  const saveMutation = useMutation({
    mutationFn: () =>
      editing
        ? updateDocumentTemplate(editing.id, form)
        : createDocumentTemplate(form),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['document-templates'] })
      setShowForm(false)
      setEditing(null)
      setForm(emptyForm())
      setFormError(null)
    },
    onError: (err) => setFormError(formatApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentTemplate(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['document-templates'] }),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = async (t: DocumentTemplateDto) => {
    setFormError(null)
    setShowForm(true)
    setLoadingEdit(true)
    try {
      const fresh = await getDocumentTemplateById(t.id)
      setEditing(fresh)
      setForm({
        code: fresh.code,
        name: fresh.name,
        documentType: fresh.documentType,
        description: fresh.description ?? '',
        fieldsSchema: fresh.fieldsSchema ?? '[]',
        templateFilePath: fresh.templateFilePath ?? '',
      })
    } catch {
      setFormError('No se pudo cargar la plantilla desde el servidor.')
      setEditing(t)
      setForm({
        code: t.code,
        name: t.name,
        documentType: t.documentType,
        description: t.description ?? '',
        fieldsSchema: t.fieldsSchema ?? '[]',
        templateFilePath: t.templateFilePath ?? '',
      })
    } finally {
      setLoadingEdit(false)
    }
  }

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto">
        <section className="mb-stack-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-sb-dark-purple">Plantillas documentales</h2>
            <p className="text-base text-on-surface-variant">
              Catálogo JSON; el archivo .docx debe existir en TEMPLATE_ROOT del servidor.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            style={{ backgroundColor: SB_COLORS.PURPLE }}
            className="px-4 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva plantilla
          </button>
        </section>

        {showForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate()
            }}
            className="mb-stack-lg bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-md space-y-3"
          >
            <h3 className="text-lg font-bold text-sb-dark-purple">
              {loadingEdit ? 'Cargando plantilla…' : editing ? 'Editar plantilla' : 'Nueva plantilla'}
            </h3>
            {formError && (
              <p className="text-sm bg-error-container text-on-error-container p-2 rounded-lg" role="alert">
                {formError}
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Código" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v }))} required disabled={!!editing} />
              <Field label="Nombre" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant">Tipo</label>
                <select
                  className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
                  value={form.documentType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, documentType: e.target.value as DocumentType }))
                  }
                >
                  {DOCUMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Ruta matriz Word (relativa a TEMPLATE_ROOT)"
                value={form.templateFilePath ?? ''}
                onChange={(v) => setForm((f) => ({ ...f, templateFilePath: v }))}
                placeholder="ej: informes/INFORME_v1.docx"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-on-surface-variant">Descripción</label>
              <textarea
                className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm min-h-16"
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-on-surface-variant">fieldsSchema (JSON)</label>
              <textarea
                className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm font-mono min-h-32"
                value={form.fieldsSchema ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, fieldsSchema: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm border border-outline-variant rounded-lg"
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saveMutation.isPending || loadingEdit}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-on-surface-variant animate-pulse">Cargando plantillas…</p>
        ) : error ? (
          <p className="text-error">No se pudieron cargar las plantillas.</p>
        ) : (
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-bold text-sb-dark-purple">
                <tr>
                  <th className="p-4">Código</th>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Matriz Word</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low/40">
                    <td className="p-4 font-mono">{t.code}</td>
                    <td className="p-4 font-semibold">{t.name}</td>
                    <td className="p-4">{t.documentType}</td>
                    <td className="p-4 text-xs text-on-surface-variant">{t.templateFilePath ?? '—'}</td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        type="button"
                        className="p-2 rounded-lg bg-sb-purple text-white"
                        onClick={() => openEdit(t)}
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg text-sb-red hover:bg-error-container/30"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar plantilla "${t.name}"?`)) {
                            deleteMutation.mutate(t.id)
                          }
                        }}
                        title="Eliminar"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  required,
  disabled,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-on-surface-variant">{label}</label>
      <input
        className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm disabled:opacity-60"
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function formatApiError(err: unknown): string {
  if (axios.isAxiosError(err) && err.response) {
    return (err.response.data as ApiErrorBody | undefined)?.message ?? err.message
  }
  return 'Error al guardar la plantilla.'
}
