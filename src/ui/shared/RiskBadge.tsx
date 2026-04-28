import { AlertTriangle } from 'lucide-react'

export type RiskLevel = 'low' | 'medium' | 'high'

type RiskBadgeProps = {
  level: RiskLevel
}

const RISK_STYLES: Record<RiskLevel, string> = {
  low: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
  medium: 'border-orange-400/40 bg-orange-500/15 text-orange-100',
  high: 'border-rose-400/50 bg-rose-500/15 text-rose-100',
}

export const RiskBadge = ({ level }: RiskBadgeProps) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${RISK_STYLES[level]}`}>
    <AlertTriangle className="h-3.5 w-3.5" />
    {level}
  </span>
)
