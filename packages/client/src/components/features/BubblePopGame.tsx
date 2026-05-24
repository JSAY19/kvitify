import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Trophy } from 'lucide-react'

interface Bubble {
  id: number
  x: number
  y: number
  size: number
  duration: number
  scored: boolean
}

const GAME_DURATION = 60
const SPAWN_INTERVAL = 700
const COLORS = [
  'from-emerald-400 to-teal-500',
  'from-teal-400 to-cyan-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-sky-400 to-indigo-500',
]

interface BubblePopGameProps {
  onFinish?: () => void
}

export function BubblePopGame({ onFinish }: BubblePopGameProps) {
  const [status, setStatus] = useState<'idle' | 'playing' | 'finished'>('idle')
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [score, setScore] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(GAME_DURATION)
  const fieldRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(0)

  const handleStart = useCallback(() => {
    setStatus('playing')
    setScore(0)
    setSecondsLeft(GAME_DURATION)
    setBubbles([])
  }, [])

  useEffect(() => {
    if (status !== 'playing') return

    const timer = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [status])

  useEffect(() => {
    if (status === 'playing' && secondsLeft === 0) {
      setStatus('finished')
    }
  }, [secondsLeft, status])

  useEffect(() => {
    if (status !== 'playing') return
    const spawner = window.setInterval(() => {
      const field = fieldRef.current
      if (!field) return
      const w = field.clientWidth
      const h = field.clientHeight
      const size = 50 + Math.random() * 40
      setBubbles((prev) => [
        ...prev.slice(-12),
        {
          id: nextId.current++,
          x: Math.random() * (w - size),
          y: Math.random() * (h - size),
          size,
          duration: 2.5 + Math.random() * 1.5,
          scored: false,
        },
      ])
    }, SPAWN_INTERVAL)

    return () => window.clearInterval(spawner)
  }, [status])

  const handlePop = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id))
    setScore((s) => s + 1)
  }

  const handleExpire = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/10">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Счёт</p>
          <p className="text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">Время</p>
          <p className={`text-3xl font-bold tabular-nums ${secondsLeft <= 10 && status === 'playing' ? 'text-rose-500' : ''}`}>
            {secondsLeft}
          </p>
        </div>
      </div>

      <div
        ref={fieldRef}
        className="relative w-full aspect-[3/4] sm:aspect-square rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-500/20 overflow-hidden select-none touch-manipulation"
      >
        {status === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-6">
            <p className="text-xl font-bold">Лопай пузыри 60 секунд</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs">
              Тапай по пузырям, чтобы лопнуть их. Чем больше — тем лучше отвлекает.
            </p>
            <button
              type="button"
              onClick={handleStart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-transform"
            >
              <Play size={18} /> Старт
            </button>
          </div>
        )}

        <AnimatePresence>
          {status === 'playing' &&
            bubbles.map((b) => {
              const color = COLORS[b.id % COLORS.length]
              return (
                <motion.button
                  key={b.id}
                  type="button"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.6, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onAnimationComplete={() => {
                    window.setTimeout(() => handleExpire(b.id), b.duration * 1000)
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    handlePop(b.id)
                  }}
                  aria-label="Лопнуть пузырь"
                  className={`absolute rounded-full bg-gradient-to-br ${color} shadow-lg ring-2 ring-white/40 cursor-pointer`}
                  style={{
                    left: b.x,
                    top: b.y,
                    width: b.size,
                    height: b.size,
                  }}
                >
                  <span className="absolute inset-2 rounded-full bg-white/20 blur-sm pointer-events-none" />
                </motion.button>
              )
            })}
        </AnimatePresence>

        {status === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md"
          >
            <Trophy size={48} className="text-amber-500" />
            <p className="text-2xl font-bold">Время вышло!</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Ты лопнул <span className="font-bold text-emerald-600 dark:text-emerald-400">{score}</span> пузырей и отвлёкся от тяги к курению.
            </p>
            <div className="flex flex-wrap gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleStart}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-sm font-medium hover:bg-slate-200 dark:hover:bg-white/15 transition-colors"
              >
                <RotateCcw size={14} /> Ещё раз
              </button>
              {onFinish && (
                <button
                  type="button"
                  onClick={onFinish}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-sm font-semibold shadow hover:scale-105 transition-transform"
                >
                  Готово
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
