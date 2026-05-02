import type { UiReviewSession } from './uiReviewLoopTypes'

type Props = {
  session: UiReviewSession
}

const STATUS_LABEL: Record<UiReviewSession['status'], string> = {
  audit_only: 'Audit Only',
  fix_plan_created: 'Fix Plan Created',
  fix_applied_manually: 'Fix Applied',
  re_audited: 'Re-audited',
  closed: 'Closed',
}

const STATUS_COLOR: Record<UiReviewSession['status'], string> = {
  audit_only: 'bg-gray-100 text-gray-600',
  fix_plan_created: 'bg-blue-100 text-blue-700',
  fix_applied_manually: 'bg-yellow-100 text-yellow-700',
  re_audited: 'bg-green-100 text-green-700',
  closed: 'bg-gray-200 text-gray-500',
}

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })

export const UiReviewSessionCard = ({ session }: Props) => {
  const delta = session.scoreDelta
  const deltaLabel =
    delta === undefined
      ? '—'
      : delta > 0
        ? `+${delta}`
        : delta < 0
          ? `${delta}`
          : '±0'
  const deltaColor =
    delta === undefined ? 'text-gray-400' : delta > 0 ? 'text-green-600' : delta < 0 ? 'text-red-500' : 'text-gray-500'

  return (
    <div className="border rounded-lg p-3 mb-2 bg-white text-sm">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs text-gray-400">{formatDate(session.createdAt)}</span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLOR[session.status]}`}>
          {STATUS_LABEL[session.status]}
        </span>
      </div>
      <div className="flex gap-4 mt-1">
        <div>
          <span className="text-xs text-gray-500">Initial</span>
          <p className="font-semibold">{session.initialAuditScore}</p>
        </div>
        {session.reAuditScore !== undefined && (
          <div>
            <span className="text-xs text-gray-500">Re-audit</span>
            <p className="font-semibold">{session.reAuditScore}</p>
          </div>
        )}
        <div>
          <span className="text-xs text-gray-500">Delta</span>
          <p className={`font-semibold ${deltaColor}`}>{deltaLabel}</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1 truncate">{session.summary}</p>
    </div>
  )
}
