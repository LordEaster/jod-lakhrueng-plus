export type PurchaseCategory = 'food' | 'drink' | 'household' | 'medicine' | 'other'

export const CATEGORY_LABELS: Record<PurchaseCategory, string> = {
  food: 'อาหาร',
  drink: 'เครื่องดื่ม',
  household: 'ของใช้ในบ้าน',
  medicine: 'ยาและสุขภาพ',
  other: 'อื่นๆ',
}

export type PurchaseEntry = {
  id: string
  date: string        // "2026-05-30" CE — used for daily queries
  month: string       // "2026-05" CE — used for monthly queries
  amount: number      // raw purchase amount; subsidy computed on-the-fly
  title?: string
  category?: PurchaseCategory
  note?: string
  createdAt: string   // ISO timestamp — used to order entries for cap calculation
  updatedAt: string
}

export type EnrichedEntry = PurchaseEntry & {
  subsidyAmount: number
  userPaidAmount: number
}

export type DailySummary = {
  totalAmount: number
  totalSubsidy: number
  totalUserPaid: number
  remainingDaily: number
  remainingMonthly: number
  remainingTotal: number   // remaining over entire campaign lifetime
  toFillDaily: number      // amount to buy to max out today's subsidy
  entries: EnrichedEntry[]
}

export type MonthlySummary = {
  totalAmount: number
  totalSubsidy: number
  totalUserPaid: number
  remainingMonthly: number
}
