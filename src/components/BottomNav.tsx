import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: 'หน้าแรก', icon: '🏠' },
  { to: '/history', label: 'ประวัติ', icon: '📋' },
  { to: '/settings', label: 'ตั้งค่า', icon: '⚙️' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50"
      aria-label="เมนูหลัก"
    >
      <div className="flex">
        {tabs.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-sm font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
            aria-label={label}
          >
            <span className="text-xl leading-none mb-1" aria-hidden="true">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
