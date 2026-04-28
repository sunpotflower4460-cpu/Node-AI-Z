type StickySummaryBarProps = {
  mode: string
  stage: string
  riskLevel: 'low' | 'medium' | 'high'
}

const RISK_COLOR: Record<string, string> = {
  low: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  medium: 'bg-amber-950 text-amber-300 border-amber-800',
  high: 'bg-red-950 text-red-300 border-red-800',
}

export const StickySummaryBar = ({ mode, stage, riskLevel }: StickySummaryBarProps) => (
  <div
    className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-[11px] backdrop-blur-sm"
    aria-label="現在の状態サマリー"
  >
    <span className="font-bold text-cyan-400">{mode}</span>
    <span className="text-slate-600">·</span>
    <span className="text-slate-300">{stage}</span>
    <span className="text-slate-600">·</span>
    <span className={`rounded-full border px-2 py-0.5 font-bold uppercase ${RISK_COLOR[riskLevel] ?? RISK_COLOR.low}`}>
      Risk {riskLevel}
    </span>
  </div>
)
