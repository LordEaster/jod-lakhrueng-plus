import { describe, expect, it } from 'vitest'
import { ImportFileError, createPurchasesCsv, createPurchasesXlsxBlob, parsePurchasesFile } from './dataPortability'
import type { PurchaseEntry } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'

const scheme: SchemeSetting = {
  subsidyRate: 0.6,
  dailyCap: 200,
  monthlyCap: 1000,
  totalCap: 4000,
  currency: 'THB',
  updatedAt: '2026-05-30T00:00:00.000Z',
}

const purchases: PurchaseEntry[] = [
  {
    id: 'purchase-1',
    date: '2026-05-30',
    month: '2026-05',
    amount: 100,
    title: 'ข้าวกลางวัน',
    category: 'food',
    note: 'ร้านประจำ',
    createdAt: '2026-05-30T05:00:00.000Z',
    updatedAt: '2026-05-30T05:00:00.000Z',
  },
]

describe('data portability', () => {
  it('exports and imports purchases as CSV', async () => {
    const csv = createPurchasesCsv(purchases, scheme)
    expect(csv).toContain('วันที่')
    expect(csv).toContain('รัฐช่วย')

    const imported = await parsePurchasesFile(new File([`\uFEFF${csv}`], 'purchases.csv', { type: 'text/csv' }))
    expect(imported).toEqual(purchases)
  })

  it('exports and imports purchases as XLSX', async () => {
    const blob = await createPurchasesXlsxBlob(purchases, scheme)
    const imported = await parsePurchasesFile(new File([blob], 'purchases.xlsx'))

    expect(imported).toEqual(purchases)
  })

  it('imports CSV rows created outside the app', async () => {
    const csv = [
      'วันที่,รายการ,หมวดหมู่,ยอดซื้อ,หมายเหตุ',
      '2026-05-31,กาแฟ,เครื่องดื่ม,65,เช้า',
    ].join('\n')

    const imported = await parsePurchasesFile(new File([csv], 'manual.csv'))
    expect(imported).toMatchObject([
      {
        date: '2026-05-31',
        month: '2026-05',
        amount: 65,
        title: 'กาแฟ',
        category: 'drink',
        note: 'เช้า',
      },
    ])
  })

  it('rejects unsupported import file types', async () => {
    await expect(parsePurchasesFile(new File(['hello'], 'manual.txt'))).rejects.toMatchObject({
      code: 'unsupported-file-type',
    })
  })

  it('rejects malformed CSV content', async () => {
    await expect(parsePurchasesFile(new File(['วันที่,ยอดซื้อ\n"2026-05-31,65'], 'manual.csv'))).rejects.toMatchObject({
      code: 'invalid-csv',
    })
  })

  it('reports invalid row number when required cells are missing', async () => {
    await expect(parsePurchasesFile(new File(['วันที่,ยอดซื้อ\n2026-05-31,'], 'manual.csv'))).rejects.toEqual(
      new ImportFileError('invalid-row', 2),
    )
  })
})
