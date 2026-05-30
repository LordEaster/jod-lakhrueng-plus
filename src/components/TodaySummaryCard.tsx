import type { DailySummary } from '../types/purchase'
import { formatAmount } from '../logic/formatThai'

interface Props {
  summary: DailySummary
  dailyCap: number
}

function getStatus(remaining: number, cap: number) {
  if (remaining === 0) return { color: 'bg-emerald-50 border-emerald-300', textColor: 'text-emerald-700', barColor: 'bg-emerald-500', label: 'ใช้เต็มสิทธิแล้ว' }
  if (remaining / cap < 0.5) return { color: 'bg-amber-50 border-amber-200', textColor: 'text-amber-700', barColor: 'bg-amber-400', label: 'ใกล้เต็มสิทธิ' }
  return { color: 'bg-green-50 border-green-200', textColor: 'text-green-700', barColor: 'bg-green-500', label: 'ยังใช้ได้อีก' }
}

export default function TodaySummaryCard({ summary, dailyCap }: Props) {
  const status = getStatus(summary.remainingDaily, dailyCap)

  return (
    <div className={`rounded-2xl border-2 p-5 ${status.color}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-700">วันนี้</h2>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${status.textColor} bg-white`}>
          {status.label}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-gray-500 text-base">ใช้สิทธิไปแล้ว</p>
        <p className="text-5xl font-bold text-gray-800 leading-tight">
          {formatAmount(summary.totalSubsidy)}
          <span className="text-2xl font-normal text-gray-500"> / {formatAmount(dailyCap)} บาท</span>
        </p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <div
          className={`h-3 rounded-full transition-all ${status.barColor}`}
          style={{ width: `${Math.min(100, (summary.totalSubsidy / dailyCap) * 100)}%` }}
          role="progressbar"
          aria-valuenow={summary.totalSubsidy}
          aria-valuemin={0}
          aria-valuemax={dailyCap}
          aria-label={`ใช้สิทธิแล้ว ${summary.totalSubsidy} จาก ${dailyCap} บาท`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3">
          <p className="text-gray-500 text-sm">วันนี้เหลืออีก</p>
          <p className="text-2xl font-bold text-gray-800">{formatAmount(summary.remainingDaily)} <span className="text-base font-normal">บาท</span></p>
        </div>
        {summary.toFillDaily > 0 && (
          <div className="bg-white rounded-xl p-3">
            <p className="text-gray-500 text-sm">ซื้อเพิ่มอีกประมาณ</p>
            <p className="text-2xl font-bold text-gray-800">{formatAmount(summary.toFillDaily)} <span className="text-base font-normal">บาท</span></p>
            <p className="text-xs text-gray-500">จะเต็มสิทธิวันนี้</p>
          </div>
        )}
        {summary.remainingTotal < dailyCap && summary.remainingTotal > 0 && (
          <div className="bg-white rounded-xl p-3 col-span-2">
            <p className="text-gray-500 text-sm">วงเงินรวมตลอดโครงการเหลืออีก</p>
            <p className="text-xl font-bold text-orange-600">{formatAmount(summary.remainingTotal)} <span className="text-base font-normal">บาท</span></p>
          </div>
        )}
      </div>
    </div>
  )
}
