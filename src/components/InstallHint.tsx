import { Smartphone, X } from 'lucide-react'

interface Props {
  onDismiss: () => void
}

export default function InstallHint({ onDismiss }: Props) {
  return (
    <div className="mx-4 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3">
      <Smartphone className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" aria-hidden="true" strokeWidth={2} />
      <div className="flex-1">
        <p className="text-base font-medium text-blue-800">เพิ่มเว็บนี้ไว้หน้าจอมือถือ</p>
        <p className="text-sm text-blue-600 mt-1">เพื่อจดรายการได้เร็วขึ้น ไม่ต้องเปิด browser ทุกครั้ง</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-blue-400 text-xl p-1"
        aria-label="ปิดคำแนะนำ"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  )
}
