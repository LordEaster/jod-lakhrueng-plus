import type { SheetData } from 'write-excel-file/browser'
import { nanoid } from 'nanoid'
import { calculateDailySubsidy } from './calculateSubsidy'
import { dateToMonth } from './formatThai'
import { roundMoney } from './money'
import { CATEGORY_LABELS, type PurchaseCategory, type PurchaseEntry } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'

const EXPORT_HEADERS = [
  'ID',
  'วันที่',
  'เดือน',
  'รายการ',
  'หมวดหมู่',
  'รหัสหมวดหมู่',
  'ยอดซื้อ',
  'รัฐช่วย',
  'จ่ายเอง',
  'หมายเหตุ',
  'สร้างเมื่อ',
  'แก้ไขเมื่อ',
] as const

const CATEGORY_BY_LABEL = Object.fromEntries(
  Object.entries(CATEGORY_LABELS).map(([key, label]) => [label, key]),
) as Record<string, PurchaseCategory>

type PortableRow = {
  id: string
  date: string
  month: string
  title: string
  categoryLabel: string
  categoryCode: string
  amount: number
  subsidyAmount: number
  userPaidAmount: number
  note: string
  createdAt: string
  updatedAt: string
}

export type ImportFileErrorCode =
  | 'unsupported-file-type'
  | 'unreadable-file'
  | 'invalid-csv'
  | 'invalid-row'

export class ImportFileError extends Error {
  constructor(
    readonly code: ImportFileErrorCode,
    readonly rowNumber?: number,
  ) {
    super(code)
    this.name = 'ImportFileError'
  }
}

export async function createPurchasesXlsxBlob(purchases: PurchaseEntry[], scheme: SchemeSetting): Promise<Blob> {
  const { default: writeXlsxFile } = await import('write-excel-file/browser')
  const data: SheetData = [
    EXPORT_HEADERS.map((header) => ({ value: header, fontWeight: 'bold' })),
    ...toPortableRows(purchases, scheme).map((row) => [
      row.id,
      row.date,
      row.month,
      row.title,
      row.categoryLabel,
      row.categoryCode,
      row.amount,
      row.subsidyAmount,
      row.userPaidAmount,
      row.note,
      row.createdAt,
      row.updatedAt,
    ]),
  ]

  return writeXlsxFile(data, { sheet: 'รายการใช้จ่าย' }).toBlob()
}

export function createPurchasesCsv(purchases: PurchaseEntry[], scheme: SchemeSetting): string {
  const rows = toPortableRows(purchases, scheme).map((row) => [
    row.id,
    row.date,
    row.month,
    row.title,
    row.categoryLabel,
    row.categoryCode,
    row.amount,
    row.subsidyAmount,
    row.userPaidAmount,
    row.note,
    row.createdAt,
    row.updatedAt,
  ])
  return [EXPORT_HEADERS, ...rows].map((row) => row.map(toCsvCell).join(',')).join('\r\n')
}

export async function parsePurchasesFile(file: File): Promise<PurchaseEntry[]> {
  const fileName = file.name.toLowerCase()
  if (fileName.endsWith('.csv')) {
    return parsePurchasesRows(parseCsv(await readTextFile(file)))
  }
  if (fileName.endsWith('.xlsx')) {
    try {
      const { default: readXlsxFile } = await import('read-excel-file/browser')
      const sheets = await readXlsxFile(file)
      return parsePurchasesRows(sheets[0]?.data ?? [])
    } catch {
      throw new ImportFileError('unreadable-file')
    }
  }
  throw new ImportFileError('unsupported-file-type')
}

async function readTextFile(file: File): Promise<string> {
  try {
    return await file.text()
  } catch {
    throw new ImportFileError('unreadable-file')
  }
}

