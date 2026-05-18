import type { PagedResponse } from '@/shared/types/api'

export type DocumentType = 'ACTA' | 'INFORME' | 'OFICIO' | 'MEMO' | 'OTRO'
export type DocumentStatus = 'BORRADOR' | 'EN_REVISION' | 'APROBADA' | 'RECHAZADA'

export interface DocumentDto {
  id: string
  code?: string
  templateId: string
  templateName?: string
  documentType: DocumentType
  activityId?: string
  activityTitle?: string
  title: string
  fieldValues?: string
  status: DocumentStatus
  statusLabel?: string
  rejectionReason?: string
  generatedPdfPath?: string
  createdByName?: string
  createdAt?: string
  updatedAt?: string
  attachments?: DocumentAttachmentDto[]
}

export interface DocumentAttachmentDto {
  id: string
  originalFilename: string
  contentType?: string
  sizeBytes?: number
  createdAt?: string
}

export interface DocumentTemplateDto {
  id: string
  code: string
  name: string
  documentType: DocumentType
  description?: string
  fieldsSchema?: string
  templateFilePath?: string
  isActive?: boolean
}

export interface UpdateDocumentPayload {
  title: string
  fieldValues?: string
}

export interface RejectDocumentPayload {
  rejectionReason: string
}

export interface TemplateFieldDefinition {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'time' | 'month' | string
  required?: boolean
  minLength?: number
  maxLength?: number
}

export interface CreateDocumentPayload {
  templateId: string
  activityId?: string
  title: string
  fieldValues?: string
}

export type DocumentsPage = PagedResponse<DocumentDto>

export const DOCUMENT_KIND = {
  BITACORA: 'BITACORA',
  REPORTE_RAPIDO: 'REPORTE_RAPIDO',
} as const

export type DocumentKind = (typeof DOCUMENT_KIND)[keyof typeof DOCUMENT_KIND]

export interface BitacoraFieldValues {
  kind: typeof DOCUMENT_KIND.BITACORA
  date: string
  relevantEvent: string
  territory: string
  team: string
  description: string
}

export interface ReporteRapidoFieldValues {
  kind: typeof DOCUMENT_KIND.REPORTE_RAPIDO
  description: string
}
