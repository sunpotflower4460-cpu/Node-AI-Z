/**
 * MiniMetricBadge — a lightweight badge for displaying small numeric metrics.
 * Lighter than a CompactMetricCard; suitable for inline / strip use.
 *
 * Example:
 *   <MiniMetricBadge label="点群" value={0} />
 */
type MiniMetricBadgeStatus = 'empty' | 'normal' | 'good' | 'warning'

type MiniMetricBadgeProps = {
  label: string
  value: string | number
  status?: MiniMetricBadgeStatus
}

const VALUE_CLASS: Record<MiniMetricBadgeStatus, string> = {
  empty: 'text-slate-400',
  normal: 'text-slate-700',
  good: 'text-emerald-600',
  warning: 'text-amber-600',
}

const CONTAINER_CLASS: Record<MiniMetricBadgeStatus, string> = {
  empty: 'bg-slate-100 border-slate-200',
  normal: 'bg-white border-slate-200',
  good: 'bg-emerald-50 border-emerald-200',
  warning: 'bg-amber-50 border-amber-200',
}

export const MiniMetricBadge = ({ label, value, status = 'normal' }: MiniMetricBadgeProps) => (
  <div
    className={`inline-flex flex-col items-center gap-0.5 rounded-lg border px-2.5 py-1.5 ${CONTAINER_CLASS[status]}`}
  >
    <span className={`text-base font-extrabold leading-none tracking-tight ${VALUE_CLASS[status]}`}>
      {value}
    </span>
    <span className="text-[10px] font-medium text-slate-400">{label}</span>
  </div>
)
