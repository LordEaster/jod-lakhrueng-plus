import { ArrowLeft, CircleCheckBig } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { addPurchase } from '../db/purchaseRepository'
import { useSchemeSetting } from '../hooks/useSettings'
import { useDailySummary } from '../hooks/useDailySummary'
import { calculateDailySubsidy, getMonthlySummary } from '../logic/calculateSubsidy'
import { formatAmount, thisMonthKey, todayKey } from '../logic/formatThai'
import { parseMoneyInput, sanitizeMoneyInput } from '../logic/money'
import { CATEGORY_LABELS, type PurchaseCategory } from '../types/purchase'
import AmountShortcutGrid from '../components/AmountShortcutGrid'
import QuickRepeatButtons from '../components/QuickRepeatButtons'
import ConfirmDialog from '../components/ConfirmDialog'
import type { PurchaseEntry } from '../types/purchase'

type SavedFeedback = { subsidyAmount: number; userPaidAmount: number } | null

export default function AddPurchasePage() {
  const navigate = useNavigate()
  const scheme = useSchemeSetting()
  const dailySummary = useDailySummary(scheme)
  const recentEntries = useLiveQuery(() => db.purchases.orderBy('createdAt').reverse().limit(3).toArray(), [])

  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PurchaseCategory | ''>('')
  const [error, setError] = useState('')
  const [savedFeedback, setSavedFeedback] = useState<SavedFeedback>(null)
  const [showLargeConfirm, setShowLargeConfirm] = useState(false)

  const numAmount = parseMoneyInput(amount) ?? 0
  const toFillToday = dailySummary?.toFillDaily ?? 0

  function handleAmountInput(value: string) {
    setAmount(sanitizeMoneyInput(value))
    setError('')
  }

  function handleShortcut(value: number) {
    setAmount(String(value))
    setError('')
  }

  function handleQuickRepeat(entry: PurchaseEntry) {
    setAmount(String(entry.amount))
    setTitle(entry.title ?? '')
    setCategory((entry.category as PurchaseCategory) ?? '')
  }

  async function doSave() {
    const thisMonth = thisMonthKey()
    const today = todayKey()

    const [allMonthEntries, allPriorEntries] = await Promise.all([
      db.purchases.where('month').equals(thisMonth).toArray(),
      scheme.startDate
        ? db.purchases.where('month').below(thisMonth).toArray()
        : Promise.resolve([]),
    ])

    const { totalSubsidy: prevMonthsTotal } = getMonthlySummary(allPriorEntries, scheme, 0)
    const priorDayEntries = allMonthEntries.filter((e) => e.date < today)
    const { totalSubsidy: monthUsedBefore } = getMonthlySummary(priorDayEntries, scheme, prevMonthsTotal)
    const totalUsedBefore = prevMonthsTotal + monthUsedBefore

    const dayEntriesSoFar = await db.purchases.where('date').equals(today).toArray()
    const tempEntry = {
      id: 'preview',
      date: today,
      month: thisMonth,
      amount: numAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const allDayEntries = [...dayEntriesSoFar, tempEntry].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    const enriched = calculateDailySubsidy(allDayEntries, scheme, monthUsedBefore, totalUsedBefore)
    const newEntryEnriched = enriched.find((e) => e.id === 'preview')!
    const subsidyAmount = newEntryEnriched.subsidyAmount
    const userPaidAmount = newEntryEnriched.userPaidAmount

    await addPurchase({
      amount: numAmount,
      title: title.trim() || undefined,
      category: category || undefined,
    })

    setSavedFeedback({ subsidyAmount, userPaidAmount })
  }

  async function handleSave() {
    if (numAmount <= 0) {
      setError('กรุณาใส่ยอดซื้อ')
      return
    }
    if (numAmount > 50000) {
      setShowLargeConfirm(true)
      return
    }
    await doSave()
  }

  if (savedFeedback) {
    return (
      <div className="max-w-md mx-auto px-4 pt-12 flex flex-col items-center text-center">
        <CircleCheckBig className="mb-4 h-16 w-16 text-green-600" aria-hidden="true" strokeWidth={1.8} />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">บันทึกแล้ว</h1>
        <p className="text-xl text-gray-600 mb-1">รัฐช่วย <span className="font-bold text-green-600">{formatAmount(savedFeedback.subsidyAmount)} บาท</span></p>
        <p className="text-xl text-gray-600 mb-8">คุณจ่ายเอง <span className="font-bold text-gray-800">{formatAmount(savedFeedback.userPaidAmount)} บาท</span></p>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => { setSavedFeedback(null); setAmount(''); setTitle(''); setCategory('') }}
            className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold text-lg py-4 rounded-2xl min-h-[56px]"
          >
            จดเพิ่มอีก
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px]"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-2xl p-2 -ml-2 text-gray-600"
          aria-label="ย้อนกลับ"
        >
          <ArrowLeft className="h-6 w-6" aria-hidden="true" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">จดรายการซื้อ</h1>
      </header>

      <div className="px-4 space-y-5">
        {/* Amount input */}
        <div>
          <label htmlFor="amount" className="text-base text-gray-500 mb-1 block">
            ยอดซื้อ (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.]?[0-9]{0,2}"
            value={amount}
            onChange={(e) => handleAmountInput(e.target.value)}
            placeholder="0"
            autoFocus
            className="w-full text-4xl font-bold text-gray-800 border-2 border-gray-300 rounded-2xl px-4 py-4 focus:border-blue-500 focus:outline-none text-center"
            aria-describedby={error ? 'amount-error' : undefined}
          />
          {error && <p id="amount-error" className="text-red-500 text-base mt-1">{error}</p>}
        </div>

        <AmountShortcutGrid toFillToday={toFillToday} onSelect={handleShortcut} />

        {recentEntries && recentEntries.length > 0 && (
          <QuickRepeatButtons entries={recentEntries} onSelect={handleQuickRepeat} />
        )}

        {/* Optional title */}
        <div>
          <label htmlFor="title" className="text-base text-gray-500 mb-1 block">
            ชื่อรายการ <span className="text-gray-300">(ไม่บังคับ)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="เช่น ข้าวแกง กาแฟ"
            className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Optional category */}
        <div>
          <label htmlFor="category" className="text-base text-gray-500 mb-1 block">
            หมวดหมู่ <span className="text-gray-300">(ไม่บังคับ)</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as PurchaseCategory | '')}
            className="w-full text-lg border-2 border-gray-200 rounded-2xl px-4 py-3 focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {(Object.entries(CATEGORY_LABELS) as [PurchaseCategory, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold text-lg py-4 rounded-2xl min-h-[56px]"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px] shadow-md"
          >
            บันทึก
          </button>
        </div>
      </div>

      {showLargeConfirm && (
        <ConfirmDialog
          message={`ยืนยันยอด ${formatAmount(numAmount)} บาท?`}
          subMessage="ยอดนี้สูงกว่าปกติ ต้องการบันทึกหรือไม่?"
          confirmLabel="บันทึก"
          onConfirm={async () => { setShowLargeConfirm(false); await doSave() }}
          onCancel={() => setShowLargeConfirm(false)}
        />
      )}
    </div>
  )
}
