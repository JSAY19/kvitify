import { Check, Cigarette, Wind, Zap, Flag } from 'lucide-react'
import type { ProgressLogDTO } from '@kvitifai/shared'

interface Props {
  log: ProgressLogDTO
}

const MOOD_EMOJI = ['😞', '😕', '😐', '🙂', '😊']

function badge(log: ProgressLogDTO) {
  if (log.type === 'RELAPSE' || log.usedTobacco) {
    if (log.substanceType === 'VAPE') {
      return {
        Icon: Wind,
        label: `Срыв: вейп${log.cigarettesSmoked ? ` × ${log.cigarettesSmoked}` : ''}`,
        cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-rose-500/30',
      }
    }
    return {
      Icon: Cigarette,
      label: `Срыв: сигареты${log.cigarettesSmoked ? ` × ${log.cigarettesSmoked}` : ''}`,
      cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 ring-rose-500/30',
    }
  }
  if (log.type === 'CRAVING') {
    return {
      Icon: Zap,
      label: 'Тяга к курению',
      cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 ring-amber-500/30',
    }
  }
  if (log.type === 'MILESTONE') {
    return {
      Icon: Flag,
      label: 'Веха',
      cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-violet-500/30',
    }
  }
  return {
    Icon: Check,
    label: 'Чистый день',
    cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 ring-emerald-500/30',
  }
}

export function ProgressHistoryItem({ log }: Props) {
  const b = badge(log)
  const time = new Date(log.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex gap-3 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 ring-1 ring-slate-200/60 dark:ring-white/5 hover:ring-emerald-500/30 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ${b.cls}`}>
        <b.Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ring-1 ${b.cls}`}>
            {b.label}
          </span>
          <span className="text-xs text-slate-400">{time}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
          {log.mood != null && (
            <span className="inline-flex items-center gap-1">
              <span className="text-base leading-none">{MOOD_EMOJI[log.mood - 1] ?? '😐'}</span>
              <span>{log.mood}/5</span>
            </span>
          )}
          {log.cravingLevel != null && (
            <span className="inline-flex items-center gap-1.5">
              <span>Тяга</span>
              <span className="relative inline-block w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 to-rose-400"
                  style={{ width: `${(log.cravingLevel / 10) * 100}%` }}
                />
              </span>
              <span>{log.cravingLevel}/10</span>
            </span>
          )}
        </div>
        {log.notes && (
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 break-words">{log.notes}</p>
        )}
      </div>
    </div>
  )
}
