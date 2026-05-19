import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import {
  getAuditLogs,
  type AuditAction,
  type AuditLogFilter,
} from '@/features/audit/api/audit.api'
import { formatDateOnly } from '@/shared/lib/formatters'
import { useUserOptions } from '@/shared/hooks/useUserOptions'

const ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'APPROVE',
  'REJECT',
  'LOGIN',
  'LOGIN_FAILED',
  'EMAIL_SENT',
  'PDF_GENERATED',
  'REPORT_GENERATED',
]

export function AuditLogsPage() {
  const userOptionsQuery = useUserOptions()
  const [filters, setFilters] = useState<AuditLogFilter>({ page: 0, size: 25 })
  const [applied, setApplied] = useState(filters)

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-logs', applied],
    queryFn: () => getAuditLogs(applied),
  })

  const logs = data?.content ?? []

  return (
    <div className="min-h-screen p-margin bg-surface">
      <div className="max-w-container-max mx-auto space-y-6">
        <section>
          <h2 className="text-4xl font-bold text-sb-dark-purple">Auditoría del sistema</h2>
          <p className="text-on-surface-variant">Historial de eventos con filtros opcionales.</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-md">
          <input
            className="p-2 border rounded-lg text-sm"
            placeholder="entityType"
            value={filters.entityType ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, entityType: e.target.value }))}
          />
          <input
            className="p-2 border rounded-lg text-sm"
            placeholder="entityId"
            value={filters.entityId ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, entityId: e.target.value }))}
          />
          {(userOptionsQuery.data?.length ?? 0) > 0 ? (
            <select
              className="p-2 border rounded-lg text-sm"
              value={filters.userId ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, userId: e.target.value || undefined }))
              }
            >
              <option value="">Todos los usuarios</option>
              {userOptionsQuery.data?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="p-2 border rounded-lg text-sm"
              placeholder="userId (UUID)"
              value={filters.userId ?? ''}
              onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
            />
          )}
          <select
            className="p-2 border rounded-lg text-sm"
            value={filters.action ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                action: (e.target.value || undefined) as AuditAction | undefined,
              }))
            }
          >
            <option value="">Todas las acciones</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="md:col-span-2 lg:col-span-4 px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold"
            onClick={() => setApplied({ ...filters, page: 0 })}
          >
            Buscar
          </button>
        </section>

        {error ? (
          <p className="text-error">No se pudo cargar la auditoría.</p>
        ) : isLoading ? (
          <p className="animate-pulse text-on-surface-variant">Cargando registros…</p>
        ) : (
          <section className="overflow-x-auto bg-surface-container-lowest border border-outline-variant rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low uppercase font-bold text-sb-dark-purple">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Entidad</th>
                  <th className="p-3">Usuario</th>
                  <th className="p-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-mono">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 whitespace-nowrap">{formatDateOnly(log.createdAt)}</td>
                      <td className="p-3">{log.action}</td>
                      <td className="p-3">
                        {log.entityType ?? '—'}
                        {log.entityId ? ` / ${log.entityId}` : ''}
                      </td>
                      <td className="p-3">{log.userId ?? '—'}</td>
                      <td className="p-3">{log.ipAddress ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {(data?.totalPages ?? 0) > 1 && (
              <div className="flex justify-center gap-2 p-4">
                <button
                  type="button"
                  disabled={(applied.page ?? 0) <= 0}
                  className="px-3 py-1 border rounded-lg disabled:opacity-40"
                  onClick={() => setApplied((a) => ({ ...a, page: (a.page ?? 0) - 1 }))}
                >
                  Anterior
                </button>
                <span className="text-sm self-center">
                  {(applied.page ?? 0) + 1} / {data?.totalPages}
                </span>
                <button
                  type="button"
                  disabled={(applied.page ?? 0) >= (data?.totalPages ?? 1) - 1}
                  className="px-3 py-1 border rounded-lg disabled:opacity-40"
                  onClick={() => setApplied((a) => ({ ...a, page: (a.page ?? 0) + 1 }))}
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
