import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, MessageCircle, Wind, Check, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProgressStore } from '../stores/progressStore'
import { BubblePopGame } from '../components/features/BubblePopGame'

type Mode = 'choose' | 'game'

const TIPS = [
  'Тяга к курению — это волна. Она нарастает, держится 60–90 секунд и спадает.',
  'Сделай 10 глубоких вдохов. Тело перезагрузится.',
  'Выпей стакан холодной воды маленькими глотками.',
  'Встань и пройди 50 шагов. Движение разрывает цикл.',
  'Прижми кулак к ладони на 10 секунд. Снимет напряжение.',
]

export function CravingPage() {
  const navigate = useNavigate()
  const submitCraving = useProgressStore((s) => s.submitCraving)
  const [mode, setMode] = useState<Mode>('choose')
  const [secondsLeft, setSecondsLeft] = useState(90)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])

  useEffect(() => {
    submitCraving({ cravingLevel: 7 }).catch(() => {})
  }, [submitCraving])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft])

  const handleDone = () => {
    toast.success('Молодец, ты пережил тягу к курению!')
    navigate('/')
  }

  const handleChat = () => navigate('/chat?cravingHelp=1')
  const handleBreathing = () => navigate('/breathing')

  if (mode === 'game') {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => setMode('choose')}
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft size={16} /> Назад
        </button>
        <BubblePopGame onFinish={handleDone} />
      </div>
    )
  }

  const progress = ((90 - secondsLeft) / 90) * 100
  const passed = secondsLeft === 0

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Держись, ты сильнее</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Выбери, что поможет прямо сейчас
        </p>
      </div>

      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-600/15 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-emerald-700/25 border border-emerald-500/20 dark:border-emerald-400/15">
        <motion.div
          aria-hidden
          className="absolute -inset-10 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative flex items-center gap-4 sm:gap-6">
          <motion.div
            className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 ring-1 ring-white/30"
            animate={{ scale: passed ? 1 : [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: passed ? 0 : Infinity, ease: 'easeInOut' }}
          >
            <span className="text-3xl font-bold tabular-nums">{secondsLeft}</span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest text-emerald-700 dark:text-emerald-300 font-semibold">
              {passed ? 'Волна прошла' : 'Тяга к курению длится около 90 секунд'}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-200 mt-1.5">{tip}</p>
            <div className="mt-3 h-1.5 rounded-full bg-emerald-100/40 dark:bg-emerald-950/40 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard
          icon={<Gamepad2 size={28} />}
          title="Мини-игра"
          subtitle="Лопай пузыри, отвлекись на 60 секунд"
          color="from-amber-400 to-orange-500"
          onClick={() => setMode('game')}
        />
        <ActionCard
          icon={<MessageCircle size={28} />}
          title="Поговорить с Квити"
          subtitle="ИИ поддержит и подскажет что делать"
          color="from-emerald-400 to-teal-500"
          onClick={handleChat}
        />
        <ActionCard
          icon={<Wind size={28} />}
          title="Дыхание 4-7-8"
          subtitle="Длинный выдох снимает тягу к курению"
          color="from-sky-400 to-cyan-500"
          onClick={handleBreathing}
        />
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={handleDone}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900/70 border border-slate-200 dark:border-white/10 text-sm font-medium hover:border-emerald-400 dark:hover:border-emerald-500/50 transition-colors"
        >
          <Check size={18} className="text-emerald-500" /> Я справился
        </button>
      </div>
    </div>
  )
}

interface ActionCardProps {
  icon: React.ReactNode
  title: string
  subtitle: string
  color: string
  onClick: () => void
}

function ActionCard({ icon, title, subtitle, color, onClick }: ActionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="group relative text-left rounded-3xl p-5 bg-white dark:bg-zinc-900/70 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-transparent hover:shadow-xl hover:shadow-emerald-500/10 transition-all"
    >
      <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white items-center justify-center shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="font-bold text-base">{title}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{subtitle}</p>
    </motion.button>
  )
}
