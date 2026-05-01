import { Eye } from 'lucide-react'
import type { RecommendedObserveLink } from './buildExperienceResultViewModel'

type BehindTheScenesLinkProps = {
  internalSummary: string
  links: RecommendedObserveLink[]
  onNavigate: (tab: RecommendedObserveLink['targetTab']) => void
}

export const BehindTheScenesLink = ({
  internalSummary,
  links,
  onNavigate,
}: BehindTheScenesLinkProps) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
    <div className="flex items-start gap-2">
      <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-600">裏側を見る</p>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500">
          {internalSummary}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {links.map((link) => (
            <button
              key={`${link.targetTab}-${link.label}`}
              type="button"
              onClick={() => onNavigate(link.targetTab)}
              title={link.reason}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:border-indigo-300 hover:text-indigo-700 active:scale-[0.98]"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
)
