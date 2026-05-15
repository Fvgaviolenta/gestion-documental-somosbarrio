import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import { ActivityForm } from '@/features/activities/components/ActivityForm'
import { useCreateActivity } from '@/features/activities/hooks/useActivities'
import { PageHeader } from '@/shared/components/PageHeader'
import type { ApiErrorBody } from '@/shared/types/api'

export function CreateActivityPage() {
  const navigate = useNavigate()
  const mutation = useCreateActivity()

  const message = (() => {
    if (!mutation.isError || !axios.isAxiosError(mutation.error)) return null
    const data = mutation.error.response?.data as ApiErrorBody | undefined
    return data?.message ?? mutation.error.message
  })()

  return (
    <div className='p-margin bg-surface min-h-screen'> 
      <div className='max-w-2xl mx-auto'>
        <PageHeader
          title='Nueva actividad'
          description='Completa los datos para planificar una actividad comunitaria.'
        />
        
        <div className='bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-stack-lg mt-stack-lg'>
          <ActivityForm
            submitLabel='Crear actividad'
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
        </div> {/* Cerrando el cuadro blanco */}
      </div> {/* Cerrando el max-w-2xl */}
    </div> 
  )
}