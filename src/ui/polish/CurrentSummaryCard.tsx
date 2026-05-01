import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CurrentSummaryViewModel } from './buildCurrentSummaryViewModel'
import { MiniMetricBadge } from '../shared/MiniMetricBadge'
import { SoftDivider } from '../shared/SoftDivider'

/**
 * CurrentSummaryCard — shows the current AI state in a single mobile-friendly card.
 * Always visible at the top of the Overview tab.
 */
type CurrentSummaryCardProps = {
  viewModel: CurrentSummaryViewModel
}

const RISK_VALUE_CLASS: Record<string, string> = {
  '落ち着いています': 'good',
  '少し注意': 'warning',
  '要確認': 'warning',
}

export const CurrentSummaryCard = ({ viewModel }: CurrentSummaryCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false)
  const riskStatus = (RISK_VALUE_CLASS[viewModel.riskLabel] ?? 'normal') as 'good' | 'warning' | 'normal'

  return (
    <section
      className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-sm"
      aria-label="現在の状態サマリー"
    >
      {/* Header */}
      <div className="mb-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          {viewModel.title}
        </p>
        <p className="mt-0.5 text-base font-semibold text-white">{viewModel.subtitle}</p>
      </div>

      <SoftDivider className="border-slate-700 mb-3" />

      {/* Growth mini badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {viewModel.growthSummary.split(' / ').map((item) => {
          const spaceIdx = item.indexOf(' ')
          const label = spaceIdx >= 0 ? item.slice(0, spaceIdx) : item
          const val = spaceIdx >= 0 ? item.slice(spaceIdx + 1) : ''
          const numVal = Number(val)
          const badgeStatus = Number.isNaN(numVal)
            ? ('normal' as const)
            : numVal === 0
              ? ('empty' as const)
              : ('good' as const)
          return (
            <MiniMetricBadge
              key={label}
              label={label}
              value={val}
              status={badgeStatus}
            />
          )
        })}
        <MiniMetricBadge label="リスク" value={viewModel.riskLabel} status={riskStatus} />
      </div>

      {/* Next action */}
      <p className="text-sm text-slate-300 leading-relaxed">{viewModel.nextAction}</p>

      {/* Research details */}
      {viewModel.details && viewModel.details.length > 0 ? (
        <div className="mt-3">
          <button
            type="button"
            aria-expanded={detailOpen}
            onClick={() => setDetailOpen((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>詳しく見る</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${detailOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {detailOpen ? (
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2">
              {viewModel.details.map(({ label, value }) => (
                <div key={label} className="contents">
                  <dt className="text-[10px] text-slate-500">{label}</dt>
                  <dd className="text-[10px] font-mono text-slate-300 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
