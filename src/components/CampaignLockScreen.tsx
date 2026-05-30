import { CircleCheckBig, Hourglass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { CampaignStatus } from '../hooks/useCampaignStatus'
import { formatThaiDate } from '../logic/formatThai'

interface Props {
  status: CampaignStatus
  startDate?: string
  endDate?: string
}

export default function CampaignLockScreen({ status, startDate, endDate }: Props) {
  const navigate = useNavigate()
  const StatusIcon = status === 'before' ? Hourglass : CircleCheckBig

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <StatusIcon className="mb-6 h-16 w-16 text-blue-600" aria-hidden="true" strokeWidth={1.8} />
      {status === 'before' && (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">โครงการยังไม่เริ่ม</h1>
          {startDate && (
            <p className="text-xl text-gray-600">จะเริ่มวันที่ {formatThaiDate(startDate)}</p>
          )}
        </>
      )}
      {status === 'after' && (
        <>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">โครงการสิ้นสุดแล้ว</h1>
          {endDate && (
            <p className="text-xl text-gray-600 mb-6">สิ้นสุดวันที่ {formatThaiDate(endDate)}</p>
          )}
          <button
            onClick={() => navigate('/history')}
            className="bg-blue-600 text-white text-xl font-semibold px-8 py-4 rounded-2xl min-h-[56px]"
          >
            ดูประวัติการซื้อ
          </button>
        </>
      )}
      <p className="mt-6 text-base text-gray-500">
        สามารถแก้ไขวันที่โครงการได้ที่หน้าตั้งค่า
      </p>
    </div>
  )
}
