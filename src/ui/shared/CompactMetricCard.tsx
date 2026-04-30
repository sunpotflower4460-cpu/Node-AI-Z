type CompactMetricCardProps = {
  label: string
  value: string | number
  helper?: string
  status?: 'empty' | 'normal' | 'good' | 'warning'
}

const STATUS_CLASS: Record<NonNullable<CompactMetricCardProps['status']>, string> = {
  empty: 'text-slate-300',
  normal: 'text-slate-700',
  good: 'text-emerald-700',
  warning: 'text-amber-600',
}

export const CompactMetricCard = ({
  label,
  value,
  helper,
  status = 'normal',
}: CompactMetricCardProps) => (
  <div className="flex flex-col gap-0.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
    <p className={`text-lg font-extrabold tracking-tight ${STATUS_CLASS[status]}`}>{value}</p>
    {helper ? <p className="text-[10px] leading-snug text-slate-400">{helper}</p> : null}
  </div>
)
