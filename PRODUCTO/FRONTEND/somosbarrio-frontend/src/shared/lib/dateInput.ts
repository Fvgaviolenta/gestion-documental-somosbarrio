const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const DISPLAY_DATE = /^(\d{2})-(\d{2})-(\d{4})$/

/** YYYY-MM-DD → DD-MM-YYYY */
export function isoToDisplay(iso: string): string {
  if (!iso) return ''
  const match = ISO_DATE.exec(iso.trim())
  if (!match) return iso
  const [, yyyy, mm, dd] = match
  return `${dd}-${mm}-${yyyy}`
}

/** DD-MM-YYYY → YYYY-MM-DD (null si inválida) */
export function displayToIso(display: string): string | null {
  const match = DISPLAY_DATE.exec(display.trim())
  if (!match) return null

  const [, dd, mm, yyyy] = match
  const day = Number(dd)
  const month = Number(mm)
  const year = Number(yyyy)

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 9999) {
    return null
  }

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return `${yyyy}-${mm}-${dd}`
}

/** Aplica máscara DD-MM-YYYY mientras el usuario escribe */
export function formatDateMask(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
}

export function isValidDisplayDate(display: string): boolean {
  return displayToIso(display) !== null
}

/** Muestra fechas almacenadas en ISO; si ya vienen en DD-MM-YYYY, las deja igual */
export function formatStoredDateForDisplay(value: string | undefined): string {
  if (!value) return '—'
  if (DISPLAY_DATE.test(value.trim())) return value.trim()
  const display = isoToDisplay(value)
  return display || value
}
