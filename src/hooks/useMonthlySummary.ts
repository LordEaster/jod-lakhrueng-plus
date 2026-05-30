import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { getMonthlySummary } from '../logic/calculateSubsidy'
import { thisMonthKey } from '../logic/formatThai'
import type { SchemeSetting } from '../types/setting'
import type { MonthlySummary } from '../types/purchase'

export function useMonthlySummary(
  scheme: SchemeSetting,
  month?: string,
): MonthlySummary | undefined {
  return useLiveQuery(async () => {
    const targetMonth = month ?? thisMonthKey()
    const [entries, priorEntries] = await Promise.all([
      db.purchases.where('month').equals(targetMonth).toArray(),
      scheme.startDate
        ? db.purchases.where('month').below(targetMonth).toArray()
        : Promise.resolve([]),
    ])
    const { totalSubsidy: totalUsedBeforeMonth } = getMonthlySummary(priorEntries, scheme, 0)
    return getMonthlySummary(entries, scheme, totalUsedBeforeMonth)
  }, [scheme.subsidyRate, scheme.monthlyCap, scheme.totalCap, month])
}
