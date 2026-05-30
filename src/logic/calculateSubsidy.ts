import type { PurchaseEntry, EnrichedEntry, DailySummary, MonthlySummary } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'
import { roundMoney } from './money'

export function calculateDailySubsidy(
  entries: PurchaseEntry[],
  setting: SchemeSetting,
  monthUsedBefore: number,
  totalUsedBefore: number,
): EnrichedEntry[] {
  let runningDaily = 0
  let runningMonthly = monthUsedBefore
  let runningTotal = totalUsedBefore

  return entries.map((entry) => {
    const remainingDaily = setting.dailyCap - runningDaily
    const remainingMonthly = setting.monthlyCap - runningMonthly
    const remainingTotal = setting.totalCap - runningTotal
    const proportional = entry.amount * setting.subsidyRate
    const subsidyAmount = roundMoney(Math.min(proportional, remainingDaily, remainingMonthly, remainingTotal, entry.amount))
    const userPaidAmount = roundMoney(entry.amount - subsidyAmount)

    runningDaily += subsidyAmount
    runningMonthly += subsidyAmount
    runningTotal += subsidyAmount

    return { ...entry, subsidyAmount, userPaidAmount }
  })
}

export function getDailySummary(
  entries: PurchaseEntry[],
  setting: SchemeSetting,
  monthUsedBefore: number,
  totalUsedBefore: number,
): DailySummary {
  const sorted = [...entries].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const enriched = calculateDailySubsidy(sorted, setting, monthUsedBefore, totalUsedBefore)

  const totalSubsidy = roundMoney(enriched.reduce((sum, e) => sum + e.subsidyAmount, 0))
  const totalAmount = roundMoney(enriched.reduce((sum, e) => sum + e.amount, 0))
  const totalUserPaid = roundMoney(totalAmount - totalSubsidy)

  const remainingDaily = roundMoney(Math.max(0, setting.dailyCap - totalSubsidy))
  const remainingMonthly = roundMoney(Math.max(0, setting.monthlyCap - monthUsedBefore - totalSubsidy))
  const remainingTotal = roundMoney(Math.max(0, setting.totalCap - totalUsedBefore - totalSubsidy))
  const effectiveRemaining = Math.min(remainingDaily, remainingMonthly, remainingTotal)
  const toFillDaily = effectiveRemaining > 0 ? Math.ceil((effectiveRemaining / setting.subsidyRate) * 100) / 100 : 0

  return { totalAmount, totalSubsidy, totalUserPaid, remainingDaily, remainingMonthly, remainingTotal, toFillDaily, entries: enriched }
}

export function getMonthlySummary(
  allMonthEntries: PurchaseEntry[],
  setting: SchemeSetting,
  totalUsedBeforeMonth: number = 0,
): MonthlySummary {
  const byDate = new Map<string, PurchaseEntry[]>()
  for (const entry of allMonthEntries) {
    if (!byDate.has(entry.date)) byDate.set(entry.date, [])
    byDate.get(entry.date)!.push(entry)
  }

  const sortedDates = [...byDate.keys()].sort()
  let runningMonthly = 0
  let runningTotal = totalUsedBeforeMonth
  let totalAmount = 0

  for (const date of sortedDates) {
    const dayEntries = [...byDate.get(date)!].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const enriched = calculateDailySubsidy(dayEntries, setting, runningMonthly, runningTotal)
    for (const e of enriched) {
      runningMonthly += e.subsidyAmount
      runningTotal += e.subsidyAmount
      totalAmount = roundMoney(totalAmount + e.amount)
    }
  }

  const totalSubsidy = roundMoney(runningMonthly)
  const totalUserPaid = roundMoney(totalAmount - totalSubsidy)
  const remainingMonthly = roundMoney(Math.max(0, setting.monthlyCap - totalSubsidy))

  return { totalAmount, totalSubsidy, totalUserPaid, remainingMonthly }
}
