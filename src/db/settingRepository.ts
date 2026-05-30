import { db } from './db'
import type { SchemeSetting, AppSetting } from '../types/setting'
import { DEFAULT_SCHEME, DEFAULT_APP } from '../types/setting'

export async function getSchemeSetting(): Promise<SchemeSetting> {
  const record = await db.settings.get('scheme')
  return (record?.value as SchemeSetting) ?? { ...DEFAULT_SCHEME, updatedAt: new Date().toISOString() }
}

export async function saveSchemeSetting(setting: Omit<SchemeSetting, 'updatedAt'>): Promise<void> {
  await db.settings.put({ key: 'scheme', value: { ...setting, updatedAt: new Date().toISOString() } })
}

export async function getAppSetting(): Promise<AppSetting> {
  const record = await db.settings.get('app')
  return (record?.value as AppSetting) ?? { ...DEFAULT_APP, updatedAt: new Date().toISOString() }
}

export async function saveAppSetting(setting: Omit<AppSetting, 'updatedAt'>): Promise<void> {
  await db.settings.put({ key: 'app', value: { ...setting, updatedAt: new Date().toISOString() } })
}
