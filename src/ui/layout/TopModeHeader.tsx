type TopModeHeaderProps = {
  mode: string
  stage: string
  riskLevel?: 'low' | 'medium' | 'high'
}

const RISK_CLASS: Record<string, string> = {
  low: 'text-emerald-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
}

export const TopModeHeader = ({ mode, stage, riskLevel = 'low' }: TopModeHeaderProps) => (
  <div
    className="safe-area-pt sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/95 px-4 py-2 backdrop-blur-sm lg:hidden"
    aria-label="モードヘッダー"
  >
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-cyan-400">{mode}</span>
      <span className="text-[10px] text-slate-500">/</span>
      <span className="text-xs text-slate-300">{stage}</span>
    </div>
    <span className={`text-[10px] font-bold uppercase ${RISK_CLASS[riskLevel] ?? RISK_CLASS.low}`}>
      Risk: {riskLevel}
    </span>
  </div>
)
