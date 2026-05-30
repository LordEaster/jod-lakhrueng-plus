import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { getDailySummary, getMonthlySummary } from '../logic/calculateSubsidy'
import { todayKey, thisMonthKey } from '../logic/formatThai'
import type { SchemeSetting } from '../types/setting'
import type { DailySummary } from '../types/purchase'

export function useDailySummary(scheme: SchemeSetting): DailySummary | undefined {
  return useLiveQuery(async () => {
    const today = todayKey()
    const thisMonth = thisMonthKey()

    // All purchases this month + all purchases before this month (for totalCap)
    const [dayEntries, allMonthEntries, allPriorEntries] = await Promise.all([
      db.purchases.where('date').equals(today).toArray(),
      db.purchases.where('month').equals(thisMonth).toArray(),
      scheme.startDate
        ? db.purchases.where('month').below(thisMonth).toArray()
        : Promise.resolve([]),
    ])

    // totalSubsidy from all months before this month
    const { totalSubsidy: prevMonthsTotal } = getMonthlySummary(allPriorEntries, scheme, 0)

    // monthUsedBefore = subsidy from prior days within this month
    const priorDayEntries = allMonthEntries.filter((e) => e.date < today)
    const { totalSubsidy: monthUsedBefore } = getMonthlySummary(priorDayEntries, scheme, prevMonthsTotal)

    const totalUsedBefore = prevMonthsTotal + monthUsedBefore

    return getDailySummary(dayEntries, scheme, monthUsedBefore, totalUsedBefore)
  }, [scheme.subsidyRate, scheme.dailyCap, scheme.monthlyCap, scheme.totalCap])
}
