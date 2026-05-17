import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { api } from '@/shared/lib/axios'
import { ActivityForm } from '@/features/activities/components/ActivityForm'
import { PageHeader } from '@/shared/components/PageHeader'
import type { ApiErrorBody } from '@/shared/types/api'
import type { ActivityFormValues } from '@/features/activities/schemas/activity.schema'

function formatDateToISO(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function CreateActivityPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(values: ActivityFormValues) {
    setIsSubmitting(true)
    setMessage(null)

try {
      const payload = {
        title: values.title,
        territory: values.territory,
        description: values.description || undefined,
        startDate: formatDateToISO(values.startDate),
        status: 'PLANIFICADA',
      }

      const response = await api.post('/api/v1/activities', payload)
      if (response.status === 201) {
        navigate('/activities')
      } else {
        setMessage('No se pudo crear la actividad. Intenta nuevamente.')
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as ApiErrorBody | undefined
        setMessage(data?.message ?? error.message)
      } else {
        setMessage('Ocurrió un error al crear la actividad. Intenta nuevamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/activities')}
          />

          {message ? (
            <p className='mt-3 text-sm text-[var(--color-destructive)]'>{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}