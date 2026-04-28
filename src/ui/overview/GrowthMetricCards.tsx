import type { SignalOverviewViewModel } from './buildSignalOverviewViewModel'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { MetricCard } from '../shared/MetricCard'

type GrowthMetricCardsProps = {
  growth: SignalOverviewViewModel['growth']
  detailMode: UiDetailMode
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`

export const GrowthMetricCards = ({ growth, detailMode }: GrowthMetricCardsProps) => {
  const metrics = [
    {
      label: 'Assemblies',
      value: growth.assemblyCount.toString(),
      description: '点群がまとまりとして認識され始めた数',
      rawValue: growth.assemblyCount.toString(),
    },
    {
      label: 'Bridges',
      value: growth.bridgeCount.toString(),
      description: 'assemblies 間の結びつき',
      rawValue: growth.bridgeCount.toString(),
    },
    {
      label: 'Proto Seeds',
      value: growth.protoSeedCount.toString(),
      description: '意味未満の種として残った seed',
      rawValue: growth.protoSeedCount.toString(),
    },
    {
      label: 'Teacher-Free Bridges',
      value: growth.teacherFreeBridgeCount.toString(),
      description: 'teacher なしでも想起に成功し始めた bridge',
      rawValue: growth.teacherFreeBridgeCount.toString(),
    },
    {
      label: 'Recall Success',
      value: formatPercent(growth.recallSuccessRate),
      description: '自力想起の成功率',
      rawValue: growth.recallSuccessRate.toFixed(2),
    },
    {
      label: 'Teacher Dependency',
      value: formatPercent(growth.averageTeacherDependency),
      description: 'teacher への依存度',
      rawValue: growth.averageTeacherDependency.toFixed(2),
    },
    {
      label: 'Promotion Ready',
      value: growth.promotionReadyCandidates.toString(),
      description: '昇格候補として見られる seed / assembly / bridge',
      rawValue: growth.promotionReadyCandidates.toString(),
    },
  ]

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">Growth Metrics</p>
          <p className="mt-1 text-sm text-slate-300">成長状態をカードで要約</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            description={metric.description}
            toneClass="border-slate-800 bg-slate-950/90"
            meta={detailMode === 'research' ? <>raw: {metric.rawValue}</> : undefined}
          />
        ))}
      </div>
    </section>
  )
}
