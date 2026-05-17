import type { MinuteDto, MinuteFormContent } from '../types'

export function buildMinuteContent(fields: MinuteFormContent): string {
  return JSON.stringify(fields)
}

export function parseMinuteContent(content?: string): Partial<MinuteFormContent> | null {
  if (!content) return null
  try {
    return JSON.parse(content) as MinuteFormContent
  } catch {
    return null
  }
}

export function minuteDisplayTitle(minute: MinuteDto): string {
  const parsed = parseMinuteContent(minute.content)
  if (parsed?.numeroActa && parsed?.proyecto) {
    return `Acta ${parsed.numeroActa} — ${parsed.proyecto}`
  }
  return minute.title
}
