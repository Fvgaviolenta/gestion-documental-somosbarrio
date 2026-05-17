import { createDocumentWithAttachments } from '@/features/documents/api/documents.api'
import { buildReporteFieldValues } from '@/features/worker/lib/document-field-values'
import { getReportTemplateId } from '@/features/worker/lib/worker-templates'

interface WorkerReportPayload {
  title: string
  description: string
  photos: File[]
  activityId?: string
}

export async function createWorkerReport(payload: WorkerReportPayload): Promise<string> {
  const templateId = await getReportTemplateId()
  const document = await createDocumentWithAttachments(
    {
      templateId,
      activityId: payload.activityId,
      title: payload.title,
      fieldValues: buildReporteFieldValues(payload.description),
    },
    payload.photos,
  )
  return document.id
}
