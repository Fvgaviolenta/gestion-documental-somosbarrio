import { api } from '@/shared/lib/axios'

export type EmailStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface EmailLogDto {
  id: string
  documentId: string
  recipientGroupId?: string
  recipientGroupName?: string
  toAddresses: string
  subject?: string
  status: EmailStatus
  errorMessage?: string
  sentBy?: string
  sentByName?: string
  sentAt?: string
}

export interface SendDocumentPayload {
  recipientGroupId?: string
  additionalEmails?: string[]
  subject?: string
  body?: string
}

export interface SendDocumentResponse {
  emailLogId: string
  status: EmailStatus
  message?: string
}

export async function sendDocumentByEmail(
  documentId: string,
  payload: SendDocumentPayload,
): Promise<SendDocumentResponse> {
  const { data } = await api.post<SendDocumentResponse>(
    `/documents/${documentId}/send`,
    payload,
  )
  return data
}

export async function getDocumentEmailLogs(
  documentId: string,
): Promise<EmailLogDto[]> {
  const { data } = await api.get<EmailLogDto[]>(`/documents/${documentId}/email-logs`)
  return data
}
