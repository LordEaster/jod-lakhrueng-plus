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
    const entries = await db.purchases.where('month').equals(targetMonth).toArray()
    return getMonthlySummary(entries, scheme)
  }, [scheme.subsidyRate, scheme.monthlyCap, month])
}
