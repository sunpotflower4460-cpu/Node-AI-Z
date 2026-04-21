import type { HumanReviewEntry } from '../../core'

type HumanReviewDetailProps = {
  entry: HumanReviewEntry | null
}

export const HumanReviewDetail = ({ entry }: HumanReviewDetailProps) => {
  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 text-sm font-medium text-slate-500">
        Select a candidate to review
      </div>
    )
  }

  const { summary, promotionStatus, guardianMode, record, guardianResult } = entry
  const decisionLabel = record?.decision ?? guardianResult?.decision ?? 'pending'

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Candidate Detail</h3>
          <p className="text-xs font-medium text-slate-500">Kind: {summary.candidateKind} / Guardian mode: {guardianMode}</p>
          <p className="text-xs font-medium text-slate-500">Status: <span className="font-semibold text-slate-800">{promotionStatus}</span></p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{(summary.confidenceScore * 100).toFixed(0)}% conf</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">decision: {decisionLabel}</span>
        </div>
      </div>

      <div className="mt-3 space-y-3 overflow-y-auto">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Summary</h4>
          <ul className="mt-2 space-y-1">
            {summary.summary.map((line, index) => (
              <li key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                {line}
              </li>
            ))}
          </ul>
        </div>

        {summary.cautionNotes.length > 0 ? (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-amber-600">Caution Notes</h4>
            <ul className="mt-2 space-y-1">
              {summary.cautionNotes.map((note, index) => (
                <li key={index} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 border border-amber-100">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {record ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <div className="font-semibold">Human Decision</div>
            <div className="mt-1">Decision: {record.decision}</div>
            <div className="mt-1">Reason: {record.reason}</div>
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            Awaiting human review. System holds the candidate until an explicit decision is made.
          </div>
        )}
      </div>
    </div>
  )
}
