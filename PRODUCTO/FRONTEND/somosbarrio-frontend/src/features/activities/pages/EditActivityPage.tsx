import axios from 'axios'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ActivityForm } from '@/features/activities/components/ActivityForm'
import {
  useActivity,
  useUpdateActivity,
} from '@/features/activities/hooks/useActivities'
import { Button } from '@/shared/components/ui/button'
import { EmptyState } from '@/shared/components/EmptyState'
import { PageHeader } from '@/shared/components/PageHeader'
import type { ApiErrorBody } from '@/shared/types/api'
import { api } from '@/shared/lib/axios'

const STATUS_LABELS: Record<string, string> = {
  PLANIFICADA: 'Planificada',
  EN_CURSO: 'En curso',
  FINALIZADA: 'Finalizada',
  CANCELADA: 'Cancelada',
}

export function EditActivityPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false) 

  const query = useActivity(id)
  const mutation = useUpdateActivity(id)

  const message = (() => {
    if (!mutation.isError || !axios.isAxiosError(mutation.error)) return null
    const data = mutation.error.response?.data as ApiErrorBody | undefined
    return data?.message ?? mutation.error.message
  })()

  if (query.isLoading) {
    return <p className='text-sm text-[var(--color-muted-foreground)] p-margin'>Cargando…</p>
  }

  if (query.isError || !query.data) {
    return (
      <EmptyState
        title='No se pudo cargar la actividad'
        description='Verifica que exista y que tengas permisos para editarla.'
      />
    )
  }

  const handleStatusChange = async (newStatus: string) => {
    setIsPending(true)
    setStatusMessage(null)
    try {
      await api.patch(`/activities/${id}/status`, null, {
        params: { status: newStatus }
      })
      
      setStatusMessage('Estado actualizado correctamente.')
      void query.refetch() 
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as ApiErrorBody | undefined
        setStatusMessage(data?.message ?? 'No se pudo actualizar el estado.')
      } else {
        setStatusMessage('Error al cambiar el estado.')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className='p-margin bg-surface min-h-screen'> 
      <div className='max-w-2xl mx-auto'>
        <div className='mb-4'>
          <Link to='/activities'>
            <Button variant='ghost' size='sm' className="text-on-surface-variant hover:bg-surface-container-high">
              ← Volver a actividades
            </Button>
          </Link>
        </div>

        <PageHeader
          title='Editar actividad'
          description='Actualiza la información principal de la actividad y su estado operativo.'
        />

        {/* Selector de Estado Operativo (PATCH /status) */}
        <div className='bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-stack-lg mt-stack-lg'>
          <h3 className='text-sm font-bold text-sb-dark-purple uppercase tracking-wider mb-3'>Estado de la Actividad</h3>
          <div className='flex flex-col sm:flex-row sm:items-center gap-4'>
            <select
              value={query.data.status}
              disabled={isPending}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none cursor-pointer font-medium text-on-surface"
            >
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {isPending && <span className='text-xs text-on-surface-variant animate-pulse'>Actualizando en el servidor...</span>}
            {statusMessage && (
              <span className={`text-xs font-semibold ${statusMessage.includes('correctamente') ? 'text-green-600' : 'text-sb-red'}`}>
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* Formulario Principal de Información */}
        <div className='bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-stack-lg mt-stack-md'>
          <h3 className='text-sm font-bold text-sb-dark-purple uppercase tracking-wider mb-4'>Información General</h3>
          <ActivityForm
            defaultValues={query.data}
            submitLabel='Guardar cambios'
            isSubmitting={mutation.isPending}
            onCancel={() => navigate('/activities')} 
            onSubmit={(values) => {
              mutation.mutate(values, {
                onSuccess: () => {
                  navigate('/activities', { replace: true })
                },
              })
            }}
          />

          {message ? (
            <p className='mt-3 text-sm text-sb-red'>{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}