import { describe, it, expect } from 'vitest'
import {
  calculateDailySubsidy,
  getDailySummary,
  getMonthlySummary,
} from './calculateSubsidy'
import type { PurchaseEntry } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'

const scheme: SchemeSetting = {
  subsidyRate: 0.6,
  dailyCap: 200,
  monthlyCap: 1000,
  totalCap: 4000,
  startDate: '2026-06-01',
  endDate: '2026-09-30',
  currency: 'THB',
  updatedAt: '',
}

function makeEntry(amount: number, createdAt: string, date = '2026-05-30'): PurchaseEntry {
  return {
    id: createdAt,
    date,
    month: date.slice(0, 7),
    amount,
    createdAt,
    updatedAt: createdAt,
  }
}

describe('calculateDailySubsidy', () => {
  it('calculates 60% subsidy for basic purchase', () => {
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 0, 0)
    expect(result[0].subsidyAmount).toBe(60)
    expect(result[0].userPaidAmount).toBe(40)
  })

  it('rounds decimal purchase calculations to two decimals', () => {
    const entries = [makeEntry(10.01, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 0, 0)
    expect(result[0].subsidyAmount).toBe(6.01)
    expect(result[0].userPaidAmount).toBe(4)
  })

  it('caps subsidy at dailyCap', () => {
    // 400 × 0.6 = 240, but dailyCap = 200
    const entries = [makeEntry(400, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 0, 0)
    expect(result[0].subsidyAmount).toBe(200)
    expect(result[0].userPaidAmount).toBe(200)
  })

  it('uses remaining daily cap for subsequent entries', () => {
    // Entry 1: 200 × 0.6 = 120 → remainingDaily = 80
    // Entry 2: 200 × 0.6 = 120, but only 80 remaining → subsidy = 80
    const entries = [
      makeEntry(200, '2026-05-30T09:00:00.000Z'),
      makeEntry(200, '2026-05-30T10:00:00.000Z'),
    ]
    const result = calculateDailySubsidy(entries, scheme, 0, 0)
    expect(result[0].subsidyAmount).toBe(120)
    expect(result[1].subsidyAmount).toBe(80)
    expect(result[1].userPaidAmount).toBe(120)
  })

  it('caps at monthly cap when monthly remaining is lower', () => {
    // monthUsedBefore = 980, monthlyCap = 1000, remaining = 20
    // 100 × 0.6 = 60, but monthlyRemaining = 20
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 980, 980)
    expect(result[0].subsidyAmount).toBe(20)
    expect(result[0].userPaidAmount).toBe(80)
  })

  it('gives zero subsidy when monthly cap exhausted', () => {
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, scheme, 1000, 1000)
    expect(result[0].subsidyAmount).toBe(0)
    expect(result[0].userPaidAmount).toBe(100)
  })

  it('caps at totalCap when it is the binding constraint', () => {
    // totalCap = 4000, totalUsedBefore = 3990, remaining total = 10
    // 100 × 0.6 = 60, but totalRemaining = 10
    const schemeWithTotal = { ...scheme, totalCap: 4000 }
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const result = calculateDailySubsidy(entries, schemeWithTotal, 0, 3990)
    expect(result[0].subsidyAmount).toBe(10)
    expect(result[0].userPaidAmount).toBe(90)
  })
})

describe('getDailySummary', () => {
  it('returns correct totals and remainders', () => {
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0, 0)
    expect(summary.totalAmount).toBe(100)
    expect(summary.totalSubsidy).toBe(60)
    expect(summary.totalUserPaid).toBe(40)
    expect(summary.remainingDaily).toBe(140)
    expect(summary.remainingMonthly).toBe(940)
    expect(summary.remainingTotal).toBe(3940)
  })

  it('calculates toFillDaily correctly', () => {
    // After 100 baht: remainingDaily=140, remainingMonthly=940, remainingTotal=3940
    // min(140, 940, 3940) = 140, rounded up to the next satang.
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0, 0)
    expect(summary.toFillDaily).toBe(233.34)
  })

  it('toFillDaily uses totalCap remaining when it is the binding constraint', () => {
    // totalUsedBefore = 3920, 100 baht → subsidy 60, totalRemaining = 4000-3920-60 = 20
    // min(140, 940, 20) = 20, rounded up to the next satang.
    const entries = [makeEntry(100, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0, 3920)
    expect(summary.toFillDaily).toBe(33.34)
    expect(summary.remainingTotal).toBe(20)
  })

  it('returns toFillDaily = 0 when daily cap exhausted', () => {
    const entries = [makeEntry(400, '2026-05-30T10:00:00.000Z')]
    const summary = getDailySummary(entries, scheme, 0, 0)
    expect(summary.toFillDaily).toBe(0)
    expect(summary.remainingDaily).toBe(0)
  })

  it('sorts entries by createdAt before calculating', () => {
    const entries = [
      makeEntry(200, '2026-05-30T11:00:00.000Z'), // processed 2nd
      makeEntry(200, '2026-05-30T09:00:00.000Z'), // processed 1st
    ]
    const summary = getDailySummary(entries, scheme, 0, 0)
    // First (09:00): 200×0.6=120, remaining daily=80
    // Second (11:00): 200×0.6=120, capped at 80
    expect(summary.totalSubsidy).toBe(200)
  })
})

describe('getMonthlySummary', () => {
  it('aggregates across multiple days respecting running monthly cap', () => {
    // Day 1: 400 baht → subsidy 200 (capped at daily)
    // Day 2: 400 baht → subsidy 200 (capped at daily), monthlyUsed = 400
    // Day 3: 400 baht → subsidy 200, monthlyUsed = 600
    // Day 4: 400 baht → subsidy 200, monthlyUsed = 800
    // Day 5: 400 baht → subsidy 200, monthlyUsed = 1000 (monthly cap hit)
    // Day 6: 400 baht → subsidy 0 (monthly cap exhausted)
    const entries: PurchaseEntry[] = []
    for (let day = 1; day <= 6; day++) {
      const dateStr = `2026-05-${String(day).padStart(2, '0')}`
      entries.push(makeEntry(400, `2026-05-${String(day).padStart(2, '0')}T10:00:00.000Z`, dateStr))
    }
    const summary = getMonthlySummary(entries, scheme)
    expect(summary.totalSubsidy).toBe(1000)
    expect(summary.remainingMonthly).toBe(0)
    expect(summary.totalAmount).toBe(2400)
  })
})
