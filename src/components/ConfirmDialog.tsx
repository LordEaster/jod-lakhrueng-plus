interface Props {
  message: string
  subMessage?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'primary' | 'danger'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  message,
  subMessage,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={message}
    >
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto shadow-xl">
        <p className="text-xl font-semibold text-gray-800 text-center">{message}</p>
        {subMessage && <p className="text-base text-gray-500 text-center mt-2">{subMessage}</p>}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 py-4 rounded-xl border-2 border-gray-300 text-gray-700 text-lg font-medium min-h-[56px] active:scale-[0.97] transition-transform duration-100"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-4 rounded-xl text-white text-lg font-semibold min-h-[56px] active:scale-[0.95] transition-transform duration-100 ${confirmVariant === 'danger' ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
