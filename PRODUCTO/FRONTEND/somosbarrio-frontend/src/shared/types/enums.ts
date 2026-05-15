export const ROLES = [
  'ADMINISTRADOR',
  'COLABORADOR',
] as const

export type Role = (typeof ROLES)[number]

export const ACTIVITY_STATUS = [
  'PLANIFICADA',
  'EN_CURSO',
  'FINALIZADA',
  'CANCELADA',
] as const

export type ActivityStatus = (typeof ACTIVITY_STATUS)[number]
