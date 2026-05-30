import type { MonthlySummary } from '../types/purchase'
import { formatAmount, formatThaiMonth, thisMonthKey } from '../logic/formatThai'

interface Props {
  summary: MonthlySummary
  monthlyCap: number
  month?: string
}

export default function MonthSummaryCard({ summary, monthlyCap, month }: Props) {
  const displayMonth = month ?? thisMonthKey()
  const pct = Math.min(100, (summary.totalSubsidy / monthlyCap) * 100)
  const isLow = summary.remainingMonthly > 0 && summary.remainingMonthly / monthlyCap < 0.2

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-700">เดือนนี้</h2>
        <span className="text-base text-gray-400">{formatThaiMonth(displayMonth)}</span>
      </div>

      <div className="mb-3">
        <p className="text-gray-500 text-base">ใช้สิทธิไปแล้ว</p>
        <p className="text-4xl font-bold text-gray-800 leading-tight">
          {formatAmount(summary.totalSubsidy)}
          <span className="text-xl font-normal text-gray-400"> / {formatAmount(monthlyCap)} บาท</span>
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full ${isLow ? 'bg-orange-400' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={summary.totalSubsidy}
          aria-valuemin={0}
          aria-valuemax={monthlyCap}
          aria-label={`ใช้สิทธิเดือนนี้แล้ว ${summary.totalSubsidy} จาก ${monthlyCap} บาท`}
        />
      </div>

      <div className="flex justify-between text-base">
        <span className="text-gray-500">
          เหลืออีก <span className={`font-semibold ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>{formatAmount(summary.remainingMonthly)} บาท</span>
        </span>
        {isLow && <span className="text-orange-600 font-medium">เดือนนี้เหลือสิทธิน้อยแล้ว</span>}
      </div>
    </div>
  )
}
