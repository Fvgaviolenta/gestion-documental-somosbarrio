import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  useActivities,
} from '@/features/activities/hooks/useActivities'
import { formatDateOnly } from '@/shared/lib/formatters'
import type { ActivityStatus } from '@/shared/types/enums'

const STATUS_LABELS: Record<string, string> = {
  PLANIFICADA: 'Planificada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PLANIFICADA: 'bg-secondary-container text-on-secondary-container',
    EN_CURSO: 'bg-primary text-on-primary',
    FINALIZADA: 'bg-green-100 text-green-700',
    CANCELADA: 'bg-error-container text-on-error-container',
  }
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.PLANIFICADA}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function ActivitiesListPage() {
  const [status, setStatus] = useState<ActivityStatus | ''>('')

  const filter = useMemo(
    () => ({ page: 0, size: 20, status }),
    [status],
  )
  const { data, isLoading, isError } = useActivities(filter)

  return (
    <div className="p-margin bg-surface min-h-screen">
      <div className="max-w-container-max mx-auto">
        
        <div className="mb-section-gap">
          <h2 className="text-4xl font-bold text-primary">Gestión de Actividades</h2>
          <p className="text-base text-on-surface-variant">Administración y seguimiento de operativos territoriales.</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-sm mb-stack-lg flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-primary uppercase mb-2 block">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ActivityStatus | '')}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none cursor-pointer"
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <Link to="/activities/new" className="w-full md:w-auto">
            <button className="w-full md:w-auto px-6 py-2 bg-black text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-all active:scale-95 shadow-sm">
                <span className="material-symbols-outlined text-white text-lg">add</span>
                Nueva Actividad
            </button>
          </Link>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-primary uppercase text-[10px] tracking-widest font-bold">
                <th className="px-6 py-4">Actividad</th>
                <th className="px-6 py-4">Territorio</th>
                <th className="px-6 py-4">Fecha Programada</th>
                <th className="px-6 py-4">Estado Actual</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant animate-pulse">Cargando registros...</td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-error font-medium">Error al conectar con el servidor.</td>
                </tr>
              )}
              {data?.content.map((activity) => (
                <tr key={activity.id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-primary text-sm">{activity.title}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-1">{activity.description || 'Sin descripción'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{activity.territory}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-primary">{formatDateOnly(activity.startDate)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={activity.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/activities/${activity.id}/edit`}>
                        <button className="rounded-lg bg-black p-2 text-white transition-colors hover:bg-zinc-700">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                      </Link>
                      <button className="rounded-lg bg-black p-2 text-white transition-colors hover:bg-zinc-700">
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}