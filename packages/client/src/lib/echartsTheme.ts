import * as echarts from 'echarts/core'
import {
  LineChart,
  BarChart,
  HeatmapChart,
  PictorialBarChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CalendarComponent,
  VisualMapComponent,
  DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  LineChart,
  BarChart,
  HeatmapChart,
  PictorialBarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CalendarComponent,
  VisualMapComponent,
  DataZoomComponent,
  CanvasRenderer,
])

export const KVITI_THEME_NAME = 'kviti-emerald'

let registered = false

export function registerKvitiTheme() {
  if (registered) return
  echarts.registerTheme(KVITI_THEME_NAME, {
    color: ['#10b981', '#22d3ee', '#a78bfa', '#f43f5e', '#facc15', '#34d399'],
    backgroundColor: 'transparent',
    textStyle: { color: '#cbd5e1', fontFamily: 'inherit' },
    title: { textStyle: { color: '#e2e8f0' } },
    legend: { textStyle: { color: '#94a3b8' } },
    axisPointer: { lineStyle: { color: '#10b981' } },
    grid: { borderColor: 'rgba(148,163,184,0.1)' },
    categoryAxis: {
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.25)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
    },
    valueAxis: {
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.25)' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.08)' } },
    },
  })
  registered = true
}

export { echarts }
