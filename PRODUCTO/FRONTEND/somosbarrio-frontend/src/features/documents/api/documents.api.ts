import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'

import type { CreateDocumentPayload, DocumentDto, DocumentStatus } from '../types'

export async function listDocuments(params?: {
  page?: number
  size?: number
  activityId?: string
  status?: DocumentStatus
}): Promise<PagedResponse<DocumentDto>> {
  const { data } = await api.get<PagedResponse<DocumentDto>>('/documents', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 50,
      activityId: params?.activityId,
      status: params?.status,
      sort: 'createdAt,desc',
    },
  })
  return data
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDto> {
  const { data } = await api.post<DocumentDto>('/documents', payload)
  return data
}

export async function uploadDocumentAttachment(
  documentId: string,
  file: File,
): Promise<void> {
  const formData = new FormData()
  formData.append('file', file, file.name)
  await api.post(`/documents/${documentId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function createDocumentWithAttachments(
  payload: CreateDocumentPayload,
  files: File[],
): Promise<DocumentDto> {
  const document = await createDocument(payload)
  for (const file of files) {
    await uploadDocumentAttachment(document.id, file)
  }
  return document
}
