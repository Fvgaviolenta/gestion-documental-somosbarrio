import { api } from '@/shared/lib/axios'
import { downloadBlob, filenameFromContentDisposition } from '@/shared/lib/download'
import type { PagedResponse } from '@/shared/types/api'

import type {
  CreateDocumentPayload,
  DocumentAttachmentDto,
  DocumentDto,
  DocumentStatus,
  RejectDocumentPayload,
  UpdateDocumentPayload,
} from '../types'

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

export async function getDocument(id: string): Promise<DocumentDto> {
  const { data } = await api.get<DocumentDto>(`/documents/${id}`)
  return data
}

export async function createDocument(payload: CreateDocumentPayload): Promise<DocumentDto> {
  const { data } = await api.post<DocumentDto>('/documents', payload)
  return data
}

export async function updateDocument(
  id: string,
  payload: UpdateDocumentPayload,
): Promise<DocumentDto> {
  const { data } = await api.put<DocumentDto>(`/documents/${id}`, payload)
  return data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`)
}

export async function submitDocumentReview(id: string): Promise<DocumentDto> {
  const { data } = await api.patch<DocumentDto>(`/documents/${id}/submit-review`)
  return data
}

export async function reopenDocument(id: string): Promise<DocumentDto> {
  const { data } = await api.patch<DocumentDto>(`/documents/${id}/reopen`)
  return data
}

export async function approveDocument(id: string): Promise<DocumentDto> {
  const { data } = await api.patch<DocumentDto>(`/documents/${id}/approve`)
  return data
}

export async function rejectDocument(
  id: string,
  payload: RejectDocumentPayload,
): Promise<DocumentDto> {
  const { data } = await api.patch<DocumentDto>(`/documents/${id}/reject`, payload)
  return data
}

export async function uploadDocumentAttachment(
  documentId: string,
  file: File,
): Promise<DocumentAttachmentDto> {
  const formData = new FormData()
  formData.append('file', file, file.name)
  const { data } = await api.post<DocumentAttachmentDto>(
    `/documents/${documentId}/attachments`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

export async function downloadDocumentAttachment(
  documentId: string,
  attachmentId: string,
  fallbackName: string,
): Promise<void> {
  const response = await api.get<Blob>(
    `/documents/${documentId}/attachments/${attachmentId}`,
    { responseType: 'blob' },
  )
  const filename = filenameFromContentDisposition(
    response.headers['content-disposition'] as string | undefined,
    fallbackName,
  )
  downloadBlob(response.data, filename)
}

export async function deleteDocumentAttachment(
  documentId: string,
  attachmentId: string,
): Promise<void> {
  await api.delete(`/documents/${documentId}/attachments/${attachmentId}`)
}

export async function downloadDocumentPdf(documentId: string): Promise<void> {
  const response = await api.get<Blob>(`/documents/${documentId}/pdf`, {
    responseType: 'blob',
  })
  const filename = filenameFromContentDisposition(
    response.headers['content-disposition'] as string | undefined,
    `documento_${documentId}.pdf`,
  )
  downloadBlob(response.data, filename)
}

export async function downloadDocumentPreviewDocx(documentId: string): Promise<void> {
  const response = await api.post<Blob>(
    `/documents/${documentId}/preview-docx`,
    null,
    { responseType: 'blob' },
  )
  const filename = filenameFromContentDisposition(
    response.headers['content-disposition'] as string | undefined,
    `vista_previa_${documentId}.docx`,
  )
  downloadBlob(response.data, filename)
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
