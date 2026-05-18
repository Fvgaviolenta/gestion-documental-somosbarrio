import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  approveDocument,
  createDocument,
  deleteDocument,
  deleteDocumentAttachment,
  downloadDocumentAttachment,
  downloadDocumentPdf,
  downloadDocumentPreviewDocx,
  getDocument,
  listDocuments,
  reopenDocument,
  rejectDocument,
  submitDocumentReview,
  updateDocument,
  uploadDocumentAttachment,
} from '@/features/documents/api/documents.api'
import type {
  CreateDocumentPayload,
  DocumentStatus,
  RejectDocumentPayload,
  UpdateDocumentPayload,
} from '@/features/documents/types'

export const documentKeys = {
  all: ['documents'] as const,
  list: (filter: {
    status?: DocumentStatus
    page?: number
    activityId?: string
    size?: number
  }) => ['documents', 'list', filter] as const,
  detail: (id: string) => ['documents', id] as const,
}

export function useDocumentsList(
  filter: {
    status?: DocumentStatus
    page?: number
    activityId?: string
    size?: number
  } = {},
) {
  return useQuery({
    queryKey: documentKeys.list(filter),
    queryFn: () =>
      listDocuments({
        page: filter.page ?? 0,
        size: filter.size ?? 20,
        status: filter.status,
        activityId: filter.activityId,
      }),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => getDocument(id),
    enabled: Boolean(id),
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDocumentPayload) => createDocument(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useUpdateDocument(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateDocumentPayload) => updateDocument(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
      void qc.invalidateQueries({ queryKey: documentKeys.detail(id) })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
    },
  })
}

export function useSubmitDocumentReview(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => submitDocumentReview(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
      void qc.invalidateQueries({ queryKey: documentKeys.detail(id) })
    },
  })
}

export function useApproveDocument(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => approveDocument(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
      void qc.invalidateQueries({ queryKey: documentKeys.detail(id) })
    },
  })
}

export function useRejectDocument(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: RejectDocumentPayload) => rejectDocument(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
      void qc.invalidateQueries({ queryKey: documentKeys.detail(id) })
    },
  })
}

export function useUploadDocumentAttachment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => uploadDocumentAttachment(id, file),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.detail(id) })
    },
  })
}

export function useDeleteDocumentAttachment(documentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attachmentId: string) => deleteDocumentAttachment(documentId, attachmentId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.detail(documentId) })
    },
  })
}

export function useReopenDocument(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => reopenDocument(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: documentKeys.all })
      void qc.invalidateQueries({ queryKey: documentKeys.detail(id) })
    },
  })
}

export function useDownloadDocumentPdf() {
  return useMutation({
    mutationFn: (documentId: string) => downloadDocumentPdf(documentId),
  })
}

export function useDownloadDocumentPreviewDocx() {
  return useMutation({
    mutationFn: (documentId: string) => downloadDocumentPreviewDocx(documentId),
  })
}

export function useDownloadDocumentAttachment() {
  return useMutation({
    mutationFn: ({
      documentId,
      attachmentId,
      filename,
    }: {
      documentId: string
      attachmentId: string
      filename: string
    }) => downloadDocumentAttachment(documentId, attachmentId, filename),
  })
}
