import { api } from '@/shared/lib/axios'
import type { PagedResponse } from '@/shared/types/api'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'EMAIL_SENT'
  | 'PDF_GENERATED'
  | 'REPORT_GENERATED'

export interface AuditLogDto {
  id: number
  userId?: string
  action: AuditAction
  entityType?: string
  entityId?: string
  beforeData?: string
  afterData?: string
  ipAddress?: string
  correlationId?: string
  createdAt?: string
}

export interface AuditLogFilter {
  entityType?: string
  entityId?: string
  userId?: string
  action?: AuditAction
  page?: number
  size?: number
}

export async function getAuditLogs(
  filter: AuditLogFilter,
): Promise<PagedResponse<AuditLogDto>> {
  const { data } = await api.get<PagedResponse<AuditLogDto>>('/audit-logs', {
    params: {
      page: filter.page ?? 0,
      size: filter.size ?? 25,
      entityType: filter.entityType || undefined,
      entityId: filter.entityId || undefined,
      userId: filter.userId || undefined,
      action: filter.action || undefined,
      sort: 'createdAt,desc',
    },
  })
  return data
}
