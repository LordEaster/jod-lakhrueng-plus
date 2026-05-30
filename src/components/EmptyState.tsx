import { useNavigate } from 'react-router-dom'

interface Props {
  message: string
  subMessage?: string
  showAddButton?: boolean
}

export default function EmptyState({ message, subMessage, showAddButton = false }: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <p className="text-xl text-gray-600 font-medium">{message}</p>
      {subMessage && <p className="mt-2 text-gray-500 text-lg">{subMessage}</p>}
      {showAddButton && (
        <button
          onClick={() => navigate('/add')}
          className="mt-6 bg-blue-600 text-white text-xl font-semibold px-8 py-4 rounded-2xl min-h-[56px] shadow-md active:opacity-80"
        >
          + จดรายการซื้อ
        </button>
      )}
    </div>
  )
}
