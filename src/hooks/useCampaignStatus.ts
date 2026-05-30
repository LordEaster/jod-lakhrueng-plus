import { useSchemeSetting } from './useSettings'
import { todayKey } from '../logic/formatThai'

export type CampaignStatus = 'before' | 'active' | 'after' | 'unrestricted'

export function useCampaignStatus(): { status: CampaignStatus; startDate?: string; endDate?: string } {
  const scheme = useSchemeSetting()
  const today = todayKey()

  if (!scheme.startDate && !scheme.endDate) return { status: 'unrestricted' }

  if (scheme.startDate && today < scheme.startDate) {
    return { status: 'before', startDate: scheme.startDate }
  }
  if (scheme.endDate && today > scheme.endDate) {
    return { status: 'after', endDate: scheme.endDate }
  }
  return { status: 'active', startDate: scheme.startDate, endDate: scheme.endDate }
}
