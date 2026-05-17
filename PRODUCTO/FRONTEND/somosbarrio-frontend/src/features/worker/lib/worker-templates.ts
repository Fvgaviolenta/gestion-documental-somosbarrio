import { resolveTemplateId } from '@/features/documents/api/document-templates.api'

const reportTemplateCode =
  import.meta.env.VITE_TEMPLATE_REPORTE_CODE ?? 'INFORME_TIPO'
const bitacoraTemplateCode =
  import.meta.env.VITE_TEMPLATE_BITACORA_CODE ?? 'INFORME_TIPO'

export async function getReportTemplateId() {
  return resolveTemplateId(reportTemplateCode)
}

export async function getBitacoraTemplateId() {
  return resolveTemplateId(bitacoraTemplateCode)
}
