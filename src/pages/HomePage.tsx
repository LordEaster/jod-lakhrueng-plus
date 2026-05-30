import { ArrowRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSchemeSetting, useAppSetting } from '../hooks/useSettings'
import { useCampaignStatus } from '../hooks/useCampaignStatus'
import { useDailySummary } from '../hooks/useDailySummary'
import { useMonthlySummary } from '../hooks/useMonthlySummary'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { saveAppSetting } from '../db/settingRepository'
import TodaySummaryCard from '../components/TodaySummaryCard'
import MonthSummaryCard from '../components/MonthSummaryCard'
import CalcWidget from '../components/CalcWidget'
import EmptyState from '../components/EmptyState'
import CampaignLockScreen from '../components/CampaignLockScreen'
import InstallHint from '../components/InstallHint'
import { RecentEntriesSkeleton, SummaryCardSkeleton } from '../components/Skeleton'
import { formatThaiDate, formatAmount } from '../logic/formatThai'

function HomeHeader() {
  return (
    <header className="px-4 pt-6 pb-2 text-center">
      <h1 className="sr-only">จดละครึ่ง พลัส</h1>
      <picture>
        <source
          type="image/avif"
          srcSet="/logo-240.avif 1x, /logo-480.avif 2x"
        />
        <source
          type="image/webp"
          srcSet="/logo-240.webp 1x, /logo-480.webp 2x"
        />
        <img
          src="/logo-240.webp"
          alt="จดละครึ่ง พลัส"
          width="240"
          height="80"
          decoding="async"
          fetchPriority="high"
          className="mx-auto h-auto w-full max-w-[240px]"
        />
      </picture>
      <p className="text-sm text-gray-400 mt-2">เครื่องมือช่วยจดสิทธิโครงการไทยช่วยไทย พลัส <br/>(ไม่ใช่บริการอย่างเป็นทางการของหน่วยงานรัฐ และไม่ได้รับการรับรอง สนับสนุน หรือมอบหมายจากหน่วยงานใด)</p>
    </header>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const scheme = useSchemeSetting()
  const appSetting = useAppSetting()
  const { status, startDate, endDate } = useCampaignStatus()
  const dailySummary = useDailySummary(scheme)
  const monthlySummary = useMonthlySummary(scheme)
  const recentEntries = useLiveQuery(() => db.purchases.orderBy('createdAt').reverse().limit(3).toArray(), [])

  async function dismissInstallHint() {
    await saveAppSetting({ ...appSetting, showInstallHint: false })
  }

  if (status === 'before' || status === 'after') {
    return (
      <div className="max-w-md mx-auto">
        <HomeHeader />
        <CampaignLockScreen status={status} startDate={startDate} endDate={endDate} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <HomeHeader />

      {appSetting.showInstallHint && <InstallHint onDismiss={dismissInstallHint} />}

      <div className="px-4 space-y-4 pb-28">
        {dailySummary ? (
          <TodaySummaryCard summary={dailySummary} dailyCap={scheme.dailyCap} />
        ) : (
          <SummaryCardSkeleton variant="today" />
        )}

        {dailySummary && <CalcWidget dailySummary={dailySummary} scheme={scheme} />}

        <button
          onClick={() => navigate('/add')}
          className="inline-flex w-full items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold py-5 rounded-2xl min-h-[72px] shadow-lg transition-colors active:scale-[0.95] transition-transform duration-100"
          aria-label="จดรายการซื้อใหม่"
        >
          <Plus className="h-7 w-7" aria-hidden="true" strokeWidth={2.5} />
          จดรายการซื้อ
        </button>

        {monthlySummary ? (
          <MonthSummaryCard summary={monthlySummary} monthlyCap={scheme.monthlyCap} />
        ) : (
          <SummaryCardSkeleton variant="month" />
        )}

        {/* Recent entries */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">รายการล่าสุด</h2>
          {!recentEntries ? (
            <RecentEntriesSkeleton />
          ) : recentEntries.length === 0 ? (
            <EmptyState
              message="วันนี้ยังไม่มีรายการซื้อ"
              subMessage="กดปุ่มด้านบนเพื่อจดรายการแรกของวันนี้"
            />
          ) : (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-lg font-medium text-gray-800">{entry.title ?? 'ไม่ระบุชื่อ'}</p>
                    <p className="text-sm text-gray-400">{formatThaiDate(entry.date)}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{formatAmount(entry.amount)} บาท</p>
                </div>
              ))}
              <button
                onClick={() => navigate('/history')}
                className="inline-flex w-full items-center justify-center gap-1 text-center text-green-600 font-medium py-3 text-lg active:scale-[0.97] transition-transform duration-100"
              >
                ดูประวัติทั้งหมด
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
