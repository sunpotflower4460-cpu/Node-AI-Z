import { useMemo, useState } from 'react'
import type { TrunkApplyRecord, TrunkConsistencyResult, TrunkRevertRecord } from '../../core'

type TrunkUndoPanelProps = {
  applyRecords: TrunkApplyRecord[]
  revertRecords: TrunkRevertRecord[]
  currentSafetySnapshotId?: string
  consistencyResult?: TrunkConsistencyResult
  onUndo: (input: { applyRecordId: string; reason: string }) => void
}

export const TrunkUndoPanel = ({
  applyRecords,
  revertRecords,
  currentSafetySnapshotId,
  consistencyResult,
  onUndo,
}: TrunkUndoPanelProps) => {
  const [reasons, setReasons] = useState<Record<string, string>>({})
  const revertedApplyIds = useMemo(
    () => new Set(revertRecords.map((record) => record.targetApplyRecordId)),
    [revertRecords]
  )

  if (applyRecords.length === 0 && revertRecords.length === 0) {
    return null
  }

  return (
    <section className="rounded-3xl border border-rose-200 bg-white shadow-sm">
      <div className="border-b border-rose-100 px-4 py-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-700">
          Trunk Safe Undo
        </div>
        <p className="mt-1 text-sm font-medium text-slate-600">
          Shared trunk apply ledger, revert history, and rollback safety status.
        </p>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Trunk Apply Ledger</h3>
          {applyRecords.map((record) => {
            const isReverted = revertedApplyIds.has(record.id)
            const reason = reasons[record.id] ?? ''
            return (
              <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{record.candidateId}</div>
                    <div className="text-[11px] text-slate-500">
                      {record.promotionKind} · {record.appliedBy} · {new Date(record.appliedAt).toLocaleString()}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isReverted ? 'bg-slate-200 text-slate-600' : 'bg-rose-100 text-rose-700'}`}>
                    {isReverted ? 'reverted' : 'applied'}
                  </span>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
                  {record.trunkDiffSummary.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
                <textarea
                  value={reason}
                  onChange={(event) => setReasons((previous) => ({ ...previous, [record.id]: event.target.value }))}
                  placeholder="Revert reason"
                  className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                />
                <button
                  type="button"
                  disabled={isReverted || reason.trim().length === 0}
                  onClick={() => onUndo({ applyRecordId: record.id, reason: reason.trim() })}
                  className="mt-2 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Undo / Revert
                </button>
              </div>
            )
          })}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Trunk Revert Records</h3>
          {revertRecords.length > 0 ? revertRecords.map((record) => (
            <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-800">{record.targetApplyRecordId}</div>
              <div className="text-[11px] text-slate-500">
                {record.revertedBy} · {new Date(record.revertedAt).toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-slate-600">{record.reason}</div>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {record.trunkDiffSummary.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
              No trunk reverts yet.
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div><span className="font-semibold text-slate-800">Current Revert Safety Snapshot:</span> {currentSafetySnapshotId ?? 'none'}</div>
            <div className="mt-2">
              <span className="font-semibold text-slate-800">Trunk Consistency Check:</span>{' '}
              {consistencyResult ? (consistencyResult.ok ? 'ok' : 'warning') : 'not_run'}
            </div>
            {consistencyResult?.notes.length ? (
              <ul className="mt-2 space-y-1">
                {consistencyResult.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
