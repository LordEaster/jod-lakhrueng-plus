import { nanoid } from 'nanoid'
import { db } from './db'
import type { PurchaseEntry } from '../types/purchase'
import { todayKey, dateToMonth } from '../logic/formatThai'

type NewPurchase = Omit<PurchaseEntry, 'id' | 'date' | 'month' | 'createdAt' | 'updatedAt'> & {
  date?: string
}

export async function addPurchase(data: NewPurchase): Promise<PurchaseEntry> {
  const now = new Date().toISOString()
  const date = data.date ?? todayKey()
  const entry: PurchaseEntry = {
    ...data,
    id: nanoid(),
    date,
    month: dateToMonth(date),
    createdAt: now,
    updatedAt: now,
  }
  await db.purchases.add(entry)
  return entry
}

export async function getPurchasesByDate(date: string): Promise<PurchaseEntry[]> {
  return db.purchases.where('date').equals(date).toArray()
}

export async function getPurchasesByMonth(month: string): Promise<PurchaseEntry[]> {
  return db.purchases.where('month').equals(month).toArray()
}

export async function getRecentPurchases(limit: number): Promise<PurchaseEntry[]> {
  return db.purchases.orderBy('createdAt').reverse().limit(limit).toArray()
}

export async function updatePurchase(
  id: string,
  data: Partial<Omit<PurchaseEntry, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.purchases.update(id, { ...data, updatedAt: new Date().toISOString() })
}

export async function deletePurchase(id: string): Promise<void> {
  await db.purchases.delete(id)
}

export async function getAllPurchases(): Promise<PurchaseEntry[]> {
  return db.purchases.orderBy('createdAt').toArray()
}

export async function clearAllPurchases(): Promise<void> {
  await db.purchases.clear()
}
