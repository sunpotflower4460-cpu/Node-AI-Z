import { useState } from 'react'
import type { UiFixPrPlan } from './uiAuditFixTypes'
import { CopyFixPromptButton } from './CopyFixPromptButton'

type Props = {
  plan: UiFixPrPlan
}

const PRIORITY_BADGE: Record<string, string> = {
  p0: 'bg-red-100 text-red-700',
  p1: 'bg-yellow-100 text-yellow-700',
  p2: 'bg-gray-100 text-gray-600',
}

export const UiFixPrPlanCard = ({ plan }: Props) => {
  const [showPrompt, setShowPrompt] = useState(false)

  return (
    <div className="border rounded-lg p-3 mb-2 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-semibold">{plan.title}</span>
          <p className="text-xs text-gray-500 mt-0.5">{plan.summary}</p>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${PRIORITY_BADGE[plan.priority]}`}>
          {plan.priority.toUpperCase()}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
        <span>{plan.candidates.length}件の改善候補</span>
        <span className="font-mono text-gray-400">{plan.suggestedBranchName}</span>
      </div>

      <div className="mt-2">
        <p className="text-xs font-medium text-gray-500">含まれる改善候補:</p>
        <ul className="mt-0.5 list-disc list-inside">
          {plan.candidates.map((c) => (
            <li key={c.id} className="text-xs text-gray-500">{c.title}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <CopyFixPromptButton prompt={plan.copilotPrompt} />
        <button
          onClick={() => setShowPrompt((v) => !v)}
          className="text-xs text-blue-500 underline"
          aria-expanded={showPrompt}
        >
          {showPrompt ? '指示書を閉じる' : '指示書を見る'}
        </button>
      </div>

      {showPrompt && (
        <pre className="mt-2 text-xs bg-gray-50 border rounded p-2 overflow-auto max-h-48 whitespace-pre-wrap">
          {plan.copilotPrompt}
        </pre>
      )}
    </div>
  )
}
