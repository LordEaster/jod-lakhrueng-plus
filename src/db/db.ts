import Dexie, { type Table } from 'dexie'
import type { PurchaseEntry } from '../types/purchase'

type SettingRecord = { key: string; value: unknown }

export class AppDatabase extends Dexie {
  purchases!: Table<PurchaseEntry>
  settings!: Table<SettingRecord>

  constructor() {
    super('jod-lakhrueng-plus')
    this.version(1).stores({
      purchases: 'id, date, month, createdAt',
      settings: 'key',
    })
  }
}

export const db = new AppDatabase()
