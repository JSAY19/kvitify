import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wind, Play, Square, RotateCcw, Sparkles, Shield, Moon, HeartPulse } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

type PhaseKind = 'inhale' | 'hold' | 'exhale' | 'hold2'

interface Phase {
  kind: PhaseKind
  seconds: number
  label: string
  hint: string
}

interface Technique {
  id: string
  name: string
  shortName: string
  description: string
  benefit: string
  icon: typeof Wind
  pattern: Phase[]
  cycles: number
}

const TECHNIQUES: Technique[] = [
  {
    id: 'basic',
    name: 'Базовое 4·4·4',
    shortName: '4·4·4',
    description: 'Три фазы по 4 секунды. Лёгкий старт.',
    benefit: 'Снижает тревогу за минуту',
    icon: Sparkles,
    pattern: [
      { kind: 'inhale', seconds: 4, label: 'Вдох', hint: 'Медленно через нос' },
      { kind: 'hold', seconds: 4, label: 'Задержка', hint: 'Плечи расслаблены' },
      { kind: 'exhale', seconds: 4, label: 'Выдох', hint: 'Медленно через рот' },
    ],
    cycles: 5,
  },
  {
    id: 'box',
    name: 'Box 4·4·4·4',
    shortName: '4·4·4·4',
    description: 'Квадратное дыхание Navy SEALs.',
    benefit: 'Концентрация и контроль',
    icon: Shield,
    pattern: [
      { kind: 'inhale', seconds: 4, label: 'Вдох', hint: 'Медленно через нос' },
      { kind: 'hold', seconds: 4, label: 'Задержка', hint: 'Тело неподвижно' },
      { kind: 'exhale', seconds: 4, label: 'Выдох', hint: 'Медленно через рот' },
      { kind: 'hold2', seconds: 4, label: 'Пауза', hint: 'Лёгкие пустые' },
    ],
    cycles: 4,
  },
  {
    id: '478',
    name: 'Метод 4·7·8',
    shortName: '4·7·8',
    description: 'Доктор Andrew Weil. Длинный выдох.',
    benefit: 'Сильная тяга к курению и сон',
    icon: Moon,
    pattern: [
      { kind: 'inhale', seconds: 4, label: 'Вдох', hint: 'Тихо через нос' },
      { kind: 'hold', seconds: 7, label: 'Задержка', hint: 'Расслабьтесь' },
      { kind: 'exhale', seconds: 8, label: 'Выдох', hint: 'Со звуком через рот' },
    ],
    cycles: 4,
  },
  {
    id: 'coherent',
    name: 'Когерентное 5·5',
    shortName: '5·5',
    description: 'Резонансное дыхание ~6 в минуту.',
    benefit: 'Баланс ВНС, HRV',
    icon: HeartPulse,
    pattern: [
      { kind: 'inhale', seconds: 5, label: 'Вдох', hint: 'Плавно и ровно' },
      { kind: 'exhale', seconds: 5, label: 'Выдох', hint: 'Плавно и ровно' },
    ],
    cycles: 6,
  },
]

const SCALE_BY_PHASE: Record<PhaseKind, number> = {
  inhale: 1,
  hold: 1,
  exhale: 0.55,
  hold2: 0.55,
}

const REST_SCALE = 0.55

function vibrate(ms: number) {
  try { navigator.vibrate?.(ms) } catch { /* noop */ }
}

