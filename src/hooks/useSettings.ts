import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { SchemeSetting, AppSetting } from '../types/setting'
import { DEFAULT_SCHEME, DEFAULT_APP } from '../types/setting'

export function useSchemeSetting(): SchemeSetting {
  return useLiveQuery(async () => {
    const record = await db.settings.get('scheme')
    return (record?.value as SchemeSetting) ?? { ...DEFAULT_SCHEME, updatedAt: new Date().toISOString() }
  }) ?? { ...DEFAULT_SCHEME, updatedAt: '' }
}

export function useAppSetting(): AppSetting {
  return useLiveQuery(async () => {
    const record = await db.settings.get('app')
    return (record?.value as AppSetting) ?? { ...DEFAULT_APP, updatedAt: new Date().toISOString() }
  }) ?? { ...DEFAULT_APP, updatedAt: '' }
}
