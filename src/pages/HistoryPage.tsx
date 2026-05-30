import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { updatePurchase, deletePurchase } from '../db/purchaseRepository'
import { useSchemeSetting } from '../hooks/useSettings'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { calculateDailySubsidy } from '../logic/calculateSubsidy'
import { formatThaiDate, formatThaiMonth, formatAmount, thisMonthKey } from '../logic/formatThai'
import { type EnrichedEntry } from '../types/purchase'
import PurchaseListItem from '../components/PurchaseListItem'
import ConfirmDialog from '../components/ConfirmDialog'
import MonthSummaryCard from '../components/MonthSummaryCard'
import EmptyState from '../components/EmptyState'
import type { PurchaseEntry } from '../types/purchase'

export default function HistoryPage() {
  const scheme = useSchemeSetting()
  const [selectedMonth, setSelectedMonth] = useState(thisMonthKey())
  const [deleteTarget, setDeleteTarget] = useState<EnrichedEntry | null>(null)
  const [editTarget, setEditTarget] = useState<EnrichedEntry | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editTitle, setEditTitle] = useState('')

  const monthlySummary = useMonthlySummary(scheme, selectedMonth)

  const monthEntries = useLiveQuery(
    () => db.purchases.where('month').equals(selectedMonth).sortBy('createdAt'),
    [selectedMonth],
  )

  const availableMonths = useLiveQuery(async () => {
    const all = await db.purchases.orderBy('month').uniqueKeys()
    return (all as string[]).reverse()
  }, [])

  function enrichEntries(entries: PurchaseEntry[]): EnrichedEntry[] {
    const byDate = new Map<string, PurchaseEntry[]>()
    for (const e of entries) {
      if (!byDate.has(e.date)) byDate.set(e.date, [])
      byDate.get(e.date)!.push(e)
    }
    const sortedDates = [...byDate.keys()].sort()
    let runningMonthly = 0
    const result: EnrichedEntry[] = []
    for (const date of sortedDates) {
      const dayEntries = [...byDate.get(date)!].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      const enriched = calculateDailySubsidy(dayEntries, scheme, runningMonthly, 0)
      for (const e of enriched) {
        runningMonthly += e.subsidyAmount
        result.push(e)
      }
    }
    return result
  }

  const enrichedEntries = monthEntries ? enrichEntries(monthEntries) : []

  const byDate = new Map<string, EnrichedEntry[]>()
  for (const e of enrichedEntries) {
    if (!byDate.has(e.date)) byDate.set(e.date, [])
    byDate.get(e.date)!.push(e)
  }
  const sortedDates = [...byDate.keys()].sort().reverse()

  async function handleDelete() {
    if (!deleteTarget) return
    await deletePurchase(deleteTarget.id)
    setDeleteTarget(null)
  }

  function openEdit(entry: EnrichedEntry) {
    setEditTarget(entry)
    setEditAmount(String(entry.amount))
    setEditTitle(entry.title ?? '')
  }

  async function handleEdit() {
    if (!editTarget) return
    const newAmount = parseFloat(editAmount)
    if (!newAmount || newAmount <= 0) return
    await updatePurchase(editTarget.id, {
      amount: newAmount,
      title: editTitle.trim() || undefined,
    })
    setEditTarget(null)
  }

  return (
    <div className="max-w-md mx-auto">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">ประวัติการซื้อ</h1>
      </header>

      <div className="px-4 mb-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 bg-white focus:border-blue-500 focus:outline-none"
          aria-label="เลือกเดือน"
        >
          {(availableMonths ?? [thisMonthKey()]).map((month) => (
            <option key={month} value={month}>
              {formatThaiMonth(month)}
            </option>
          ))}
        </select>
      </div>

      {monthlySummary && (
        <div className="px-4 mb-4">
          <MonthSummaryCard summary={monthlySummary} monthlyCap={scheme.monthlyCap} month={selectedMonth} />
        </div>
      )}

      <div className="px-4 space-y-6 pb-6">
        {sortedDates.length === 0 ? (
          <EmptyState message="ไม่มีรายการในเดือนนี้" />
        ) : (
          sortedDates.map((date) => {
            const dayEntries = byDate.get(date)!
            const dayTotal = dayEntries.reduce((s, e) => s + e.amount, 0)
            const daySubsidy = dayEntries.reduce((s, e) => s + e.subsidyAmount, 0)
            const dayUserPaid = dayEntries.reduce((s, e) => s + e.userPaidAmount, 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-gray-700">{formatThaiDate(date)}</h2>
                  <span className="text-sm text-gray-400">รวม {formatAmount(dayTotal)} บาท</span>
                </div>
                <div className="space-y-2">
                  {dayEntries.map((entry) => (
                    <PurchaseListItem
                      key={entry.id}
                      entry={entry}
                      onEdit={openEdit}
                      onDelete={setDeleteTarget}
                    />
                  ))}
                </div>
                <div className="mt-2 px-1 flex gap-4 text-sm text-gray-500">
                  <span>รัฐช่วยรวม <span className="font-medium text-green-600">{formatAmount(daySubsidy)} บาท</span></span>
                  <span>จ่ายเองรวม <span className="font-medium text-gray-700">{formatAmount(dayUserPaid)} บาท</span></span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {deleteTarget && (
        <ConfirmDialog
          message="ลบรายการนี้?"
          subMessage={`${deleteTarget.title ?? 'ไม่ระบุชื่อ'} ${formatAmount(deleteTarget.amount)} บาท`}
          confirmLabel="ลบ"
          cancelLabel="ยกเลิก"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {editTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">แก้ไขรายการ</h2>
            <div className="space-y-3">
              <div>
                <label className="text-base text-gray-500 block mb-1">ยอดซื้อ (บาท)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full text-2xl font-bold border-2 border-gray-300 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none text-center"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-base text-gray-500 block mb-1">ชื่อรายการ (ไม่บังคับ)</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditTarget(null)} className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold text-lg py-4 rounded-2xl min-h-[56px]">ยกเลิก</button>
              <button onClick={handleEdit} className="flex-1 bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px]">บันทึก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
