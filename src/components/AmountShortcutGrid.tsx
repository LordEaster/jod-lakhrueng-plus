import { formatAmount } from '../logic/formatThai'

const PRESET_AMOUNTS = [50, 60, 80, 100, 120, 150, 200, 333]

interface Props {
  toFillToday: number
  onSelect: (amount: number) => void
}

export default function AmountShortcutGrid({ toFillToday, onSelect }: Props) {
  return (
    <div>
      <p className="text-base text-gray-500 mb-2">กดเลือกยอดได้เลย</p>
      <div className="grid grid-cols-2 gap-2 min-[360px]:grid-cols-4">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className="min-h-[48px] rounded-xl bg-gray-100 py-3 text-base font-semibold text-gray-800 transition-colors duration-100 hover:bg-green-50 active:scale-[0.97]"
          >
            {formatAmount(amount)}
          </button>
        ))}
        {toFillToday > 0 && (
          <button
            onClick={() => onSelect(toFillToday)}
            className="col-span-2 min-h-[48px] rounded-xl border border-green-200 bg-green-50 py-3 text-base font-semibold text-green-800 transition-colors duration-100 hover:bg-green-100 active:scale-[0.97] min-[360px]:col-span-4"
          >
            เต็มสิทธิวันนี้ ({formatAmount(toFillToday)} บาท)
          </button>
        )}
      </div>
    </div>
  )
}
