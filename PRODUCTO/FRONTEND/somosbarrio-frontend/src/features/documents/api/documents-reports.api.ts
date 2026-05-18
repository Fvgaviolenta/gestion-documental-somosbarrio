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
