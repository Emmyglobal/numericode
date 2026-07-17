import { describe, it, expect } from 'vitest'
import { formatDate, formatTime, formatDateTime } from '@/utils/formatDate'

describe('formatDate', () => {
  it('formats an ISO date string to readable format', () => {
    const result = formatDate('2026-07-04')
    expect(result).toMatch(/4 Jul 2026/)
  })

  it('handles full ISO datetime string', () => {
    const result = formatDate('2026-01-15T10:00:00')
    expect(result).toMatch(/15 Jan 2026/)
  })
})

describe('formatTime', () => {
  it('formats time in HH:MM format', () => {
    const result = formatTime('2026-07-04T14:30:00')
    expect(result).toMatch(/14:30/)
  })

  it('formats midnight correctly', () => {
    const result = formatTime('2026-07-04T00:00:00')
    expect(result).toMatch(/00:00/)
  })
})

describe('formatDateTime', () => {
  it('combines date and time with "at" separator', () => {
    const result = formatDateTime('2026-07-04T14:30:00')
    expect(result).toContain(' at ')
    expect(result).toMatch(/Jul 2026/)
  })
})
