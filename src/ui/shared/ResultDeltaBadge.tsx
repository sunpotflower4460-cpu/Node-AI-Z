type ResultDeltaBadgeProps = {
  label: string
  tone: 'neutral' | 'good' | 'warning'
}

const TONE_STYLES: Record<ResultDeltaBadgeProps['tone'], string> = {
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
  good: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
}

export const ResultDeltaBadge = ({ label, tone }: ResultDeltaBadgeProps) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${TONE_STYLES[tone]}`}>
    {label}
  </span>
)
