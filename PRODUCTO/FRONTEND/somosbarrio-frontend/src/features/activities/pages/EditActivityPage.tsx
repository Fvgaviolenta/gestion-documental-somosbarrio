import axios from 'axios'
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

export function EditActivityPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()

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
          description='Actualiza la información principal de la actividad.'
        />

        <div className='bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-stack-lg mt-stack-lg'>
          <ActivityForm
            defaultValues={query.data}
            submitLabel='Guardar cambios'
            isSubmitting={mutation.isPending}
            onSubmit={(values) => {
              mutation.mutate(values, {
                onSuccess: () => {
                  navigate('/activities', { replace: true })
                },
              })
            }}
          />

          {message ? (
            <p className='mt-3 text-sm text-[var(--color-destructive)]'>{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}