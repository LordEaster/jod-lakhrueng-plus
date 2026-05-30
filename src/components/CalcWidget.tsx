import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calculator } from 'lucide-react'
import type { DailySummary } from '../types/purchase'
import type { SchemeSetting } from '../types/setting'
import { formatAmount } from '../logic/formatThai'
import { parseMoneyInput, sanitizeMoneyInput } from '../logic/money'

interface Props {
  dailySummary: DailySummary
  scheme: SchemeSetting
}

export default function CalcWidget({ dailySummary, scheme }: Props) {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')

  const numAmount = parseMoneyInput(amount) ?? 0
  const hasAmount = numAmount > 0

  const rawSubsidy = numAmount * scheme.subsidyRate
  const actualSubsidy = Math.min(
    rawSubsidy,
    dailySummary.remainingDaily,
    dailySummary.remainingMonthly,
    dailySummary.remainingTotal,
  )
  const userPays = numAmount - actualSubsidy
  const isCapped = hasAmount && actualSubsidy < rawSubsidy

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calculator className="h-4 w-4 text-green-600" aria-hidden="true" />
        <p className="text-sm font-semibold text-green-700">ลองคำนวณก่อนซื้อ</p>
      </div>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*[.]?[0-9]{0,2}"
        value={amount}
        onChange={(e) => setAmount(sanitizeMoneyInput(e.target.value))}
        placeholder="พิมพ์ยอดซื้อ (บาท)"
        className="w-full text-2xl font-bold text-gray-800 border-2 border-green-300 focus:border-green-500 focus:outline-none rounded-xl px-4 py-3 bg-white text-center"
        aria-label="ยอดซื้อสำหรับคำนวณสิทธิ"
      />

      {hasAmount && (
        <>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">รัฐช่วย</p>
              <p className="text-xl font-bold text-green-700">{formatAmount(actualSubsidy)}</p>
              <p className="text-xs text-gray-400">บาท</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">คุณจ่ายเอง</p>
              <p className="text-xl font-bold text-gray-800">{formatAmount(userPays)}</p>
              <p className="text-xs text-gray-400">บาท</p>
            </div>
          </div>

          {isCapped && (
            <p className="text-xs text-amber-600 mt-2 text-center">
              สิทธิเหลือไม่ถึง — รัฐช่วยได้สูงสุด {formatAmount(Math.min(dailySummary.remainingDaily, dailySummary.remainingMonthly, dailySummary.remainingTotal))} บาท
            </p>
          )}

          <button
            onClick={() => navigate(`/add?amount=${numAmount}`)}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white font-semibold text-base py-3 rounded-xl active:scale-[0.97] transition-transform duration-100"
          >
            จดรายการนี้เลย
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  )
}
