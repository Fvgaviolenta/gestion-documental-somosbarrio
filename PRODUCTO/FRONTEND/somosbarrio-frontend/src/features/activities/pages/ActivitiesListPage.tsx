import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { deleteActivity } from '@/features/activities/api/activities.api'
import { api } from '@/shared/lib/axios'
import { formatDateOnly } from '@/shared/lib/formatters'
import type { ActivityStatus } from '@/shared/types/enums'
import { SB_COLORS } from '@/shared/constants/colors'
import { useAuthStore } from '@/store/authStore'

const STATUS_LABELS: Record<string, string> = {
  PLANIFICADA: 'Planificada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

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

interface BackendActivity {
  id: string | number
  title?: string
  name?: string
  description?: string
  territory?: string
  startDate?: string
  start_date?: string
  status?: string
}

export function ActivitiesListPage() {
  const isAdmin = useAuthStore((s) => s.hasRole('ADMINISTRADOR'))
  const [status, setStatus] = useState<ActivityStatus | ''>('')
  const [activities, setActivities] = useState<BackendActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => setReloadKey((k) => k + 1),
    onError: () => setError('No se pudo eliminar la actividad (puede tener actas vinculadas).'),
  })

  useEffect(() => {
    let canceled = false

    async function fetchActivities() {
      setLoading(true)
      setError(null)

      try {
        const response = await api.get('/activities', {
          params: {
            status: status || undefined,
          },
        })

        if (canceled) return

        const data = response.data
        const items: BackendActivity[] = Array.isArray(data) ? data : data?.content ?? []

        setActivities(
          items.map((item: BackendActivity) => ({
            id: String(item.id ?? ''),
            title: String(item.title ?? item.name ?? 'Sin título'),
            description: item.description ? String(item.description) : undefined,
            territory: String(item.territory ?? ''),
            startDate: String(item.startDate ?? item.start_date ?? ''),
            status: String(item.status ?? 'PLANIFICADA'),
          })),
        )
      } catch {
        if (!canceled) {
          setError('No se pudieron cargar las actividades.')
        }
      } finally {
        if (!canceled) {
          setLoading(false)
        }
      }
    }

    void fetchActivities()

    return () => {
      canceled = true
    }
  }, [status, reloadKey])

  const noData = !loading && !error && activities.length === 0

  return (
    <div className="p-margin bg-surface min-h-screen">
      <div className="max-w-container-max mx-auto">
        
        <div className="mb-section-gap">
          <h2 className="text-4xl font-bold text-sb-dark-purple">Gestión de Actividades</h2>
          <p className="text-base text-on-surface-variant">Administración y seguimiento de operativos territoriales.</p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl shadow-sm mb-stack-lg flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-48">
            <label className="text-xs font-bold text-sb-dark-purple uppercase mb-2 block">Estado</label>
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
            <button 
              style={{ backgroundColor: SB_COLORS.PURPLE }}
              className="w-full md:w-auto px-6 py-2 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-sm cursor-pointer text-sm">
              <span className="material-symbols-outlined text-white text-lg">add</span>
              <span>Nueva Actividad</span>
            </button>
          </Link>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-sb-dark-purple uppercase text-[10px] tracking-widest font-bold">
                <th className="px-6 py-4">Actividad</th>
                <th className="px-6 py-4">Territorio</th>
                <th className="px-6 py-4">Fecha Programada</th>
                <th className="px-6 py-4">Estado Actual</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant animate-pulse">Cargando registros...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-error font-medium">{error}</td>
                </tr>
              )}
              {noData && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No hay actividades registradas.</td>
                </tr>
              )}
              {activities.map((activity) => (
                <tr key={activity.id} className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sb-dark-purple text-sm">{activity.title}</p>
                    <p className="text-xs text-on-surface-variant line-clamp-1">{activity.description || 'Sin descripción'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{activity.territory}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-sb-dark-purple">{formatDateOnly(activity.startDate)}</td>
                  <td className="px-6 py-4">
                  <StatusBadge status={activity.status ?? 'PLANIFICADA'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/activities/${activity.id}/edit`}>
                        <button className="rounded-lg bg-sb-purple p-2 text-white transition-colors hover:bg-sb-purple/90">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                      </Link>
                      {isAdmin && (
                        <button
                          type="button"
                          className="rounded-lg bg-surface-variant p-2 text-sb-red transition-colors hover:bg-error-container/30 disabled:opacity-40"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (window.confirm('¿Eliminar esta actividad? No se puede deshacer si hay actas vinculadas.')) {
                              deleteMutation.mutate(String(activity.id))
                            }
                          }}
                          title="Eliminar actividad"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      )}
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