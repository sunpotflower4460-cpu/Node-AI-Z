import type { ScenarioMetricViewModel } from './buildScenarioViewModel'

type ScenarioMetricCardsProps = {
  metrics: ScenarioMetricViewModel[]
}

const getMetricTone = (metric: ScenarioMetricViewModel): string => {
  const isGood = metric.goodDirection === 'up' ? metric.value > 0 : metric.value < 0
  const isNeutral = Math.abs(metric.value) < 0.01
  if (isNeutral) return 'border-slate-200 bg-white text-slate-600'
  if (isGood) return 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
  return 'border-amber-200 bg-amber-50/60 text-amber-700'
}

export const ScenarioMetricCards = ({ metrics }: ScenarioMetricCardsProps) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {metrics.map((metric) => (
      <div
        key={metric.label}
        className={`rounded-xl border p-3 ${getMetricTone(metric)}`}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{metric.label}</p>
        <p className="mt-1 text-2xl font-black">{metric.formatted}</p>
      </div>
    ))}
  </div>
)
