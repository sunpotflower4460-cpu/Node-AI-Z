import { useMemo, useState } from 'react'
import type { HumanReviewDecisionInput, HumanReviewEntry } from '../../core'
import { HumanReviewList } from './HumanReviewList'
import { HumanReviewDetail } from './HumanReviewDetail'
import { HumanReviewDecisionBar } from './HumanReviewDecisionBar'

type HumanReviewPanelProps = {
  pending: HumanReviewEntry[]
  resolved: HumanReviewEntry[]
  onDecision: (input: HumanReviewDecisionInput) => void
}

export const HumanReviewPanel = ({ pending, resolved, onDecision }: HumanReviewPanelProps) => {
  const [activeFilter, setActiveFilter] = useState<'pending' | 'resolved'>('pending')
  const visibleItems = useMemo(
    () => (activeFilter === 'pending' ? pending : resolved),
    [activeFilter, pending, resolved]
  )
  const [selectedId, setSelectedId] = useState<string | undefined>(visibleItems[0]?.summary.candidateId)

  const selectedEntry = useMemo(
    () =>
      visibleItems.find((item) => item.summary.candidateId === selectedId)
      ?? visibleItems[0]
      ?? null,
    [selectedId, visibleItems]
  )
  const effectiveSelectedId = selectedEntry?.summary.candidateId

  if (pending.length === 0 && resolved.length === 0) {
    return null
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-700">
            Human Review Panel
          </div>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Human-required / guardian-assisted promotion candidates are held here until reviewed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${activeFilter === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-800'}`}
          >
            Pending ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('resolved')}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${activeFilter === 'resolved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:text-slate-800'}`}
          >
            Resolved ({resolved.length})
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <HumanReviewList
            items={visibleItems}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedId}
            emptyLabel={activeFilter === 'pending' ? 'No pending human reviews' : 'No resolved human reviews'}
          />
        </div>
        <div className="lg:col-span-8 flex flex-col gap-3">
          <HumanReviewDetail entry={selectedEntry ?? null} />
          {activeFilter === 'pending' && selectedEntry ? (
            <HumanReviewDecisionBar
              candidateId={effectiveSelectedId ?? null}
              onSubmit={onDecision}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
