import { ArrowLeft, CircleCheckBig } from 'lucide-react'
import { useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { addPurchase } from '../db/purchaseRepository'
import { useSchemeSetting } from '../hooks/useSettings'
import { useDailySummary } from '../hooks/useDailySummary'
import { calculateDailySubsidy, getMonthlySummary } from '../logic/calculateSubsidy'
import { formatAmount, formatThaiDate, dateToMonth, todayKey } from '../logic/formatThai'
import { parseMoneyInput, sanitizeMoneyInput } from '../logic/money'
import { CATEGORY_LABELS, type PurchaseCategory } from '../types/purchase'
import AmountShortcutGrid from '../components/AmountShortcutGrid'
import QuickRepeatButtons from '../components/QuickRepeatButtons'
import ConfirmDialog from '../components/ConfirmDialog'
import SelectField from '../components/SelectField'
import type { PurchaseEntry } from '../types/purchase'

type SavedFeedback = { subsidyAmount: number; userPaidAmount: number } | null

export default function AddPurchasePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scheme = useSchemeSetting()
  const dailySummary = useDailySummary(scheme)
  const recentEntries = useLiveQuery(() => db.purchases.orderBy('createdAt').reverse().limit(3).toArray(), [])

  const [amount, setAmount] = useState(() => searchParams.get('amount') ?? '')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<PurchaseCategory | ''>('')
  const [selectedDate, setSelectedDate] = useState(todayKey)
  const [error, setError] = useState('')
  const [savedFeedback, setSavedFeedback] = useState<SavedFeedback>(null)
  const [showLargeConfirm, setShowLargeConfirm] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const categorySelectRef = useRef<HTMLSelectElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

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

  function focusOnEnter(event: KeyboardEvent<HTMLElement>, nextField: HTMLElement | null) {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    nextField?.focus()
  }

  async function doSave() {
    const selectedMonth = dateToMonth(selectedDate)

    const [allMonthEntries, allPriorEntries] = await Promise.all([
      db.purchases.where('month').equals(selectedMonth).toArray(),
      scheme.startDate
        ? db.purchases.where('month').below(selectedMonth).toArray()
        : Promise.resolve([]),
    ])

    const { totalSubsidy: prevMonthsTotal } = getMonthlySummary(allPriorEntries, scheme, 0)
    const priorDayEntries = allMonthEntries.filter((e) => e.date < selectedDate)
    const { totalSubsidy: monthUsedBefore } = getMonthlySummary(priorDayEntries, scheme, prevMonthsTotal)
    const totalUsedBefore = prevMonthsTotal + monthUsedBefore

    const dayEntriesSoFar = await db.purchases.where('date').equals(selectedDate).toArray()
    const tempEntry = {
      id: 'preview',
      date: selectedDate,
      month: selectedMonth,
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
      date: selectedDate,
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
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 pt-12 text-center sm:max-w-lg">
        <CircleCheckBig className="mb-4 h-16 w-16 text-green-600 animate-[bounce_0.4s_ease-out_1]" aria-hidden="true" strokeWidth={1.8} />
        <h1 className="text-3xl font-bold text-green-700 mb-5">บันทึกแล้ว</h1>
        <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">รัฐช่วย</p>
              <p className="text-2xl font-bold text-green-700">{formatAmount(savedFeedback.subsidyAmount)}</p>
              <p className="text-sm text-gray-500">บาท</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">คุณจ่ายเอง</p>
              <p className="text-2xl font-bold text-gray-800">{formatAmount(savedFeedback.userPaidAmount)}</p>
              <p className="text-sm text-gray-500">บาท</p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 min-[380px]:flex-row">
          <button
            onClick={() => { setSavedFeedback(null); setAmount(''); setTitle(''); setCategory(''); setSelectedDate(todayKey()) }}
            className="flex-1 border-2 border-green-600 text-green-600 font-semibold text-lg py-4 rounded-xl min-h-[56px] active:scale-[0.97] transition-transform duration-100"
          >
            จดเพิ่มอีก
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-green-600 text-white font-semibold text-lg py-4 rounded-xl min-h-[56px] active:scale-[0.95] transition-transform duration-100"
          >
            กลับหน้าแรก
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-xl md:max-w-2xl">
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

      <div className="grid gap-5 px-4 md:grid-cols-2">
        {/* Amount input */}
        <div className="md:col-span-2">
          <label htmlFor="amount" className="text-base text-gray-500 mb-1 block">
            ยอดซื้อ (บาท) <span className="text-red-500">*</span>
          </label>
          <input
            id="amount"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*[.]?[0-9]{0,2}"
            value={amount}
            onChange={(e) => handleAmountInput(e.target.value)}
            onKeyDown={(e) => focusOnEnter(e, titleInputRef.current)}
            placeholder="0"
            autoFocus
            className="w-full text-4xl font-bold text-gray-800 border-2 border-gray-300 rounded-xl px-4 py-4 focus:border-green-500 focus:outline-none text-center"
            aria-describedby={error ? 'amount-error' : undefined}
          />
          {error && <p id="amount-error" className="text-red-500 text-base mt-1">{error}</p>}
        </div>

        <div className="md:col-span-2">
          <AmountShortcutGrid toFillToday={toFillToday} onSelect={handleShortcut} />
        </div>

        {recentEntries && recentEntries.length > 0 && (
          <div className="md:col-span-2">
            <QuickRepeatButtons entries={recentEntries} onSelect={handleQuickRepeat} />
          </div>
        )}

        {/* Optional title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="text-base text-gray-500 mb-1 block">
            ชื่อรายการ <span className="text-gray-300">(ไม่บังคับ)</span>
          </label>
          <input
            id="title"
            type="text"
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => focusOnEnter(e, categorySelectRef.current)}
            placeholder="เช่น ข้าวแกง กาแฟ"
            className="w-full text-lg border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Optional category */}
        <div>
          <label htmlFor="category" className="text-base text-gray-500 mb-1 block">
            หมวดหมู่ <span className="text-gray-300">(ไม่บังคับ)</span>
          </label>
          <SelectField
            id="category"
            ref={categorySelectRef}
            value={category}
            onChange={(e) => setCategory(e.target.value as PurchaseCategory | '')}
            onKeyDown={(e) => focusOnEnter(e, saveButtonRef.current)}
          >
            <option value="">-- เลือกหมวดหมู่ --</option>
            {(Object.entries(CATEGORY_LABELS) as [PurchaseCategory, string][]).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </SelectField>
        </div>

        {/* Date (backdate) */}
        <div>
          <label htmlFor="entry-date" className="text-base text-gray-500 mb-1 block">
            วันที่ซื้อ
            {selectedDate !== todayKey() && (
              <span className="ml-2 text-amber-600 text-sm font-medium">จดย้อนหลัง</span>
            )}
          </label>
          <input
            id="entry-date"
            type="date"
            value={selectedDate}
            max={todayKey()}
            min={scheme.startDate ?? '2026-06-01'}
            onChange={(e) => setSelectedDate(e.target.value || todayKey())}
            className="w-full text-lg border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-green-500 focus:outline-none bg-white"
          />
          {selectedDate !== todayKey() && (
            <p className="text-sm text-amber-600 mt-1">
              กำลังจดรายการของวัน{formatThaiDate(selectedDate)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pb-28 min-[380px]:flex-row md:col-span-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 border-2 border-gray-300 text-gray-700 font-semibold text-lg py-4 rounded-xl min-h-[56px] active:scale-[0.97] transition-transform duration-100"
          >
            ยกเลิก
          </button>
          <button
            ref={saveButtonRef}
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white font-semibold text-lg py-4 rounded-xl min-h-[56px] shadow-md active:scale-[0.95] transition-transform duration-100"
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
