import { api } from '@/shared/lib/axios'
import { downloadBlob, filenameFromContentDisposition } from '@/shared/lib/download'

export async function downloadDocumentsExcelReport(from: string, to: string): Promise<void> {
  const response = await api.get<Blob>('/reports/documents', {
    params: { from, to },
    responseType: 'blob',
  })
  const filename = filenameFromContentDisposition(
    response.headers['content-disposition'] as string | undefined,
    `reporte_documentos_${from}_${to}.xlsx`,
  )
  downloadBlob(response.data, filename)
}

export async function downloadActivitiesExcelReport(
  year: number,
  month: number,
): Promise<void> {
  const response = await api.get<Blob>('/reports/activities', {
    params: { year, month },
    responseType: 'blob',
  })
  const filename = filenameFromContentDisposition(
    response.headers['content-disposition'] as string | undefined,
    `reporte_actividades_${year}_${String(month).padStart(2, '0')}.xlsx`,
  )
  downloadBlob(response.data, filename)
}
