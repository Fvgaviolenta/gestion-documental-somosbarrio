import { describe, expect, it } from 'vitest'

import { formatDate, formatDateOnly } from './formatters'

describe('formatDate', () => {
  it('returns em dash for empty input', () => {
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('returns em dash for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('formats a valid ISO date in es-CL', () => {
    const formatted = formatDate('2025-06-14T15:30:00.000Z')
    expect(formatted).toMatch(/2025/)
    expect(formatted).not.toBe('—')
  })
})

describe('formatDateOnly', () => {
  it('returns em dash for empty input', () => {
    expect(formatDateOnly(undefined)).toBe('—')
  })

  it('converts YYYY-MM-DD to DD-MM-YYYY', () => {
    expect(formatDateOnly('2025-06-14T10:00:00.000Z')).toBe('14-06-2025')
  })
})
