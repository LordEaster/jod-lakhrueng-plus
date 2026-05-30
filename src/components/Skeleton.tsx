interface BlockProps {
  className?: string
}

function SkeletonBlock({ className = '' }: BlockProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 ${className}`}
      aria-hidden="true"
    />
  )
}

export function SummaryCardSkeleton({ variant = 'today' }: { variant?: 'today' | 'month' }) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 shadow-sm ${variant === 'today' ? 'min-h-[190px]' : 'min-h-[150px]'}`}
      role="status"
      aria-label="กำลังโหลดข้อมูลสรุป"
    >
      <div className="flex items-center justify-between mb-4">
        <SkeletonBlock className="h-6 w-20" />
        <SkeletonBlock className="h-8 w-28 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-28 mb-2" />
      <SkeletonBlock className={variant === 'today' ? 'h-12 w-56 mb-4' : 'h-10 w-52 mb-4'} />
      <SkeletonBlock className="h-3 w-full rounded-full mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonBlock className="h-16 rounded-xl" />
        <SkeletonBlock className="h-16 rounded-xl" />
      </div>
    </div>
  )
}

export function RecentEntriesSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-label="กำลังโหลดรายการล่าสุด">
      {[0, 1, 2].map((item) => (
        <div key={item} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <SkeletonBlock className="h-5 w-32 mb-2" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
            <SkeletonBlock className="h-7 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="กำลังโหลดประวัติการซื้อ">
      {[0, 1].map((group) => (
        <div key={group}>
          <div className="flex items-center justify-between mb-2">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
          <div className="space-y-2">
            {[0, 1].map((item) => (
              <div key={item} className="bg-white rounded-xl border border-gray-200 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <SkeletonBlock className="h-6 w-36 mb-2" />
                    <SkeletonBlock className="h-4 w-48" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <SkeletonBlock className="h-7 w-24" />
                    <SkeletonBlock className="h-9 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 space-y-4" role="status" aria-label="กำลังโหลดหน้า">
      <SkeletonBlock className="h-8 w-40" />
      <SummaryCardSkeleton variant="month" />
      <RecentEntriesSkeleton />
    </div>
  )
}
