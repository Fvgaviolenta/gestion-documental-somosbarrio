import type { TemplateFieldDefinition } from '../types'

export function parseTemplateFields(schemaJson?: string): TemplateFieldDefinition[] {
  if (!schemaJson) return []
  try {
    const parsed = JSON.parse(schemaJson) as { fields?: TemplateFieldDefinition[] }
    return Array.isArray(parsed.fields) ? parsed.fields : []
  } catch {
    return []
  }
}

export function parseFieldValuesJson(fieldValues?: string): Record<string, string> {
  if (!fieldValues) return {}
  try {
    const parsed = JSON.parse(fieldValues) as Record<string, unknown>
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (value == null) continue
      if (typeof value === 'string') result[key] = value
      else result[key] = String(value)
    }
    return result
  } catch {
    return {}
  }
}

/** YYYY-MM-DD → DD-MM-YYYY para mostrar */
export function formatFieldDateDisplay(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!match) return value
  const [, yyyy, mm, dd] = match
  return `${dd}-${mm}-${yyyy}`
}

export function buildFieldValuesJson(values: Record<string, string>): string | undefined {
  const cleaned = Object.fromEntries(
    Object.entries(values).filter(([, v]) => v.trim().length > 0),
  )
  return Object.keys(cleaned).length > 0 ? JSON.stringify(cleaned) : undefined
}

/** Campos de plantilla reservados para UUID de adjuntos imagen (${IMG:clave}). */
export function isImageUuidFieldKey(key: string): boolean {
  return key.endsWith('_uuid')
}

export function listImageUuidFieldKeys(fields: TemplateFieldDefinition[]): string[] {
  return fields.filter((f) => isImageUuidFieldKey(f.key)).map((f) => f.key)
}

export function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return /\.(jpe?g|png|gif|webp|bmp)$/i.test(file.name)
}

/** Asigna el id del adjunto al primer campo *_uuid vacío (orden del schema). */
export function assignImageAttachmentToFields(
  fieldValues: Record<string, string>,
  attachmentId: string,
  imageFieldKeys: string[],
): Record<string, string> {
  for (const key of imageFieldKeys) {
    if (!fieldValues[key]?.trim()) {
      return { ...fieldValues, [key]: attachmentId }
    }
  }
  return fieldValues
}
