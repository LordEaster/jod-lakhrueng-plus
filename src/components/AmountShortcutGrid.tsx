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
      <div className="grid grid-cols-4 gap-2">
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className="bg-gray-100 hover:bg-green-50 text-gray-800 font-semibold rounded-xl py-3 text-base min-h-[48px] transition-colors active:scale-[0.97] transition-transform duration-100"
          >
            {formatAmount(amount)}
          </button>
        ))}
        {toFillToday > 0 && (
          <button
            onClick={() => onSelect(toFillToday)}
            className="col-span-4 bg-green-50 hover:bg-green-100 text-green-800 font-semibold rounded-xl py-3 text-base min-h-[48px] border border-green-200 transition-colors active:scale-[0.97] transition-transform duration-100"
          >
            เต็มสิทธิวันนี้ ({formatAmount(toFillToday)} บาท)
          </button>
        )}
      </div>
    </div>
  )
}
