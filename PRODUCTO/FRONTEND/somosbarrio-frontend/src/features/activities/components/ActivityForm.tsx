import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import type { ActivityDto } from '@/features/activities/api/activities.api'
import {
  activitySchema,
  type ActivityFormValues,
} from '@/features/activities/schemas/activity.schema'

interface ActivityFormProps {
  defaultValues?: Partial<ActivityDto>
  isSubmitting?: boolean
  submitLabel: string
  onSubmit: (values: ActivityFormValues) => void
}

export function ActivityForm({
  defaultValues,
  isSubmitting,
  submitLabel,
  onSubmit,
}: ActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      territory: defaultValues?.territory ?? '',
      startDate: defaultValues?.startDate?.slice(0, 10) ?? '',
    },
  })

  return (
    <form
      className='space-y-stack-md'
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <label className='text-xs font-bold text-primary uppercase mb-2 block' htmlFor='title'>
          Título
        </label>
        <input
          id='title'
          placeholder="Ej: Operativo de limpieza"
          className='w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all'
          {...form.register('title')}
        />
        {form.formState.errors.title ? (
          <p className='mt-1 text-xs text-error font-medium'>
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className='text-xs font-bold text-primary uppercase mb-2 block' htmlFor='territory'>
          Territorio
        </label>
        <input
          id='territory'
          placeholder="Ej: Sector Miraflores"
          className='w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all'
          {...form.register('territory')}
        />
        {form.formState.errors.territory ? (
          <p className='mt-1 text-xs text-error font-medium'>
            {form.formState.errors.territory.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className='text-xs font-bold text-primary uppercase mb-2 block' htmlFor='startDate'>
          Fecha de inicio
        </label>
        <input
          id='startDate'
          type='date'
          className='w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all'
          {...form.register('startDate')}
        />
        {form.formState.errors.startDate ? (
          <p className='mt-1 text-xs text-error font-medium'>
            {form.formState.errors.startDate.message}
          </p>
        ) : null}
      </div>

      <div>
        <label className='text-xs font-bold text-primary uppercase mb-2 block' htmlFor='description'>
          Descripción
        </label>
        <textarea
          id='description'
          rows={4}
          placeholder="Detalla los objetivos de la actividad..."
          className='w-full px-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all'
          {...form.register('description')}
        />
        {form.formState.errors.description ? (
          <p className='mt-1 text-xs text-error font-medium'>
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className='flex justify-end pt-4'>
        <button 
          type='submit' 
          disabled={isSubmitting}
          className="cursor-pointer rounded-lg bg-black px-8 py-2 font-semibold text-white transition-all hover:bg-zinc-700 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="material-symbols-outlined animate-spin text-white text-lg">progress_activity</span>
          ) : (
            <span className="material-symbols-outlined text-white text-lg">check_circle</span>
          )}
          {isSubmitting ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  )
}