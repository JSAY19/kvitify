import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  points: number
}

export function PointsBadge({ points }: Props) {
  return (
    <Link
      to="/progress"
      aria-label={`Баллы: ${points}`}
      className="group relative inline-flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-500/25 dark:via-emerald-400/15 dark:to-teal-500/25 ring-1 ring-emerald-600/60 dark:ring-emerald-400/40 shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 hover:ring-emerald-500/80 dark:hover:ring-emerald-400/70 transition-all"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-400/30 blur-md opacity-50 group-hover:opacity-80 transition-opacity" aria-hidden />
      <Sparkles className="w-3.5 h-3.5 text-white dark:text-emerald-300 relative drop-shadow" />
      <div className="relative h-4 min-w-[1.25rem] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={points}
            initial={{ y: 10, opacity: 0, scale: 0.7 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="block text-xs font-bold leading-4 text-white dark:text-emerald-100 tabular-nums drop-shadow"
          >
            {points}
          </motion.span>
        </AnimatePresence>
      </div>
    </Link>
  )
}
