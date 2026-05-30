import type { PurchaseEntry } from '../types/purchase'
import { formatAmount } from '../logic/formatThai'

interface Props {
  entries: PurchaseEntry[]
  onSelect: (entry: PurchaseEntry) => void
}

export default function QuickRepeatButtons({ entries, onSelect }: Props) {
  if (entries.length === 0) return null

  return (
    <div>
      <p className="text-base text-gray-500 mb-2">จดซ้ำจากที่ผ่านมา</p>
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition-colors duration-100 hover:bg-gray-100 active:scale-[0.97]"
          >
            <span className="min-w-0 truncate text-base text-gray-700">{entry.title ?? 'ไม่ระบุชื่อ'}</span>
            <span className="shrink-0 text-lg font-semibold text-gray-800">{formatAmount(entry.amount)} บาท</span>
          </button>
        ))}
      </div>
    </div>
  )
}
