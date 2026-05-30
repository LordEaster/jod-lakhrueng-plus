import { describe, it, expect } from 'vitest'
import {
  toBuddhistYear,
  formatThaiDate,
  formatThaiMonth,
  formatAmount,
  dateToMonth,
} from './formatThai'

describe('toBuddhistYear', () => {
  it('converts CE year to Buddhist Era', () => {
    expect(toBuddhistYear(2026)).toBe(2569)
    expect(toBuddhistYear(2000)).toBe(2543)
  })
})

describe('formatThaiDate', () => {
  it('formats date in Thai with พ.ศ. year', () => {
    expect(formatThaiDate('2026-05-30')).toBe('30 พ.ค. 2569')
  })

  it('formats January correctly', () => {
    expect(formatThaiDate('2026-01-01')).toBe('1 ม.ค. 2569')
  })

  it('formats December correctly', () => {
    expect(formatThaiDate('2026-12-31')).toBe('31 ธ.ค. 2569')
  })
})

describe('formatThaiMonth', () => {
  it('formats month in Thai with พ.ศ. year', () => {
    expect(formatThaiMonth('2026-05')).toBe('พ.ค. 2569')
  })
})

describe('formatAmount', () => {
  it('formats numbers with thousand separator', () => {
    expect(formatAmount(1234)).toBe('1,234')
    expect(formatAmount(200)).toBe('200')
  })

  it('formats decimal amounts with up to two decimal places', () => {
    expect(formatAmount(1234.5)).toBe('1,234.5')
    expect(formatAmount(1234.567)).toBe('1,234.57')
  })
})

describe('dateToMonth', () => {
  it('extracts month key from date key', () => {
    expect(dateToMonth('2026-05-30')).toBe('2026-05')
  })
})
