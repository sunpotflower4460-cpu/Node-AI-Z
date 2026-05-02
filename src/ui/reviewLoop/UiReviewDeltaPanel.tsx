import type { UiReviewDelta } from './uiReviewLoopTypes'

type Props = {
  delta: UiReviewDelta
}

export const UiReviewDeltaPanel = ({ delta }: Props) => {
  const deltaColor =
    delta.scoreDelta > 0
      ? 'text-green-600'
      : delta.scoreDelta < 0
        ? 'text-red-500'
        : 'text-gray-500'

  return (
    <div className="border rounded-lg p-4 bg-white text-sm">
      <h3 className="font-semibold mb-3">UI改善結果</h3>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-base font-bold">
          Score: {delta.scoreBefore} → {delta.scoreAfter}
        </span>
        <span className={`text-sm font-semibold ${deltaColor}`}>({delta.scoreDeltaLabel})</span>
      </div>

      {delta.resolvedWarnings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-green-700 mb-1">改善済み</p>
          <ul className="space-y-0.5">
            {delta.resolvedWarnings.map((w) => (
              <li key={w} className="text-xs text-green-700 flex gap-1">
                <span>✓</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {delta.remainingWarnings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">まだ残る課題</p>
          <ul className="space-y-0.5">
            {delta.remainingWarnings.map((w) => (
              <li key={w} className="text-xs text-amber-700 flex gap-1">
                <span>·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {delta.newWarnings.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-red-600 mb-1">新しい警告</p>
          <ul className="space-y-0.5">
            {delta.newWarnings.map((w) => (
              <li key={w} className="text-xs text-red-600 flex gap-1">
                <span>!</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {delta.screenScoreDeltas.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">画面別スコア変化</p>
          <div className="space-y-1">
            {delta.screenScoreDeltas.map((s) => {
              const dColor =
                s.delta > 0 ? 'text-green-600' : s.delta < 0 ? 'text-red-500' : 'text-gray-400'
              return (
                <div key={s.screenId} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{s.screenLabel}</span>
                  <span>
                    {s.beforeScore} → {s.afterScore}{' '}
                    <span className={dColor}>
                      ({s.delta > 0 ? `+${s.delta}` : String(s.delta)})
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
