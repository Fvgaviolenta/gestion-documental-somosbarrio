import {
  DOCUMENT_KIND,
  type BitacoraFieldValues,
  type DocumentDto,
  type DocumentKind,
  type ReporteRapidoFieldValues,
} from '@/features/documents/types'

export function parseDocumentKind(fieldValues?: string): DocumentKind | null {
  if (!fieldValues) return null
  try {
    const parsed = JSON.parse(fieldValues) as { kind?: string }
    if (parsed.kind === DOCUMENT_KIND.BITACORA) return DOCUMENT_KIND.BITACORA
    if (parsed.kind === DOCUMENT_KIND.REPORTE_RAPIDO) return DOCUMENT_KIND.REPORTE_RAPIDO
    return null
  } catch {
    return null
  }
}

export function parseBitacoraFieldValues(fieldValues?: string): BitacoraFieldValues | null {
  if (!fieldValues) return null
  try {
    const parsed = JSON.parse(fieldValues) as BitacoraFieldValues
    if (parsed.kind !== DOCUMENT_KIND.BITACORA) return null
    return parsed
  } catch {
    return null
  }
}

export function isBitacoraDocument(doc: DocumentDto) {
  return parseDocumentKind(doc.fieldValues) === DOCUMENT_KIND.BITACORA
}

export function buildBitacoraFieldValues(input: {
  date: string
  relevantEvent: string
  territory: string
  team: string
  description: string
}): string {
  const payload: BitacoraFieldValues = {
    kind: DOCUMENT_KIND.BITACORA,
    date: input.date,
    relevantEvent: input.relevantEvent,
    territory: input.territory,
    team: input.team,
    description: input.description,
  }
  return JSON.stringify(payload)
}

export function buildReporteFieldValues(description: string): string {
  const payload: ReporteRapidoFieldValues = {
    kind: DOCUMENT_KIND.REPORTE_RAPIDO,
    description,
  }
  return JSON.stringify(payload)
}
