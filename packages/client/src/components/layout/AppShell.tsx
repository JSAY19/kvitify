import { useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { BottomNav } from './BottomNav'
import { useUIStore } from '../../stores/uiStore'
import { useProgressStore } from '../../stores/progressStore'
import { useAuthStore } from '../../stores/authStore'
import { PointsBadge } from '../features/PointsBadge'

export function AppShell() {
  const { darkMode, toggleDarkMode } = useUIStore()
  const isAuthed = useAuthStore((s) => !!s.user)
  const points = useProgressStore((s) => s.dashboard?.points ?? 0)
  const fetchDashboard = useProgressStore((s) => s.fetchDashboard)
  const hasDashboard = useProgressStore((s) => !!s.dashboard)

  useEffect(() => {
    if (isAuthed && !hasDashboard) void fetchDashboard()
  }, [isAuthed, hasDashboard, fetchDashboard])

  return (
    <div className="min-h-screen min-h-[100dvh] pb-20">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <Link
            to="/"
            aria-label="КвитиФай — на главную"
            className="group inline-flex items-center gap-2.5 mt-2 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 rounded-lg transition-transform active:scale-[0.98]"
          >
            <span className="relative inline-flex">
              <span
                aria-hidden
                className="absolute inset-0 -m-1.5 rounded-full bg-emerald-400/40 blur-lg opacity-60 group-hover:opacity-95 transition-opacity"
              />
              <img
                src="/icons/logo.png"
                alt=""
                draggable={false}
                className="relative w-10 h-10 object-contain drop-shadow-[0_4px_12px_rgba(16,185,129,0.6)] select-none"
              />
            </span>
            <span className="font-logo text-xl sm:text-2xl leading-none bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 dark:from-emerald-300 dark:via-emerald-400 dark:to-teal-300 bg-clip-text text-transparent drop-shadow-[0_1px_8px_rgba(16,185,129,0.25)]">
              КВИТИФАЙ
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {isAuthed && <PointsBadge points={points} />}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Переключить тему"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
