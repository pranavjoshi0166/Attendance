import { describe, it, expect } from 'vitest'
import { localDateString } from '@/lib/utils'

describe('localDateString', () => {
  it('formats local date as YYYY-MM-DD', () => {
    const d = new Date(2025, 0, 9)
    expect(localDateString(d)).toBe('2025-01-09')
  })
})