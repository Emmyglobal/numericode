import { describe, it, expect } from 'vitest'
import { formatDuration } from '@/utils/formatDuration'

describe('formatDuration', () => {
  it('formats minutes less than 60 as "Xm"', () => {
    expect(formatDuration(30)).toBe('30m')
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(1)).toBe('1m')
  })

  it('formats exactly 60 minutes as "1h"', () => {
    expect(formatDuration(60)).toBe('1h')
  })

  it('formats 90 minutes as "1h 30m"', () => {
    expect(formatDuration(90)).toBe('1h 30m')
  })

  it('formats 120 minutes as "2h"', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats 150 minutes as "2h 30m"', () => {
    expect(formatDuration(150)).toBe('2h 30m')
  })

  it('formats 0 minutes as "0m"', () => {
    expect(formatDuration(0)).toBe('0m')
  })
})
