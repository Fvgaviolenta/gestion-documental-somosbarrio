import { api } from '@/shared/lib/axios'

import type { DocumentTemplateDto, DocumentType } from '../types'

export interface UpsertDocumentTemplatePayload {
  code: string
  name: string
  documentType: DocumentType
  description?: string
  fieldsSchema?: string
  templateFilePath?: string
}

export async function listDocumentTemplates(
  type?: DocumentType,
): Promise<DocumentTemplateDto[]> {
  const { data } = await api.get<DocumentTemplateDto[]>('/document-templates', {
    params: type ? { type } : undefined,
  })
  return data
}

export async function getDocumentTemplateById(
  id: string,
): Promise<DocumentTemplateDto> {
  const { data } = await api.get<DocumentTemplateDto>(`/document-templates/${id}`)
  return data
}

export async function createDocumentTemplate(
  payload: UpsertDocumentTemplatePayload,
): Promise<DocumentTemplateDto> {
  const { data } = await api.post<DocumentTemplateDto>('/document-templates', payload)
  clearTemplateCache()
  return data
}

export async function updateDocumentTemplate(
  id: string,
  payload: UpsertDocumentTemplatePayload,
): Promise<DocumentTemplateDto> {
  const { data } = await api.put<DocumentTemplateDto>(
    `/document-templates/${id}`,
    payload,
  )
  clearTemplateCache()
  return data
}

export async function deleteDocumentTemplate(id: string): Promise<void> {
  await api.delete(`/document-templates/${id}`)
  clearTemplateCache()
}

let templateIdByCode: Map<string, string> | null = null

export async function resolveTemplateId(code: string): Promise<string> {
  if (!templateIdByCode) {
    const templates = await listDocumentTemplates()
    templateIdByCode = new Map(templates.map((t) => [t.code, t.id]))
  }
  const id = templateIdByCode.get(code)
  if (!id) {
    throw new Error(`No se encontró la plantilla "${code}" en el servidor.`)
  }
  return id
}

export function clearTemplateCache() {
  templateIdByCode = null
}
