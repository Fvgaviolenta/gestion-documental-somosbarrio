import { api } from '@/shared/lib/axios'

import type { DocumentTemplateDto, DocumentType } from '../types'

export async function listDocumentTemplates(
  type?: DocumentType,
): Promise<DocumentTemplateDto[]> {
  const { data } = await api.get<DocumentTemplateDto[]>('/document-templates', {
    params: type ? { type } : undefined,
  })
  return data
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
