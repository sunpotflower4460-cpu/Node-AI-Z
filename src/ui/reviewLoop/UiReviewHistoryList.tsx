import type { UiReviewSession } from './uiReviewLoopTypes'
import { UiReviewSessionCard } from './UiReviewSessionCard'

type Props = {
  sessions: UiReviewSession[]
}

export const UiReviewHistoryList = ({ sessions }: Props) => {
  if (sessions.length === 0) {
    return (
      <div className="text-xs text-gray-400 py-3 text-center">
        レビュー履歴がありません
      </div>
    )
  }

  return (
    <div>
      {sessions.map((session) => (
        <UiReviewSessionCard key={session.id} session={session} />
      ))}
    </div>
  )
}
