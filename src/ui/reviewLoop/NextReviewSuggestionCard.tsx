import type { NextUiReviewSuggestion } from './uiReviewLoopTypes'

type Props = {
  suggestion: NextUiReviewSuggestion
}

const PRIORITY_BADGE: Record<NextUiReviewSuggestion['priority'], string> = {
  p0: 'bg-red-100 text-red-700',
  p1: 'bg-yellow-100 text-yellow-700',
  p2: 'bg-gray-100 text-gray-600',
}

export const NextReviewSuggestionCard = ({ suggestion }: Props) => {
  return (
    <div className="border rounded-lg p-4 bg-white text-sm">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-semibold">次のおすすめ改善</h3>
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_BADGE[suggestion.priority]}`}>
          {suggestion.priority.toUpperCase()}
        </span>
      </div>
      <p className="font-medium mb-1">{suggestion.title}</p>
      <p className="text-xs text-gray-500 mb-2">{suggestion.reason}</p>
      <div className="text-xs text-gray-500">
        <span className="font-medium text-gray-600">範囲: </span>
        {suggestion.recommendedScope}
      </div>
      {suggestion.suggestedNextPrompt && (
        <div className="mt-2 bg-gray-50 rounded p-2">
          <p className="text-xs font-medium text-gray-600 mb-0.5">提案プロンプト</p>
          <p className="text-xs text-gray-600 whitespace-pre-wrap">{suggestion.suggestedNextPrompt}</p>
        </div>
      )}
    </div>
  )
}
