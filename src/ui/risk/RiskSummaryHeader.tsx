import { AlertTriangle, CheckCircle } from 'lucide-react'
import type { RiskViewModel } from './buildRiskViewModel'

type RiskSummaryHeaderProps = {
  viewModel: RiskViewModel
}

const LEVEL_STYLES = {
  low: {
    container: 'border-cyan-200 bg-cyan-50/60',
    badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    icon: CheckCircle,
    iconClass: 'text-cyan-500',
  },
  medium: {
    container: 'border-amber-200 bg-amber-50/60',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
  },
  high: {
    container: 'border-red-200 bg-red-50/60',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: AlertTriangle,
    iconClass: 'text-red-500',
  },
}

export const RiskSummaryHeader = ({ viewModel }: RiskSummaryHeaderProps) => {
  const styles = LEVEL_STYLES[viewModel.overallLevel]
  const Icon = styles.icon

  return (
    <div className={`rounded-2xl border p-4 ${styles.container}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 shrink-0 ${styles.iconClass}`} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase ${styles.badge}`}>
              Risk Level: {viewModel.overallLevel}
            </span>
          </div>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-700">{viewModel.summaryText}</p>
        </div>
      </div>
    </div>
  )
}
