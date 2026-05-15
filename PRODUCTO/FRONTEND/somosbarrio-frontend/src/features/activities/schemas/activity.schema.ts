import { z } from 'zod'

export const activitySchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(180, 'El título no puede superar 180 caracteres'),
  description: z.string().max(3000, 'Máximo 3000 caracteres').optional(),
  territory: z
    .string()
    .trim()
    .min(2, 'Ingresa un territorio válido')
    .max(120, 'Máximo 120 caracteres'),
  startDate: z.string().min(1, 'Selecciona una fecha'),
})

export type ActivityFormValues = z.infer<typeof activitySchema>
