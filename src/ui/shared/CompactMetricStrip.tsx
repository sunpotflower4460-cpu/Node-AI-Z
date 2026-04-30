import { CompactMetricCard } from './CompactMetricCard'

export type CompactMetricItem = {
  id: string
  label: string
  researchLabel?: string
  value: string | number
  helper: string
  status?: 'empty' | 'normal' | 'good' | 'warning'
}

type CompactMetricStripProps = {
  metrics: CompactMetricItem[]
  researchMode?: boolean
  columns?: 2 | 3 | 4
}

export const CompactMetricStrip = ({
  metrics,
  researchMode = false,
  columns = 2,
}: CompactMetricStripProps) => {
  const colClass =
    columns === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : columns === 3
        ? 'grid-cols-2 sm:grid-cols-3'
        : 'grid-cols-2'

  return (
    <div className={`grid gap-2 ${colClass}`}>
      {metrics.map((metric) => (
        <CompactMetricCard
          key={metric.id}
          label={researchMode && metric.researchLabel ? metric.researchLabel : metric.label}
          value={metric.value}
          helper={metric.helper}
          status={metric.status}
        />
      ))}
    </div>
  )
}
