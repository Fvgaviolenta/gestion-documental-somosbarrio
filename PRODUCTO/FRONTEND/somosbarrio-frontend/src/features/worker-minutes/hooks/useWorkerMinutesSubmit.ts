import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

import { createMinuteWithAttachments, listMinutes } from '@/features/minutes/api/minutes.api'
import { buildMinuteContent, minuteDisplayTitle, parseMinuteContent } from '@/features/minutes/lib/minute-content'
import type { MinuteFormContent, MinuteStatus } from '@/features/minutes/types'
import { useDefaultActivityId } from '@/features/worker/hooks/useDefaultActivityId'

export function useWorkerMinutesList(enabled: boolean) {
  return useQuery({
    queryKey: ['worker', 'minutes'],
    queryFn: () => listMinutes({ page: 0, size: 50 }),
    enabled,
    select: (page) => page.content,
  })
}

export function useWorkerMinutesSubmit() {
  const queryClient = useQueryClient()
  const { data: activityId } = useDefaultActivityId()

  return useMutation({
    mutationFn: async (input: {
      fields: MinuteFormContent
      files: File[]
    }) => {
      if (!activityId) {
        throw new Error('No hay actividad disponible para asociar el acta.')
      }
      const title =
        input.fields.numeroActa.trim().length > 0
          ? `Acta ${input.fields.numeroActa} — ${input.fields.proyecto}`
          : `Acta — ${input.fields.proyecto}`

      return createMinuteWithAttachments(
        {
          activityId,
          title,
          content: buildMinuteContent(input.fields),
        },
        input.files,
      )
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['worker', 'minutes'] })
    },
  })
}

export function formatMinuteError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ?? error.message
    )
  }
  if (error instanceof Error) return error.message
  return 'No se pudo enviar el acta.'
}

export const minuteStatusStyles: Record<MinuteStatus, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  EN_REVISION: 'bg-amber-100 text-amber-700',
  APROBADA: 'bg-emerald-100 text-emerald-700',
}

export { minuteDisplayTitle, parseMinuteContent }