export function BreathingPage() {
  const [techniqueId, setTechniqueId] = useState<string>('basic')
  const technique = TECHNIQUES.find((t) => t.id === techniqueId)!

  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [cycle, setCycle] = useState(0)
  const [remaining, setRemaining] = useState(technique.pattern[0]!.seconds)

  const phaseRef = useRef(0)
  const cycleRef = useRef(0)
  const deadlineRef = useRef(0)

  const reset = useCallback(() => {
    setRunning(false)
    setFinished(false)
    setPhaseIdx(0)
    setCycle(0)
    setRemaining(technique.pattern[0]!.seconds)
    phaseRef.current = 0
    cycleRef.current = 0
  }, [technique])

  useEffect(() => { reset() }, [techniqueId, reset])

  const handleStart = () => {
    phaseRef.current = 0
    cycleRef.current = 0
    setPhaseIdx(0)
    setCycle(0)
    setFinished(false)
    deadlineRef.current = Date.now() + technique.pattern[0]!.seconds * 1000
    setRemaining(technique.pattern[0]!.seconds)
    setRunning(true)
    vibrate(30)
  }

  useEffect(() => {
    if (!running) return
    const tick = () => {
      const phase = technique.pattern[phaseRef.current]!
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (Date.now() < deadlineRef.current) return

      if (phaseRef.current < technique.pattern.length - 1) {
        phaseRef.current += 1
        setPhaseIdx(phaseRef.current)
        const next = technique.pattern[phaseRef.current]!
        deadlineRef.current = Date.now() + next.seconds * 1000
        setRemaining(next.seconds)
        vibrate(20)
        return
      }

      if (cycleRef.current + 1 >= technique.cycles) {
        setRunning(false)
        setFinished(true)
        vibrate([40, 60, 40])
        return
      }

      cycleRef.current += 1
      phaseRef.current = 0
      setCycle(cycleRef.current)
      setPhaseIdx(0)
      const first = technique.pattern[0]!
      deadlineRef.current = Date.now() + first.seconds * 1000
      setRemaining(first.seconds)
      vibrate(20)
      void phase
    }
    const id = window.setInterval(tick, 100)
    return () => window.clearInterval(id)
  }, [running, technique])

  const current = technique.pattern[phaseIdx]!
  const targetScale = running ? SCALE_BY_PHASE[current.kind] : REST_SCALE
  const transitionDuration = running ? current.seconds : 0.6
  const totalSec = technique.pattern.reduce((a, p) => a + p.seconds, 0) * technique.cycles

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wind className="text-primary-500 shrink-0" aria-hidden />
          Дыхательные практики
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Подбери практику под состояние. Дыхание даёт нервной системе «якорь» и помогает пережить тягу к курению.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TECHNIQUES.map((t) => {
          const Icon = t.icon
          const active = t.id === techniqueId
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTechniqueId(t.id)}
              aria-pressed={active}
              className={`group text-left rounded-2xl p-3 border transition-all ${
                active
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30 shadow-md'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className={`mb-2 inline-flex w-9 h-9 rounded-xl items-center justify-center ${
                active
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow shadow-emerald-500/40'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <Icon size={18} />
              </div>
              <p className="text-sm font-semibold leading-tight">{t.shortName}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{t.benefit}</p>
            </button>
          )
        })}
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="font-semibold text-base">{technique.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{technique.description}</p>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <p>{technique.cycles} циклов</p>
            <p className="font-mono">~{Math.round(totalSec / 60)} мин {totalSec % 60}с</p>
          </div>
        </div>

        <div className="relative mx-auto my-6 w-[min(100%,320px)] aspect-square flex items-center justify-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300/40 via-teal-300/30 to-emerald-400/40 dark:from-emerald-500/30 dark:via-teal-500/20 dark:to-emerald-400/30 blur-3xl"
            animate={{ scale: targetScale * 1.15, opacity: running ? 0.9 : 0.5 }}
            transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/60 to-teal-300/60 dark:from-emerald-500/40 dark:to-teal-500/40 blur-xl"
            animate={{ scale: targetScale * 1.05 }}
            transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          />

          <motion.div
            className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 shadow-2xl shadow-emerald-500/40 ring-1 ring-white/30 dark:ring-white/10"
            animate={{ scale: targetScale }}
            transition={{ duration: transitionDuration, ease: 'easeInOut' }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
            {finished ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-white drop-shadow"
              >
                <p className="text-2xl font-bold">Готово</p>
                <p className="text-sm opacity-90 mt-1">Прислушайся к себе</p>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${cycle}-${phaseIdx}-${running}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="text-white drop-shadow"
                >
                  <p className="text-sm font-medium uppercase tracking-widest opacity-90">{current.label}</p>
                  <p
                    className="text-6xl sm:text-7xl font-bold tabular-nums leading-none mt-2"
                    aria-live="polite"
                    aria-atomic
                  >
                    {running ? remaining : current.seconds}
                  </p>
                  <p className="text-xs opacity-80 mt-2 max-w-[10rem] mx-auto">{current.hint}</p>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {running && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Цикл {cycle + 1} из {technique.cycles}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">{current.label}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-[width] duration-300"
                style={{ width: `${((cycle + (phaseIdx + 1) / technique.pattern.length) / technique.cycles) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {!running && !finished && (
            <Button size="lg" onClick={handleStart} className="min-w-[180px]">
              <Play size={20} aria-hidden /> Начать
            </Button>
          )}
          {running && (
            <Button size="lg" variant="secondary" onClick={reset} className="min-w-[180px]">
              <Square size={20} aria-hidden /> Остановить
            </Button>
          )}
          {finished && (
            <>
              <Button size="lg" onClick={handleStart} className="min-w-[160px]">
                <RotateCcw size={20} aria-hidden /> Повторить
              </Button>
              <Button size="lg" variant="secondary" onClick={reset} className="min-w-[160px]">
                Готово
              </Button>
            </>
          )}
        </div>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-semibold text-sm">Как это помогает</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          При тяге к курению активируется симпатическая нервная система. Медленное диафрагмальное дыхание
          (особенно с удлинённым выдохом) переключает тело в парасимпатический режим за 1–2 минуты.
          Это не замена медицинской помощи, но проверенный приём саморегуляции.
        </p>
      </Card>
    </div>
  )
}