function toPortableRows(purchases: PurchaseEntry[], scheme: SchemeSetting): PortableRow[] {
  const sorted = [...purchases].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date)
    return byDate === 0 ? a.createdAt.localeCompare(b.createdAt) : byDate
  })
  const byDate = new Map<string, PurchaseEntry[]>()
  for (const purchase of sorted) {
    if (!byDate.has(purchase.date)) byDate.set(purchase.date, [])
    byDate.get(purchase.date)!.push(purchase)
  }

  let runningMonthly = 0
  let runningTotal = 0
  let currentMonth = ''
  const rows: PortableRow[] = []

  for (const entries of byDate.values()) {
    const month = entries[0]?.month
    if (month && month !== currentMonth) {
      runningMonthly = 0
      currentMonth = month
    }
    const enriched = calculateDailySubsidy(entries, scheme, runningMonthly, runningTotal)

    for (const entry of enriched) {
      runningMonthly += entry.subsidyAmount
      runningTotal += entry.subsidyAmount
      rows.push({
        id: entry.id,
        date: entry.date,
        month: entry.month,
        title: entry.title ?? '',
        categoryLabel: entry.category ? CATEGORY_LABELS[entry.category] : '',
        categoryCode: entry.category ?? '',
        amount: entry.amount,
        subsidyAmount: entry.subsidyAmount,
        userPaidAmount: entry.userPaidAmount,
        note: entry.note ?? '',
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })
    }
  }

  return rows
}

function parsePurchasesRows(rows: unknown[][]): PurchaseEntry[] {
  const cleanRows = rows.filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
  if (cleanRows.length < 2) return []

  const headers = cleanRows[0].map((cell) => normalizeHeader(String(cell ?? '')))
  const dataRows = cleanRows.slice(1)
  const now = new Date().toISOString()

  return dataRows.map((row, index) => {
    const get = (...names: string[]) => getCell(row, headers, names)
    const date = normalizeDate(get('date', 'วันที่'))
    const amount = normalizeAmount(get('amount', 'ยอดซื้อ'))
    if (!date || amount === undefined) {
      throw new ImportFileError('invalid-row', index + 2)
    }

    const category = normalizeCategory(get('categorycode', 'รหัสหมวดหมู่')) ?? normalizeCategory(get('category', 'หมวดหมู่'))
    const createdAt = normalizeIsoDateTime(get('createdat', 'สร้างเมื่อ')) ?? now
    const updatedAt = normalizeIsoDateTime(get('updatedat', 'แก้ไขเมื่อ')) ?? createdAt

    return {
      id: String(get('id') ?? '').trim() || nanoid(),
      date,
      month: dateToMonth(date),
      amount,
      title: normalizeText(get('title', 'รายการ')),
      category,
      note: normalizeText(get('note', 'หมายเหตุ')),
      createdAt,
      updatedAt,
    }
  })
}

function getCell(row: unknown[], headers: string[], names: string[]): unknown {
  for (const name of names.map(normalizeHeader)) {
    const index = headers.indexOf(name)
    if (index >= 0) return row[index]
  }
  return undefined
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, '').replace(/\s+/g, '').trim().toLowerCase()
}

function normalizeText(value: unknown): string | undefined {
  const text = String(value ?? '').trim()
  return text || undefined
}

function normalizeAmount(value: unknown): number | undefined {
  const amount = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, '').trim())
  return Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : undefined
}

function normalizeDate(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10)
  const text = String(value ?? '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10)
}

function normalizeIsoDateTime(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString()
  const text = String(value ?? '').trim()
  if (!text) return undefined
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
}

function normalizeCategory(value: unknown): PurchaseCategory | undefined {
  const text = String(value ?? '').trim()
  if (!text) return undefined
  if (text in CATEGORY_LABELS) return text as PurchaseCategory
  return CATEGORY_BY_LABEL[text]
}

function toCsvCell(value: unknown): string {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      i += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (inQuotes) {
    throw new ImportFileError('invalid-csv')
  }

  row.push(cell)
  rows.push(row)
  return rows
}
