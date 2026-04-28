type TeacherDependencyMeterProps = {
  value: number
}

export const TeacherDependencyMeter = ({ value }: TeacherDependencyMeterProps) => {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100)
  const isHigh = pct > 60
  const barClass = isHigh ? 'bg-purple-500' : pct > 30 ? 'bg-violet-400' : 'bg-emerald-400'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-700">Teacher Dependency</h3>
        <span className={`text-2xl font-black ${isHigh ? 'text-purple-600' : 'text-emerald-600'}`}>
          {pct}%
        </span>
      </div>
      <div className="mt-3 h-3 w-full rounded-full bg-slate-200">
        <div
          className={`h-3 rounded-full transition-all ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        低いほど、Signal Mode が teacher なしで想起・結合できる状態に近づいています。
      </p>
      {isHigh && (
        <p className="mt-2 text-xs font-semibold text-purple-600">
          teacher への依存が高い状態です。teacher-free recall を増やしてください。
        </p>
      )}
    </div>
  )
}
