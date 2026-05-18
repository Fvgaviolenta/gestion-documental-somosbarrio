import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { getActivities } from '@/features/activities/api/activities.api'
import { DocumentStatusBadge } from '@/features/documents/components/DocumentStatusBadge'
import { useDocumentsList } from '@/features/documents/hooks/useDocuments'
import type { DocumentStatus, DocumentType } from '@/features/documents/types'
import { PageHeader } from '@/shared/components/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { formatDateOnly } from '@/shared/lib/formatters'

const STATUS_OPTIONS: Array<{ value: '' | DocumentStatus; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'APROBADA', label: 'Aprobada' },
  { value: 'RECHAZADA', label: 'Rechazada' },
]

const TYPE_OPTIONS: Array<{ value: '' | DocumentType; label: string }> = [
  { value: '', label: 'Todos los tipos' },
  { value: 'ACTA', label: 'Acta' },
  { value: 'INFORME', label: 'Informe' },
  { value: 'OFICIO', label: 'Oficio' },
  { value: 'MEMO', label: 'Memo' },
  { value: 'OTRO', label: 'Otro' },
]

export function DocumentsListPage() {
  const [status, setStatus] = useState<'' | DocumentStatus>('')
  const [activityId, setActivityId] = useState('')
  const [typeFilter, setTypeFilter] = useState<'' | DocumentType>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const activitiesQuery = useQuery({
    queryKey: ['activities', 'picker'],
    queryFn: () => getActivities({ page: 0, size: 100 }),
  })

  const query = useDocumentsList({
    status: status || undefined,
    activityId: activityId || undefined,
    page,
    size: 20,
  })

  const filteredDocuments = useMemo(() => {
    const list = query.data?.content ?? []
    const term = search.trim().toLowerCase()
    return list.filter((doc) => {
      if (typeFilter && doc.documentType !== typeFilter) return false
      if (!term) return true
      return (
        doc.title.toLowerCase().includes(term) ||
        (doc.code?.toLowerCase().includes(term) ?? false) ||
        (doc.templateName?.toLowerCase().includes(term) ?? false)
      )
    })
  }, [query.data?.content, search, typeFilter])

  const totalPages = query.data?.totalPages ?? 1

  return (
    <div className="p-margin">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Documentos"
          description="Listado de trámites y documentos institucionales."
        />
        <Link to="/documents/new">
          <Button type="button">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nueva solicitud
          </Button>
        </Link>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="doc-search" className="mb-1 block text-sm font-medium">
            Buscar
          </label>
          <input
            id="doc-search"
            type="search"
            placeholder="Título, código o plantilla…"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="doc-status-filter" className="mb-1 block text-sm font-medium">
            Estado
          </label>
          <select
            id="doc-status-filter"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={status}
            onChange={(e) => {
              setPage(0)
              setStatus(e.target.value as '' | DocumentStatus)
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="doc-type-filter" className="mb-1 block text-sm font-medium">
            Tipo
          </label>
          <select
            id="doc-type-filter"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as '' | DocumentType)}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="doc-activity-filter" className="mb-1 block text-sm font-medium">
            Actividad
          </label>
          <select
            id="doc-activity-filter"
            className="w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] px-3 py-2 text-sm"
            value={activityId}
            onChange={(e) => {
              setPage(0)
              setActivityId(e.target.value)
            }}
          >
            <option value="">Todas</option>
            {(activitiesQuery.data?.content ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Cargando documentos…</p>
      ) : query.isError ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          No se pudieron cargar los documentos.
        </p>
      ) : filteredDocuments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-sm text-[var(--color-muted-foreground)]">
          No hay documentos con estos filtros.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código / Título</th>
                  <th className="px-4 py-3 font-semibold">Plantilla</th>
                  <th className="px-4 py-3 font-semibold">Actividad</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Creado</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{doc.title}</p>
                      {doc.code ? (
                        <p className="text-xs text-[var(--color-muted-foreground)]">{doc.code}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{doc.templateName ?? doc.documentType}</td>
                    <td className="px-4 py-3">{doc.activityTitle ?? '—'}</td>
                    <td className="px-4 py-3">
                      <DocumentStatusBadge status={doc.status} label={doc.statusLabel} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                      {formatDateOnly(doc.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/documents/${doc.id}`}
                        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between gap-2">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Página {page + 1} de {totalPages} · {query.data?.totalElements ?? 0} registros
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page + 1 >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
