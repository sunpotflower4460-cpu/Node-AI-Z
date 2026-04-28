import type { BridgeStageDistribution } from './buildTeacherDependencyViewModel'

type TeacherBridgeStageChartProps = {
  distribution: BridgeStageDistribution
}

const STAGE_CONFIG: Array<{
  key: keyof BridgeStageDistribution
  label: string
  colorClass: string
}> = [
  { key: 'tentative', label: 'tentative', colorClass: 'bg-slate-400' },
  { key: 'reinforced', label: 'reinforced', colorClass: 'bg-indigo-400' },
  { key: 'teacher_light', label: 'teacher_light', colorClass: 'bg-violet-500' },
  { key: 'teacher_free', label: 'teacher_free', colorClass: 'bg-emerald-500' },
  { key: 'promoted', label: 'promoted', colorClass: 'bg-amber-400' },
]

export const TeacherBridgeStageChart = ({ distribution }: TeacherBridgeStageChartProps) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Bridge Stage Distribution</h3>
      <div className="mt-4 space-y-3">
        {STAGE_CONFIG.map(({ key, label, colorClass }) => {
          const count = distribution[key]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{label}</span>
                <span className="text-slate-500">
                  {count} <span className="font-normal text-slate-400">({pct}%)</span>
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full transition-all ${colorClass}`}
                  style={{ width: total > 0 ? `${pct}%` : '0%' }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {total === 0 && (
        <p className="mt-3 text-xs text-slate-400">bridge がまだありません。</p>
      )}
    </div>
  )
}
