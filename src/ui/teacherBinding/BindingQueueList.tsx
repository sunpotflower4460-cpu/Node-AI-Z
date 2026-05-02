import type { BindingQueueState, BindingQueueItem } from '../../signalTeacher/queue/bindingQueueTypes'

type Props = {
  queue: BindingQueueState
}

const PRIORITY_COLORS: Record<BindingQueueItem['priority'], string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-500',
}

const STATUS_COLORS: Record<BindingQueueItem['status'], string> = {
  pending: 'text-slate-500',
  checking: 'text-sky-600',
  confirmed: 'text-emerald-600',
  rejected: 'text-red-600',
  held: 'text-amber-600',
  resolved: 'text-slate-400',
}

export const BindingQueueList = ({ queue }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-3 text-xs text-slate-500">
        <span>待機: <strong className="text-slate-700">{queue.pendingCount}</strong></span>
        <span>確認済: <strong className="text-emerald-600">{queue.confirmedCount}</strong></span>
        <span>却下: <strong className="text-red-600">{queue.rejectedCount}</strong></span>
        <span>保留: <strong className="text-amber-600">{queue.heldCount}</strong></span>
      </div>
      {queue.items.length === 0 && (
        <p className="text-xs text-slate-400">キューは空です</p>
      )}
      {queue.items.map(item => (
        <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[item.priority]}`}>{item.priority}</span>
          <span className="font-mono text-slate-400 text-[10px]">{item.candidateId.slice(0, 16)}…</span>
          <span className={`ml-auto font-medium ${STATUS_COLORS[item.status]}`}>{item.status}</span>
        </div>
      ))}
    </div>
  )
}
