import type { PagedResponse } from '@/shared/types/api'

export type MinuteStatus = 'BORRADOR' | 'EN_REVISION' | 'APROBADA'

export interface MinuteAttachmentDto {
  id: string
  originalName: string
  mimeType?: string
  sizeBytes?: number
  uploadedAt?: string
}

export interface MinuteDto {
  id: string
  activityId: string
  activityTitle?: string
  title: string
  content?: string
  status: MinuteStatus
  statusLabel?: string
  authorId?: string
  authorName?: string
  createdAt?: string
  updatedAt?: string
  attachments?: MinuteAttachmentDto[]
}

export interface UpdateMinutePayload {
  title: string
  content?: string
}

export interface CreateMinutePayload {
  activityId: string
  title: string
  content?: string
}

export type MinutesPage = PagedResponse<MinuteDto>

export interface MinuteFormContent {
  numeroActa: string
  proyecto: string
  comuna: string
  barrio: string
  reunionConvocadaPor: string
  fechaActividad: string
  horaInicio: string
  horaTermino: string
  lugarReunion: string
  motivoObjetivo: string
  resumenTemas: string
  compromisosResponsabilidades: string
  gestorBarrial: string
  accion: string
  contraparteSpd: string
  accionContraparte: string
}
