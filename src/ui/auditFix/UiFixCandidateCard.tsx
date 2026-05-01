import type { UiFixCandidate } from './uiAuditFixTypes'

type Props = {
  candidate: UiFixCandidate
}

const PRIORITY_BADGE: Record<string, string> = {
  p0: 'bg-red-100 text-red-700',
  p1: 'bg-yellow-100 text-yellow-700',
  p2: 'bg-gray-100 text-gray-600',
}

const IMPACT_BADGE: Record<string, string> = {
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-gray-100 text-gray-500',
}

export const UiFixCandidateCard = ({ candidate }: Props) => {
  return (
    <div className="border rounded-lg p-3 mb-2 bg-white">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold">{candidate.title}</span>
        <div className="flex gap-1 shrink-0">
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${PRIORITY_BADGE[candidate.priority]}`}>
            {candidate.priority.toUpperCase()}
          </span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${IMPACT_BADGE[candidate.impact]}`}>
            {candidate.impact}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1">{candidate.problem}</p>

      <div className="mt-2">
        <p className="text-xs font-medium text-gray-700">修正案:</p>
        <p className="text-xs text-gray-600 mt-0.5">{candidate.recommendedFix}</p>
      </div>

      {candidate.affectedFilesHint.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500">関連ファイル:</p>
          <ul className="mt-0.5">
            {candidate.affectedFilesHint.map((f) => (
              <li key={f} className="text-xs text-gray-400 font-mono">{f}</li>
            ))}
          </ul>
        </div>
      )}

      {candidate.acceptanceCriteria.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-500">完了条件:</p>
          <ul className="mt-0.5 list-disc list-inside">
            {candidate.acceptanceCriteria.map((c, i) => (
              <li key={i} className="text-xs text-gray-500">{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
