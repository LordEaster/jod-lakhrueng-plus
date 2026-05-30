import type { EnrichedEntry } from '../types/purchase'
import { CATEGORY_LABELS } from '../types/purchase'
import { formatAmount } from '../logic/formatThai'

interface Props {
  entry: EnrichedEntry
  onEdit: (entry: EnrichedEntry) => void
  onDelete: (entry: EnrichedEntry) => void
}

export default function PurchaseListItem({ entry, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-col gap-3 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-lg font-medium text-gray-800 truncate">
            {entry.title ?? 'ไม่ระบุชื่อ'}
          </p>
          {entry.category && (
            <p className="text-sm text-gray-500">{CATEGORY_LABELS[entry.category]}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>รัฐช่วย <span className="font-medium text-green-600">{formatAmount(entry.subsidyAmount)} บาท</span></span>
            <span>จ่ายเอง <span className="font-medium text-gray-700">{formatAmount(entry.userPaidAmount)} บาท</span></span>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 min-[380px]:ml-3 min-[380px]:flex-col min-[380px]:items-end">
          <p className="text-xl font-bold text-gray-800">{formatAmount(entry.amount)} บาท</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(entry)}
              className="text-green-600 text-sm font-medium px-3 py-1 rounded-lg border border-green-200 min-h-[36px] active:scale-[0.97] transition-transform duration-100"
              aria-label={`แก้ไข ${entry.title ?? 'รายการ'}`}
            >
              แก้ไข
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="text-red-500 text-sm font-medium px-3 py-1 rounded-lg border border-red-200 min-h-[36px] active:scale-[0.97] transition-transform duration-100"
              aria-label={`ลบ ${entry.title ?? 'รายการ'}`}
            >
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
