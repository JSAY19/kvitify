import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { Sparkles, RefreshCw, HeartPulse, AlertCircle } from 'lucide-react'
import { Card } from '../ui/Card'
import { api } from '../../services/api'

interface HealthStats {
  daysWithoutSmoking: number
  streak: number
  moneySaved: number
  cigarettesAvoided: number
}

interface HealthResponse {
  date: string
  content: string
  stats: HealthStats
  cached: boolean
}

export function DailyHealthCard() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReport = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const { data } = await api.get<HealthResponse>('/health/daily')
      setData(data)
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg || 'AI временно недоступен. Попробуй обновить позже.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void fetchReport(false)
  }, [])

  const today = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date())

  return (
    <Card className="relative overflow-hidden p-5 bg-gradient-to-br from-emerald-500/15 via-teal-500/8 to-transparent dark:from-emerald-500/10 dark:via-teal-500/5 ring-1 ring-emerald-500/30 dark:ring-emerald-400/20">
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-12 w-48 h-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
              <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Твоё здоровье сегодня
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{today}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchReport(true)}
          disabled={loading || refreshing}
          aria-label="Обновить отчёт"
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 rounded bg-slate-200/40 dark:bg-slate-700/60 w-full" />
          <div className="h-3 rounded bg-slate-200/40 dark:bg-slate-700/60 w-11/12" />
          <div className="h-3 rounded bg-slate-200/40 dark:bg-slate-700/60 w-10/12" />
          <div className="h-3 rounded bg-slate-200/40 dark:bg-slate-700/60 w-9/12" />
          <div className="h-3 rounded bg-slate-200/40 dark:bg-slate-700/60 w-11/12" />
        </div>
      )}

      {!loading && error && (
        <div className="relative flex flex-col items-center gap-3 py-4 text-center">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 ring-1 ring-rose-500/30 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 max-w-xs">{error}</p>
          <button
            type="button"
            onClick={() => void fetchReport(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Попробовать ещё раз
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed prose-strong:text-emerald-700 dark:prose-strong:text-emerald-300 prose-strong:font-semibold prose-p:my-2">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{data.content}</ReactMarkdown>
          </div>

          <div className="relative mt-4 flex flex-wrap gap-1.5 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300 ring-1 ring-emerald-500/30">
              {data.stats.daysWithoutSmoking} дн. без курения
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-teal-500/15 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300 ring-1 ring-teal-500/30">
              серия {data.stats.streak}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300 ring-1 ring-amber-500/30">
              {Math.round(data.stats.moneySaved)} ₽
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-500/15 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300 ring-1 ring-rose-500/30">
              −{data.stats.cigarettesAvoided} сигарет
            </span>
          </div>
        </>
      )}
    </Card>
  )
}
