import type { SignalOverviewViewModel } from './buildSignalOverviewViewModel'
import type { UiDetailMode } from '../mode/modeUiTypes'
import { MetricCard } from '../shared/MetricCard'

type GrowthMetricCardsProps = {
  growth: SignalOverviewViewModel['growth']
  detailMode: UiDetailMode
  hasObservation?: boolean
}

const formatPercent = (value: number) => `${Math.round(value * 100)}%`

export const GrowthMetricCards = ({ growth, detailMode, hasObservation = true }: GrowthMetricCardsProps) => {
  if (!hasObservation) {
    return null
  }

  const metrics = [
    {
      simpleLabel: '成長した点群',
      researchLabel: 'Assemblies',
      value: growth.assemblyCount.toString(),
      description: '点群がまとまりとして認識され始めた数',
      rawValue: growth.assemblyCount.toString(),
    },
    {
      simpleLabel: '結びつき',
      researchLabel: 'Bridges',
      value: growth.bridgeCount.toString(),
      description: 'assemblies 間の結びつき',
      rawValue: growth.bridgeCount.toString(),
    },
    {
      simpleLabel: '意味の種',
      researchLabel: 'Proto Seeds',
      value: growth.protoSeedCount.toString(),
      description: '意味未満の種として残った seed',
      rawValue: growth.protoSeedCount.toString(),
    },
    {
      simpleLabel: 'Teacher-Free Bridges',
      researchLabel: 'Teacher-Free Bridges',
      value: growth.teacherFreeBridgeCount.toString(),
      description: 'teacher なしでも想起に成功し始めた bridge',
      rawValue: growth.teacherFreeBridgeCount.toString(),
    },
    {
      simpleLabel: '想起成功',
      researchLabel: 'Recall Success',
      value: formatPercent(growth.recallSuccessRate),
      description: '自力想起の成功率',
      rawValue: growth.recallSuccessRate.toFixed(2),
    },
    {
      simpleLabel: '先生への依存',
      researchLabel: 'Teacher Dependency',
      value: formatPercent(growth.averageTeacherDependency),
      description: 'teacher への依存度',
      rawValue: growth.averageTeacherDependency.toFixed(2),
    },
    {
      simpleLabel: '昇格候補',
      researchLabel: 'Promotion Ready',
      value: growth.promotionReadyCandidates.toString(),
      description: '昇格候補として見られる seed / assembly / bridge',
      rawValue: growth.promotionReadyCandidates.toString(),
    },
  ]

  const sectionLabel = detailMode === 'research' ? 'Growth Metrics' : '成長指標'

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{sectionLabel}</p>
          <p className="mt-1 text-sm text-slate-300">成長状態をカードで要約</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.researchLabel}
            label={detailMode === 'research' ? metric.researchLabel : metric.simpleLabel}
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
