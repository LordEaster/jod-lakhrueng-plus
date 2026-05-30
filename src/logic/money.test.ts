import { describe, expect, it } from 'vitest'
import { parseMoneyInput, roundMoney, sanitizeMoneyInput } from './money'

describe('money helpers', () => {
  it('limits typed money input to two decimal places', () => {
    expect(sanitizeMoneyInput('123.456')).toBe('123.45')
    expect(sanitizeMoneyInput('12..34')).toBe('12.34')
    expect(sanitizeMoneyInput('abc1,234.5x6')).toBe('1234.56')
  })

  it('parses positive money input rounded to two decimals', () => {
    expect(parseMoneyInput('10.235')).toBe(10.24)
    expect(parseMoneyInput('0')).toBeUndefined()
    expect(parseMoneyInput('')).toBeUndefined()
  })

  it('rounds common floating point money results', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3)
  })
})
