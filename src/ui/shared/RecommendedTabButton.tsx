import type { PrimaryTabId } from '../navigation/tabUiTypes'
import { ArrowRight } from 'lucide-react'

type RecommendedTabButtonProps = {
  tabId: PrimaryTabId
  label: string
  reason?: string
  onClick: (tabId: PrimaryTabId) => void
}

export const RecommendedTabButton = ({ tabId, label, reason, onClick }: RecommendedTabButtonProps) => (
  <button
    type="button"
    onClick={() => onClick(tabId)}
    className="flex w-full items-center justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-left text-sm font-semibold text-indigo-800 transition-colors hover:border-indigo-300 hover:bg-indigo-100 active:scale-[0.98]"
  >
    <div className="min-w-0">
      <span className="block truncate">{label}</span>
      {reason ? <span className="mt-0.5 block text-xs font-medium text-indigo-600">{reason}</span> : null}
    </div>
    <ArrowRight className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
  </button>
)
