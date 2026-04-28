type ScoreBarProps = {
  label: string
  value: number
  colorClass?: string
}

export const ScoreBar = ({ label, value, colorClass = 'bg-indigo-500' }: ScoreBarProps) => {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>{label}</span>
        <span className="text-slate-500">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200">
        <div
          className={`h-1.5 rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
