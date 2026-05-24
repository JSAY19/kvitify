import { useState, type FormEvent } from 'react'
import { Cigarette, Wind, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useProgressStore } from '../../stores/progressStore'

interface Props {
  open: boolean
  onClose: () => void
}

type SubstanceType = 'CIGARETTE' | 'VAPE'

export function CheckinModal({ open, onClose }: Props) {
  const submitCheckin = useProgressStore((s) => s.submitCheckin)
  const fetchDashboard = useProgressStore((s) => s.fetchDashboard)

  const [usedTobacco, setUsedTobacco] = useState(false)
  const [substanceType, setSubstanceType] = useState<SubstanceType>('CIGARETTE')
  const [count, setCount] = useState(0)
  const [mood, setMood] = useState(3)
  const [cravingLevel, setCravingLevel] = useState(3)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const moods = ['😞', '😕', '😐', '🙂', '😊']

  const reset = () => {
    setUsedTobacco(false)
    setSubstanceType('CIGARETTE')
    setCount(0)
    setMood(3)
    setCravingLevel(3)
    setNotes('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await submitCheckin({
        mood,
        cravingLevel,
        cigarettesSmoked: usedTobacco ? count : 0,
        notes: notes || undefined,
        usedTobacco,
        substanceType: usedTobacco ? substanceType : undefined,
      })
      await fetchDashboard()

      if (usedTobacco) {
        toast('Серия сброшена — не сдавайся, ты сильнее этого', { icon: '💪' })
      } else if (res.pointsAwarded > 0) {
        toast.success(`+${res.pointsAwarded} баллов! Чистый день засчитан`)
      }

      if (res.newAchievements?.length) {
        toast.success(`Новое достижение разблокировано! (+50)`, { icon: '🏆' })
      }

      onClose()
      reset()
    } catch {
      toast.error('Не удалось сохранить отметку')
    } finally {
      setLoading(false)
    }
  }

  const unitLabel = substanceType === 'VAPE' ? 'затяжек' : 'сигарет'

  return (
    <Modal open={open} onClose={onClose} title="Ежедневная отметка">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/60">
          <button
            type="button"
            onClick={() => setUsedTobacco(false)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              !usedTobacco
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/40'
            }`}
          >
            <Check className="w-4 h-4" /> Чистый день
          </button>
          <button
            type="button"
            onClick={() => setUsedTobacco(true)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              usedTobacco
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/40'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Сорвался
          </button>
        </div>

        {usedTobacco && (
          <div className="space-y-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <div>
              <label className="block text-sm font-medium mb-2">Что курил</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSubstanceType('CIGARETTE')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    substanceType === 'CIGARETTE'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/40'
                      : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Cigarette className="w-4 h-4" /> Сигареты
                </button>
                <button
                  type="button"
                  onClick={() => setSubstanceType('VAPE')}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    substanceType === 'VAPE'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/40'
                      : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60'
                  }`}
                >
                  <Wind className="w-4 h-4" /> Вейп
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Сколько {unitLabel}: {count}</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCount(Math.max(0, count - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold"
                >
                  −
                </button>
                <span className="text-2xl font-bold flex-1 text-center">{count}</span>
                <button
                  type="button"
                  onClick={() => setCount(count + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Настроение</label>
          <div className="flex justify-between">
            {moods.map((emoji, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setMood(i + 1)}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  mood === i + 1 ? 'bg-emerald-500/15 scale-110 ring-1 ring-emerald-500/40' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Уровень тяги к курению: {cravingLevel}/10</label>
          <input
            type="range"
            min="0"
            max="10"
            value={cravingLevel}
            onChange={(e) => setCravingLevel(parseInt(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Нет тяги к курению</span>
            <span>Сильная тяга к курению</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Заметки</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Как прошёл день..."
          />
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Сохранить
        </Button>
      </form>
    </Modal>
  )
}
