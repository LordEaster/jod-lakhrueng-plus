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
            className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 flex justify-between items-center min-h-[56px] transition-colors"
          >
            <span className="text-base text-gray-700">{entry.title ?? 'ไม่ระบุชื่อ'}</span>
            <span className="text-lg font-semibold text-gray-800">{formatAmount(entry.amount)} บาท</span>
          </button>
        ))}
      </div>
    </div>
  )
}
