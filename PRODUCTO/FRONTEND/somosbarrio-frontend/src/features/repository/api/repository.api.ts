import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'
import type { DocumentStatus, DocumentType } from '@/features/documents/types'

export interface DocumentSummaryDto {
  id: string
  code?: string
  title: string
  documentType: DocumentType
  status: DocumentStatus
  activityId?: string
  activityTitle?: string
  createdById?: string
  createdByName?: string
  createdAt?: string
  approvedAt?: string
}

export interface RepositorySearchParams {
  q?: string
  type?: DocumentType
  status?: DocumentStatus
  from?: string
  to?: string
  authorId?: string
  activityId?: string
  code?: string
  belongsToMe?: boolean
  page?: number
  size?: number
}

export async function searchRepositoryDocuments(
  params: RepositorySearchParams,
): Promise<PagedResponse<DocumentSummaryDto>> {
  const { data } = await api.get<PagedResponse<DocumentSummaryDto>>(
    '/repository/documents',
    {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        q: params.q || undefined,
        type: params.type || undefined,
        status: params.status || undefined,
        from: params.from || undefined,
        to: params.to || undefined,
        authorId: params.authorId || undefined,
        activityId: params.activityId || undefined,
        code: params.code || undefined,
        belongsToMe: params.belongsToMe,
        sort: 'createdAt,desc',
      },
    },
  )
  return data
}
