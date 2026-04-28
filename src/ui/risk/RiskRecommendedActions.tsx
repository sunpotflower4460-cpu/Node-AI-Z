import { CheckCircle } from 'lucide-react'

type RiskRecommendedActionsProps = {
  actions: string[]
}

export const RiskRecommendedActions = ({ actions }: RiskRecommendedActionsProps) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Recommended Actions</p>
    {actions.length > 0 ? (
      <ul className="space-y-2">
        {actions.map((action) => (
          <li
            key={action}
            className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800"
          >
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span className="leading-relaxed">{action}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-xs font-medium text-slate-400">現在、推奨アクションはありません。</p>
    )}
  </div>
)
