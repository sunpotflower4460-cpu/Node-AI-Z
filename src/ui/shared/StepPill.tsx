type StepPillProps = {
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
}

const STATUS_STYLES: Record<StepPillProps['status'], string> = {
  pending: 'bg-slate-100 text-slate-400 border-slate-200',
  active: 'bg-indigo-100 text-indigo-700 border-indigo-300 animate-pulse',
  done: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  error: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_ICON: Record<StepPillProps['status'], string> = {
  pending: '○',
  active: '●',
  done: '✓',
  error: '✕',
}

export const StepPill = ({ label, status }: StepPillProps) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
    <span aria-hidden="true">{STATUS_ICON[status]}</span>
    {label}
  </span>
)
