import { motion, type Variants } from 'framer-motion'
import { Lock, type LucideIcon } from 'lucide-react'

interface AchievementCardProps {
  icon: LucideIcon
  title: string
  description: string
  unlocked: boolean
  unlockedAt?: string | null
  index?: number
}

const cardVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -6, scale: 1.03 },
}

const iconVariants: Variants = {
  rest: { rotate: 0, scale: 1 },
  hover: {
    rotate: [0, -12, 12, -6, 0],
    scale: 1.15,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
}

const lockedCardVariants: Variants = {
  rest: { y: 0, scale: 1 },
  hover: { y: -2, scale: 1.01 },
}

const lockedIconVariants: Variants = {
  rest: { rotate: 0, scale: 1 },
  hover: { rotate: [0, -6, 6, 0], scale: 1.08, transition: { duration: 0.5 } },
}

export function AchievementCard({
  icon: Icon,
  title,
  description,
  unlocked,
  unlockedAt,
  index = 0,
}: AchievementCardProps) {
  if (!unlocked) {
    return (
      <motion.div
        initial="rest"
        animate="rest"
        whileHover="hover"
        variants={lockedCardVariants}
        transition={{ delay: index * 0.03, type: 'spring', stiffness: 220, damping: 20 }}
        className="group relative rounded-2xl p-5 text-center bg-emerald-950/20 dark:bg-emerald-950/30 border border-white/5 dark:border-white/5 opacity-70 hover:opacity-100 transition-opacity"
      >
        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900/30 dark:bg-emerald-900/40 flex items-center justify-center mb-2 ring-1 ring-white/5">
          <motion.div variants={lockedIconVariants}>
            <Lock size={22} className="text-emerald-400/60 dark:text-emerald-300/50" />
          </motion.div>
        </div>
        <p className="font-semibold text-sm text-slate-600 dark:text-slate-300">{title}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{description}</p>
      </motion.div>
    )
  }

  const date = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
    : null

  return (
    <motion.div
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={cardVariants}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 220, damping: 18 }}
      className="group relative rounded-2xl p-[2px] bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 shadow-lg shadow-emerald-500/20 dark:shadow-md hover:shadow-2xl hover:shadow-emerald-500/40 transition-shadow"
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 opacity-30 dark:opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500 pointer-events-none" />

      <div className="relative rounded-[14px] overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-teal-100 dark:from-emerald-950/40 dark:via-zinc-900 dark:to-teal-950/40 p-5 text-center">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white dark:via-white/30 to-transparent" />
        <div className="absolute -top-12 -right-10 w-32 h-32 rounded-full bg-emerald-400/20 dark:bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-teal-400/20 dark:bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/70 dark:via-emerald-300/15 to-transparent pointer-events-none" />

        <div className="relative mx-auto mb-3 w-16 h-16">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300 to-teal-400 blur-md opacity-70"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            variants={iconVariants}
            className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/60 ring-2 ring-white dark:ring-emerald-200/30"
          >
            <Icon size={28} className="text-white drop-shadow" />
          </motion.div>
        </div>

        <p className="relative font-bold text-sm text-slate-900 dark:text-emerald-50">{title}</p>
        <p className="relative text-xs text-slate-700 dark:text-slate-400 mt-1 leading-snug">{description}</p>

        {date && (
          <span className="relative inline-flex items-center gap-1 mt-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300 ring-1 ring-emerald-500/40">
            ★ {date}
          </span>
        )}
      </div>
    </motion.div>
  )
}
