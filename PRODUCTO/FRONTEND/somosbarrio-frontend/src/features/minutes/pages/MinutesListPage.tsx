import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useMinutesList } from '@/features/minutes/hooks/useMinutes'
import { minuteDisplayTitle } from '@/features/minutes/lib/minute-content'
import { MinuteStatusBadge } from '@/features/minutes/components/MinuteStatusBadge'
import type { MinuteStatus } from '@/features/minutes/types'
import { formatDateOnly } from '@/shared/lib/formatters'
import { useActivityOptions } from '@/shared/hooks/useActivityOptions'

const STATUS_OPTIONS: { value: MinuteStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'APROBADA', label: 'Aprobada' },
]

export function MinutesListPage() {
  const [status, setStatus] = useState<MinuteStatus | ''>('')
  const [activityId, setActivityId] = useState('')
  const [page, setPage] = useState(0)
  const activitiesQuery = useActivityOptions()

  const { data, isLoading, error } = useMinutesList({
    status: status || undefined,
    activityId: activityId || undefined,
    page,
    size: 20,
  })

  const items = data?.content ?? []

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto space-y-6">
        <section>
          <h2 className="text-4xl font-bold text-sb-dark-purple">Actas</h2>
          <p className="text-base text-on-surface-variant">
            Bandeja administrativa de actas de reunión.
          </p>
        </section>

        <section className="flex flex-col sm:flex-row gap-3 items-end bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md">
          <div className="w-full sm:w-48">
            <label className="text-xs font-bold uppercase text-on-surface-variant">Estado</label>
            <select
              className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as MinuteStatus | '')
                setPage(0)
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:min-w-[16rem] sm:flex-1">
            <label className="text-xs font-bold uppercase text-on-surface-variant">Actividad</label>
            <select
              className="w-full mt-1 p-2 border border-outline-variant rounded-lg text-sm"
              value={activityId}
              onChange={(e) => {
                setActivityId(e.target.value)
                setPage(0)
              }}
            >
              <option value="">Todas</option>
              {activitiesQuery.data?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {isLoading ? (
          <p className="text-on-surface-variant animate-pulse">Cargando actas…</p>
        ) : error ? (
          <p className="text-error">No se pudieron cargar las actas.</p>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant">{data?.totalElements ?? 0} acta(s)</p>
            <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low text-xs uppercase font-bold text-sb-dark-purple">
                  <tr>
                    <th className="p-4">Acta</th>
                    <th className="p-4">Actividad</th>
                    <th className="p-4">Autor</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Creada</th>
                    <th className="p-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        No hay actas con los filtros seleccionados.
                      </td>
                    </tr>
                  ) : (
                    items.map((minute) => (
                      <tr key={minute.id} className="hover:bg-surface-container-low/40">
                        <td className="p-4 font-semibold text-sb-dark-purple">
                          {minuteDisplayTitle(minute)}
                        </td>
                        <td className="p-4 text-on-surface-variant">
                          {minute.activityTitle ?? minute.activityId}
                        </td>
                        <td className="p-4">{minute.authorName ?? '—'}</td>
                        <td className="p-4">
                          <MinuteStatusBadge status={minute.status} label={minute.statusLabel} />
                        </td>
                        <td className="p-4">{formatDateOnly(minute.createdAt)}</td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/minutes/${minute.id}`}
                            className="text-sb-purple font-semibold text-xs hover:underline"
                          >
                            Ver detalle
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
                  disabled={page <= 0}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </button>
                <span className="text-sm self-center">
                  Página {page + 1} de {data?.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= (data?.totalPages ?? 1) - 1}
                  className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
                  onClick={() => setPage((p) => p + 1)}
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
