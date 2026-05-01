import { useMemo, useState } from 'react'
import { runUiAudit } from '../audit/runUiAudit'
import { buildUiFixPlan } from './buildUiFixPlan'
import { buildUiFixPlanViewModel } from './buildUiFixPlanViewModel'
import { UiFixPrPlanCard } from './UiFixPrPlanCard'
import { UiFixCandidateCard } from './UiFixCandidateCard'

const PRIORITY_BADGE: Record<string, string> = {
  p0: 'bg-red-100 text-red-700',
  p1: 'bg-yellow-100 text-yellow-700',
  p2: 'bg-gray-100 text-gray-600',
}

export const UiFixPlanPanel = () => {
  const report = useMemo(() => runUiAudit(), [])
  const plan = useMemo(() => buildUiFixPlan(report), [report])
  const vm = useMemo(() => buildUiFixPlanViewModel(plan), [plan])
  const [showCandidates, setShowCandidates] = useState(false)

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-3">UI Fix Plan</h2>

      <div className="border rounded-lg p-3 mb-4 bg-gray-50">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">Audit Score: {vm.sourceAuditScore} / 100</p>
            <p className="text-xs text-gray-500 mt-0.5">{vm.summary}</p>
          </div>
          <span className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_BADGE[vm.overallPriority]}`}>
            Priority: {vm.overallPriority.toUpperCase()}
          </span>
        </div>
        <div className="mt-2 flex gap-4 text-xs text-gray-500">
          <span>改善候補: {vm.candidateCount}件</span>
          <span>PR案: {vm.prPlanCount}件</span>
        </div>
      </div>

      <h3 className="text-sm font-semibold mb-2">推奨 PR 一覧</h3>
      {plan.prPlans.map((p) => (
        <UiFixPrPlanCard key={p.id} plan={p} />
      ))}

      <div className="mt-4">
        <button
          onClick={() => setShowCandidates((v) => !v)}
          className="text-xs text-blue-500 underline"
          aria-expanded={showCandidates}
        >
          {showCandidates ? '改善候補一覧を閉じる' : `改善候補一覧を見る (${vm.candidateCount}件)`}
        </button>
        {showCandidates && (
          <div className="mt-2">
            {plan.candidates.map((c) => (
              <UiFixCandidateCard key={c.id} candidate={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
