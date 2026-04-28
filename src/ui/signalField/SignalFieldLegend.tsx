const LEGEND_ITEMS = [
  { color: 'bg-cyan-200', label: '外部入力で発火 (external)' },
  { color: 'bg-blue-500', label: '内部 replay で発火 (internal)' },
  { color: 'bg-purple-500', label: 'teacher-assisted bridge' },
  { color: 'bg-emerald-400', label: 'self-discovered / teacher-free bridge' },
  { color: 'bg-red-500', label: 'risk candidate (overbinding など)' },
  { color: 'bg-slate-600', label: '非活性粒子 (inactive)' },
]

export const SignalFieldLegend = () => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Legend</h3>
    <ul className="mt-3 space-y-2">
      {LEGEND_ITEMS.map(({ color, label }) => (
        <li key={label} className="flex items-center gap-2.5">
          <span className={`h-3 w-3 shrink-0 rounded-full ${color}`} />
          <span className="text-xs font-medium text-slate-600">{label}</span>
        </li>
      ))}
    </ul>
  </div>
)
