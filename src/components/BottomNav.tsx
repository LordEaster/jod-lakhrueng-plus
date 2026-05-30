import { ClipboardList, Home, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'หน้าแรก', Icon: Home },
  { to: '/history', label: 'ประวัติ', Icon: ClipboardList },
  { to: '/settings', label: 'ตั้งค่า', Icon: Settings },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]"
      aria-label="เมนูหลัก"
    >
      <div className="flex">
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-sm font-medium transition-colors duration-150 ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`
            }
            aria-label={label}
          >
            <Icon className="mb-1 h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
