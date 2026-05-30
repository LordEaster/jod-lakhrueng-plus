import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppPreferences from './components/AppPreferences'
import BottomNav from './components/BottomNav'
import HomePage from './pages/HomePage'
import { PageSkeleton } from './components/Skeleton'

const AddPurchasePage = lazy(() => import('./pages/AddPurchasePage'))
const HistoryPage = lazy(() => import('./pages/HistoryPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'))

export default function App() {
  return (
    <BrowserRouter>
      <AppPreferences />
      <div className="min-h-screen bg-gray-50 pb-20">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/add" element={<AddPurchasePage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
