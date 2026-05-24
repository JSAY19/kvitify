import { useEffect, useState } from 'react'
import {
  Trophy, Shield, Star, Flame, Calendar, Crown, Award,
  Sunrise, Wallet, Banknote, PiggyBank, Zap, Target, Medal, ClipboardCheck,
  type LucideIcon,
} from 'lucide-react'
import { AchievementCard } from '../components/features/AchievementCard'
import { api } from '../services/api'

interface Achievement {
  type: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy, Shield, Star, Flame, Calendar, Crown, Award,
  Sunrise, Wallet, Banknote, PiggyBank, Zap, Target, Medal, ClipboardCheck,
}

export function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/achievements')
      .then((r) => setAchievements(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
        ))}
      </div>
    )
  }

  const unlocked = achievements.filter((a) => a.unlocked)
  const locked = achievements.filter((a) => !a.unlocked)
  const progress = achievements.length
    ? Math.round((unlocked.length / achievements.length) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Достижения</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Разблокировано {unlocked.length} из {achievements.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            {progress}%
          </p>
        </div>
      </div>

      <div className="h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 transition-[width] duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {unlocked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Получено
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {unlocked.map((a, i) => (
              <AchievementCard
                key={a.type}
                icon={ICON_MAP[a.icon] ?? Trophy}
                title={a.title}
                description={a.description}
                unlocked
                unlockedAt={a.unlockedAt}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {locked.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Заблокировано
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {locked.map((a, i) => (
              <AchievementCard
                key={a.type}
                icon={ICON_MAP[a.icon] ?? Trophy}
                title={a.title}
                description={a.description}
                unlocked={false}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
