import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { DocumentStatusBadge } from '@/features/documents/components/DocumentStatusBadge'
import type { DocumentStatus, DocumentType } from '@/features/documents/types'
import {
  searchRepositoryDocuments,
  type RepositorySearchParams,
} from '@/features/repository/api/repository.api'
import { formatDateOnly } from '@/shared/lib/formatters'
import { useUserOptions } from '@/shared/hooks/useUserOptions'
import { useAuthStore } from '@/store/authStore'

const DOCUMENT_TYPES: DocumentType[] = ['ACTA', 'INFORME', 'OFICIO', 'MEMO', 'OTRO']
const STATUSES: DocumentStatus[] = ['BORRADOR', 'EN_REVISION', 'APROBADA', 'RECHAZADA']

export function RepositoryPage() {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMINISTRADOR'))
  const userOptionsQuery = useUserOptions(isAdmin)

  const [filters, setFilters] = useState<RepositorySearchParams>({
    page: 0,
    size: 20,
    belongsToMe: false,
  })
  const [applied, setApplied] = useState(filters)

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['repository', applied],
    queryFn: () => searchRepositoryDocuments(applied),
  })

  const items = data?.content ?? []

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto space-y-6">
        <section>
          <h2 className="text-4xl font-bold text-sb-dark-purple">Repositorio documental</h2>
          <p className="text-base text-on-surface-variant">
            Búsqueda avanzada de documentos institucionales.
          </p>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <FilterInput
            label="Texto libre (q)"
            value={filters.q ?? ''}
            onChange={(q) => setFilters((f) => ({ ...f, q }))}
          />
          <FilterInput
            label="Código"
            value={filters.code ?? ''}
            onChange={(code) => setFilters((f) => ({ ...f, code }))}
          />
          <div>
            <label className="text-xs font-bold uppercase text-on-surface-variant">Tipo</label>
            <select
              className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
              value={filters.type ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  type: (e.target.value || undefined) as DocumentType | undefined,
                }))
              }
            >
              <option value="">Todos</option>
              {DOCUMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-on-surface-variant">Estado</label>
            <select
              className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
              value={filters.status ?? ''}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  status: (e.target.value || undefined) as DocumentStatus | undefined,
                }))
              }
            >
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <FilterInput
            label="Desde"
            type="date"
            value={filters.from ?? ''}
            onChange={(from) => setFilters((f) => ({ ...f, from }))}
          />
          <FilterInput
            label="Hasta"
            type="date"
            value={filters.to ?? ''}
            onChange={(to) => setFilters((f) => ({ ...f, to }))}
          />
          <FilterInput
            label="ID actividad"
            value={filters.activityId ?? ''}
            onChange={(activityId) => setFilters((f) => ({ ...f, activityId }))}
          />
          {isAdmin && (userOptionsQuery.data?.length ?? 0) > 0 ? (
            <div>
              <label className="text-xs font-bold uppercase text-on-surface-variant">Autor</label>
              <select
                className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
                value={filters.authorId ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, authorId: e.target.value || undefined }))
                }
              >
                <option value="">Todos</option>
                {userOptionsQuery.data?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <FilterInput
              label="ID autor (UUID)"
              value={filters.authorId ?? ''}
              onChange={(authorId) => setFilters((f) => ({ ...f, authorId }))}
            />
          )}
          <label className="flex items-center gap-2 text-sm mt-6">
            <input
              type="checkbox"
              checked={filters.belongsToMe ?? false}
              onChange={(e) => setFilters((f) => ({ ...f, belongsToMe: e.target.checked }))}
            />
            Solo mis documentos
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold"
              onClick={() => setApplied({ ...filters, page: 0 })}
            >
              Buscar
            </button>
          </div>
        </section>

        {error ? (
          <p className="text-error">No se pudo realizar la búsqueda.</p>
        ) : isLoading ? (
          <p className="text-on-surface-variant animate-pulse">Buscando…</p>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant">
              {isFetching ? 'Actualizando…' : `${data?.totalElements ?? 0} resultado(s)`}
            </p>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-xs uppercase font-bold text-sb-dark-purple">
                  <tr>
                    <th className="p-4">Código / Título</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Autor</th>
                    <th className="p-4">Creado</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        Sin resultados para los filtros indicados.
                      </td>
                    </tr>
                  ) : (
                    items.map((doc) => (
                      <tr key={doc.id} className="hover:bg-surface-container-low/40">
                        <td className="p-4">
                          <p className="font-semibold">{doc.title}</p>
                          <p className="text-xs font-mono text-on-surface-variant">{doc.code ?? doc.id}</p>
                        </td>
                        <td className="p-4">{doc.documentType}</td>
                        <td className="p-4">
                          <DocumentStatusBadge status={doc.status} />
                        </td>
                        <td className="p-4">{doc.createdByName ?? '—'}</td>
                        <td className="p-4">{formatDateOnly(doc.createdAt)}</td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="text-sb-purple font-semibold text-xs hover:underline"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
            {(data?.totalPages ?? 0) > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  disabled={(applied.page ?? 0) <= 0}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
                  onClick={() => setApplied((a) => ({ ...a, page: (a.page ?? 0) - 1 }))}
                >
                  Anterior
                </button>
                <span className="text-sm self-center">
                  Página {(applied.page ?? 0) + 1} de {data?.totalPages}
                </span>
                <button
                  type="button"
                  disabled={(applied.page ?? 0) >= (data?.totalPages ?? 1) - 1}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
                  onClick={() => setApplied((a) => ({ ...a, page: (a.page ?? 0) + 1 }))}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FilterInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="text-xs font-bold uppercase text-on-surface-variant">{label}</label>
      <input
        type={type}
        className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
