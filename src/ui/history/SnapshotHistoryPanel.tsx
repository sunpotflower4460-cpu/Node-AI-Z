import type { SnapshotHistoryEntry } from './buildHistoryTimelineViewModel'

type SnapshotHistoryPanelProps = {
  snapshots: SnapshotHistoryEntry[]
}

const formatDate = (ts: number): string => {
  return new Date(ts).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const SnapshotHistoryPanel = ({ snapshots }: SnapshotHistoryPanelProps) => {
  if (snapshots.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Snapshot History</p>
        <p className="text-xs font-medium text-slate-400">まだスナップショットはありません。</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Snapshot History</p>
      <div className="space-y-2">
        {snapshots.map((snapshot) => (
          <div
            key={snapshot.snapshotId}
            className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[10px] font-semibold text-indigo-600">{snapshot.snapshotId}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{formatDate(snapshot.updatedAt)}</p>
              </div>
              {snapshot.developmentStage ? (
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                  {snapshot.developmentStage}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-semibold text-slate-500">
              {snapshot.particleCount !== undefined ? <span>particles: {snapshot.particleCount}</span> : null}
              {snapshot.assemblyCount !== undefined ? <span>assemblies: {snapshot.assemblyCount}</span> : null}
              {snapshot.bridgeCount !== undefined ? <span>bridges: {snapshot.bridgeCount}</span> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
