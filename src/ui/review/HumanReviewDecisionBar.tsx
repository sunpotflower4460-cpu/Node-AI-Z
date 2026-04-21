import { useState } from 'react'
import type { HumanReviewDecisionInput } from '../../core'

type HumanReviewDecisionBarProps = {
  candidateId: string | null
  onSubmit: (input: HumanReviewDecisionInput) => void
  disabled?: boolean
}

const actions: Array<{ label: string; decision: HumanReviewDecisionInput['decision']; tone: string }> = [
  { label: 'Approve', decision: 'approve', tone: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { label: 'Reject', decision: 'reject', tone: 'bg-rose-600 hover:bg-rose-700 text-white' },
  { label: 'Quarantine', decision: 'quarantine', tone: 'bg-amber-500 hover:bg-amber-600 text-white' },
  { label: 'Hold for Review', decision: 'hold_for_review', tone: 'bg-slate-600 hover:bg-slate-700 text-white' },
]

export const HumanReviewDecisionBar = ({ candidateId, onSubmit, disabled = false }: HumanReviewDecisionBarProps) => {
  const [reason, setReason] = useState('')

  const handleSubmit = (decision: HumanReviewDecisionInput['decision']) => {
    if (!candidateId || !reason.trim()) {
      return
    }
    onSubmit({
      candidateId,
      decision,
      reason: reason.trim(),
    })
    setReason('')
  }

  const isDisabled = disabled || !candidateId || reason.trim().length === 0

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Decision</h4>
          <p className="text-xs text-slate-500">Enter a short reason and choose an action. Decision is recorded as a guardian result.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
          {candidateId ? `candidate: ${candidateId.slice(0, 8)}...` : 'no candidate selected'}
        </span>
      </div>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason (required)"
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
        rows={2}
      />
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
        {actions.map((action) => (
          <button
            key={action.decision}
            type="button"
            onClick={() => handleSubmit(action.decision)}
            disabled={isDisabled}
            className={`rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${action.tone}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}
