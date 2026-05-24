import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { BarChart3, TrendingDown, Smile, Flame, Calendar as CalendarIcon, History } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { Card } from '../components/ui/Card'
import { ProgressHistoryItem } from '../components/features/ProgressHistoryItem'
import { api } from '../services/api'
import { registerKvitiTheme, KVITI_THEME_NAME, echarts } from '../lib/echartsTheme'
import type { ProgressLogDTO } from '@kvitifai/shared'

type Period = '7' | '30' | 'all'

const PAGE_SIZE = 20

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 dark:bg-slate-800/60 ${className}`} />
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

function formatDayHeader(iso: string) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' }).format(new Date(iso))
}

export function ProgressPage() {
  const [period, setPeriod] = useState<Period>('30')

  const [chartLogs, setChartLogs] = useState<ProgressLogDTO[]>([])
  const [chartLoading, setChartLoading] = useState(true)

  const [historyLogs, setHistoryLogs] = useState<ProgressLogDTO[]>([])
  const [historyPage, setHistoryPage] = useState(1)
  const [historyTotalPages, setHistoryTotalPages] = useState(1)
  const [historyLoading, setHistoryLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    registerKvitiTheme()
  }, [])

  useEffect(() => {
    setChartLoading(true)
    const limit = period === 'all' ? 200 : period === '30' ? 90 : 30
    api
      .get(`/progress/logs?limit=${limit}`)
      .then(({ data }) => setChartLogs(data.logs))
      .finally(() => setChartLoading(false))
  }, [period])

  useEffect(() => {
    setHistoryLogs([])
    setHistoryPage(1)
    setHistoryTotalPages(1)
  }, [period])

  const loadHistoryPage = useCallback(
    async (page: number) => {
      if (historyLoading) return
      setHistoryLoading(true)
      try {
        const { data } = await api.get(`/progress/logs?limit=${PAGE_SIZE}&page=${page}`)
        setHistoryLogs((prev) => (page === 1 ? data.logs : [...prev, ...data.logs]))
        setHistoryTotalPages(data.totalPages || 1)
        setHistoryPage(page)
      } finally {
        setHistoryLoading(false)
      }
    },
    [historyLoading],
  )

  useEffect(() => {
    void loadHistoryPage(1)
  }, [period])

  useEffect(() => {
    if (!sentinelRef.current) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && historyPage < historyTotalPages && !historyLoading) {
          void loadHistoryPage(historyPage + 1)
        }
      },
      { rootMargin: '200px' },
    )
    obs.observe(sentinelRef.current)
    return () => obs.disconnect()
  }, [historyPage, historyTotalPages, historyLoading, loadHistoryPage])

  const filtered = useMemo(() => {
    if (period === 'all') return chartLogs
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - parseInt(period))
    return chartLogs.filter((l) => new Date(l.date) >= cutoff)
  }, [chartLogs, period])

  const sortedAsc = useMemo(() => [...filtered].reverse(), [filtered])

  const summary = useMemo(() => {
    const checkins = filtered.filter((l) => l.type === 'DAILY_CHECKIN')
    const moods = checkins.filter((l) => l.mood != null).map((l) => l.mood!)
    const cravings = filtered.filter((l) => l.cravingLevel != null).map((l) => l.cravingLevel!)

    let bestStreak = 0
    let current = 0
    const asc = [...checkins].reverse()
    for (const c of asc) {
      if (!c.usedTobacco && c.cigarettesSmoked === 0) {
        current++
        bestStreak = Math.max(bestStreak, current)
      } else {
        current = 0
      }
    }

    return {
      avgMood: moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : '—',
      avgCraving: cravings.length ? (cravings.reduce((a, b) => a + b, 0) / cravings.length).toFixed(1) : '—',
      bestStreak,
      totalCheckins: checkins.length,
    }
  }, [filtered])

  const moodCravingOption = useMemo(() => {
    const dates = sortedAsc.filter((l) => l.mood != null || l.cravingLevel != null)
    const xs = dates.map((l) => dayKey(new Date(l.date)))
    const mood = dates.map((l) => (l.mood != null ? l.mood : null))
    const craving = dates.map((l) => (l.cravingLevel != null ? l.cravingLevel : null))

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(16,185,129,0.4)',
        textStyle: { color: '#e2e8f0' },
        formatter: (params: { axisValue: string; seriesName: string; value: number }[]) => {
          const moodEmoji = ['😞', '😕', '😐', '🙂', '😊']
          return params
            .map((p) => {
              if (p.seriesName === 'Настроение' && p.value != null) {
                return `${moodEmoji[(p.value as number) - 1] ?? '•'} <b>${p.seriesName}:</b> ${p.value}/5`
              }
              return `<b>${p.seriesName}:</b> ${p.value ?? '—'}${p.seriesName.includes('Тяга') ? '/10' : ''}`
            })
            .join('<br/>')
        },
      },
      legend: { data: ['Настроение', 'Тяга к курению'], top: 0, textStyle: { color: '#94a3b8' } },
      grid: { left: 30, right: 16, top: 36, bottom: 32 },
      xAxis: { type: 'category', boundaryGap: false, data: xs, axisLabel: { color: '#94a3b8', fontSize: 10 } },
      yAxis: [
        { type: 'value', min: 0, max: 5, splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } } },
        { type: 'value', min: 0, max: 10, splitLine: { show: false } },
      ],
      series: [
        {
          name: 'Настроение',
          type: 'line',
          smooth: 0.45,
          symbol: 'circle',
          symbolSize: 6,
          yAxisIndex: 0,
          lineStyle: { width: 3, color: '#10b981', shadowBlur: 10, shadowColor: 'rgba(16,185,129,0.5)' },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16,185,129,0.55)' },
              { offset: 1, color: 'rgba(16,185,129,0)' },
            ]),
          },
          data: mood,
        },
        {
          name: 'Тяга к курению',
          type: 'line',
          smooth: 0.45,
          symbol: 'circle',
          symbolSize: 6,
          yAxisIndex: 1,
          lineStyle: { width: 3, color: '#f43f5e', shadowBlur: 10, shadowColor: 'rgba(244,63,94,0.5)' },
          itemStyle: { color: '#f43f5e' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(244,63,94,0.45)' },
              { offset: 1, color: 'rgba(244,63,94,0)' },
            ]),
          },
          data: craving,
        },
      ],
    }
  }, [sortedAsc])

  const cigBarOption = useMemo(() => {
    const byDay = new Map<string, { cigs: number; relapse: boolean }>()
    for (const l of sortedAsc) {
      const k = dayKey(new Date(l.date))
      const prev = byDay.get(k) ?? { cigs: 0, relapse: false }
      prev.cigs += l.cigarettesSmoked || 0
      if (l.type === 'RELAPSE' || l.usedTobacco) prev.relapse = true
      byDay.set(k, prev)
    }
    const xs = Array.from(byDay.keys())
    const data = xs.map((k) => {
      const v = byDay.get(k)!
      return { value: v.cigs, itemStyle: { color: v.relapse ? '#f43f5e' : '#10b981' } }
    })

    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(16,185,129,0.4)',
        textStyle: { color: '#e2e8f0' },
      },
      grid: { left: 30, right: 16, top: 16, bottom: 32 },
      xAxis: { type: 'category', data: xs, axisLabel: { color: '#94a3b8', fontSize: 10 } },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } } },
      series: [
        {
          name: 'Сигареты / затяжки',
          type: 'bar',
          data,
          barWidth: '55%',
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            shadowBlur: 8,
            shadowColor: 'rgba(16,185,129,0.35)',
          },
        },
        {
          name: 'cap',
          type: 'pictorialBar',
          symbol: 'rect',
          symbolSize: ['55%', 6],
          symbolOffset: [0, -3],
          symbolPosition: 'end',
          z: 12,
          data: data.map((d) => ({
            value: d.value,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,255,255,0.45)' },
                { offset: 1, color: 'rgba(255,255,255,0.05)' },
              ]),
            },
          })),
          tooltip: { show: false },
        },
      ],
    }
  }, [sortedAsc])

  const heatmapOption = useMemo(() => {
    const end = new Date()
    end.setHours(0, 0, 0, 0)
    const start = new Date(end)
    start.setDate(end.getDate() - 89)

    const map = new Map<string, number>()
    for (const l of chartLogs) {
      const k = dayKey(new Date(l.date))
      if (l.type === 'RELAPSE' || l.usedTobacco) {
        map.set(k, -1)
      } else if (l.type === 'DAILY_CHECKIN') {
        if (map.get(k) !== -1) map.set(k, 1)
      }
    }

    const data: [string, number][] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const k = dayKey(d)
      data.push([k, map.get(k) ?? 0])
    }

    return {
      tooltip: {
        position: 'top',
        backgroundColor: 'rgba(15,23,42,0.95)',
        borderColor: 'rgba(16,185,129,0.4)',
        textStyle: { color: '#e2e8f0' },
        formatter: (p: { data: [string, number] }) => {
          const [date, val] = p.data
          const label = val === 1 ? 'Чистый день' : val === -1 ? 'Срыв' : 'Без чекина'
          return `${new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' }).format(new Date(date))}<br/><b>${label}</b>`
        },
      },
      visualMap: {
        show: false,
        type: 'piecewise',
        pieces: [
          { value: -1, color: '#f43f5e', label: 'Срыв' },
          { value: 0, color: 'rgba(148,163,184,0.18)', label: 'Без чекина' },
          { value: 1, color: '#10b981', label: 'Чистый' },
        ],
      },
      calendar: {
        top: 30,
        left: 30,
        right: 10,
        cellSize: ['auto', 16],
        range: [dayKey(start), dayKey(end)],
        itemStyle: { color: 'transparent', borderColor: 'rgba(148,163,184,0.08)', borderWidth: 1 },
        splitLine: { show: false },
        dayLabel: { color: '#94a3b8', fontSize: 10, nameMap: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'] },
        monthLabel: { color: '#94a3b8', fontSize: 10, nameMap: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'] },
        yearLabel: { show: false },
      },
      series: [{ type: 'heatmap', coordinateSystem: 'calendar', data, itemStyle: { borderRadius: 3 } }],
    }
  }, [chartLogs])

  const groupedHistory = useMemo(() => {
    const groups: { day: string; logs: ProgressLogDTO[] }[] = []
    for (const l of historyLogs) {
      const d = new Date(l.date)
      const k = dayKey(d)
      const last = groups[groups.length - 1]
      if (last && last.day === k) last.logs.push(l)
      else groups.push({ day: k, logs: [l] })
    }
    return groups
  }, [historyLogs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BarChart3 size={22} /> Прогресс
        </h2>
        <div className="flex bg-slate-100 dark:bg-slate-800/70 rounded-xl p-1">
          {([['7', '7д'], ['30', '30д'], ['all', 'Всё']] as [Period, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setPeriod(val)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                period === val ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="text-center py-3">
          <Smile size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-xl font-bold">{summary.avgMood}</p>
          <p className="text-xs text-slate-500">Ср. настроение</p>
        </Card>
        <Card className="text-center py-3">
          <TrendingDown size={20} className="mx-auto text-rose-400 mb-1" />
          <p className="text-xl font-bold">{summary.avgCraving}</p>
          <p className="text-xs text-slate-500">Ср. тяга к курению</p>
        </Card>
        <Card className="text-center py-3">
          <Flame size={20} className="mx-auto text-amber-500 mb-1" />
          <p className="text-xl font-bold">{summary.bestStreak}</p>
          <p className="text-xs text-slate-500">Лучшая серия</p>
        </Card>
        <Card className="text-center py-3">
          <CalendarIcon size={20} className="mx-auto text-teal-400 mb-1" />
          <p className="text-xl font-bold">{summary.totalCheckins}</p>
          <p className="text-xs text-slate-500">Отметок</p>
        </Card>
      </div>

      {chartLoading ? (
        <Skeleton className="h-56" />
      ) : (
        <>
          <Card>
            <h3 className="text-sm font-semibold mb-2">Настроение и тяга к курению</h3>
            <ReactECharts option={moodCravingOption} theme={KVITI_THEME_NAME} style={{ height: 240 }} notMerge lazyUpdate />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-2">Сигареты и затяжки за день</h3>
            <ReactECharts option={cigBarOption} theme={KVITI_THEME_NAME} style={{ height: 220 }} notMerge lazyUpdate />
          </Card>

          <Card>
            <h3 className="text-sm font-semibold mb-2">Серия чистых дней — 90 дней</h3>
            <ReactECharts option={heatmapOption} theme={KVITI_THEME_NAME} style={{ height: 200 }} notMerge lazyUpdate />
          </Card>
        </>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2"><History size={16} /> История</h3>

        {groupedHistory.length === 0 && !historyLoading && (
          <Card className="text-center py-8">
            <BarChart3 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Записей пока нет. Сделайте первую отметку!</p>
          </Card>
        )}

        {groupedHistory.map((g) => (
          <div key={g.day} className="space-y-2">
            <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
              <span>{formatDayHeader(g.day)}</span>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-300/40 to-transparent dark:from-white/10" />
            </div>
            {g.logs.map((log) => (
              <ProgressHistoryItem key={log.id} log={log} />
            ))}
          </div>
        ))}

        <div ref={sentinelRef} className="h-8 flex items-center justify-center">
          {historyLoading && <Skeleton className="h-8 w-32" />}
        </div>
      </div>
    </div>
  )
}
