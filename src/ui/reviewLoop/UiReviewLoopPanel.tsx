import { useMemo, useState } from 'react'
import { runUiAudit } from '../audit/runUiAudit'
import { buildUiFixPlan } from '../auditFix/buildUiFixPlan'
import { createUiReviewSession } from './createUiReviewSession'
import { buildNextUiReviewSuggestion } from './buildNextUiReviewSuggestion'
import { buildUiReviewLoopViewModel } from './buildUiReviewLoopViewModel'
import { loadUiReviewHistory } from './loadUiReviewHistory'
import { saveUiReviewHistory } from './saveUiReviewHistory'
import { UiReviewHistoryList } from './UiReviewHistoryList'
import { NextReviewSuggestionCard } from './NextReviewSuggestionCard'

const TREND_LABEL: Record<string, string> = {
  improving: '↑ 改善傾向',
  flat: '→ 変化なし',
  worsening: '↓ 悪化傾向',
  unknown: '— データなし',
}

const TREND_COLOR: Record<string, string> = {
  improving: 'text-green-600',
  flat: 'text-gray-500',
  worsening: 'text-red-500',
  unknown: 'text-gray-400',
}

export const UiReviewLoopPanel = () => {
  const report = useMemo(() => runUiAudit(), [])
  const plan = useMemo(() => buildUiFixPlan(report), [report])
  const [history, setHistory] = useState(() => loadUiReviewHistory())
  const [showHistory, setShowHistory] = useState(false)

  const latestSession = history[0]
  const nextSuggestion = useMemo(
    () => buildNextUiReviewSuggestion(latestSession ?? createUiReviewSession(report), undefined, report),
    [latestSession, report],
  )
  const vm = useMemo(
    () => buildUiReviewLoopViewModel(history, nextSuggestion),
    [history, nextSuggestion],
  )

  const handleCreateSession = () => {
    const session = createUiReviewSession(report, plan)
    saveUiReviewHistory(session)
    setHistory(loadUiReviewHistory())
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-3">UI Review Loop</h2>

      {/* Summary bar */}
      <div className="border rounded-lg p-3 mb-4 bg-gray-50">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium">
              Current Audit Score: <span className="font-bold">{report.overallScore}</span> / 100
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Fix Plan Priority: {plan.overallPriority.toUpperCase()} / {plan.candidates.length}件の改善候補
            </p>
          </div>
          <span className={`text-xs font-medium ${TREND_COLOR[vm.overallTrend]}`}>
            {TREND_LABEL[vm.overallTrend]}
          </span>
        </div>

        {vm.latestSession && (
          <div className="mt-2 pt-2 border-t text-xs text-gray-500 flex gap-4">
            <span>最終セッション score: {vm.latestSession.initialScore}</span>
            {vm.latestSession.reAuditScore !== undefined && (
              <span>再監査: {vm.latestSession.reAuditScore}</span>
            )}
            {vm.latestSession.scoreDelta !== undefined && (
              <span className={vm.latestSession.scoreDelta >= 0 ? 'text-green-600' : 'text-red-500'}>
                Δ {vm.latestSession.scoreDelta > 0 ? '+' : ''}
                {vm.latestSession.scoreDelta}
              </span>
            )}
          </div>
        )}

        {vm.remainingWarnings.length > 0 && (
          <div className="mt-2 text-xs text-amber-600">
            残存警告: {vm.remainingWarnings.slice(0, 3).join(' / ')}
            {vm.remainingWarnings.length > 3 && ` 他${vm.remainingWarnings.length - 3}件`}
          </div>
        )}
      </div>

      {/* Next suggestion */}
      {nextSuggestion && (
        <div className="mb-4">
          <NextReviewSuggestionCard suggestion={nextSuggestion} />
        </div>
      )}

      {/* Create session button */}
      <div className="mb-4">
        <button
          onClick={handleCreateSession}
          className="text-sm bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          現在の監査結果でセッションを記録する
        </button>
      </div>

      {/* History */}
      <div>
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="text-xs text-blue-500 underline mb-2"
          aria-expanded={showHistory}
        >
          {showHistory
            ? 'Review履歴を閉じる'
            : `Review履歴を見る (${vm.historyCount}件)`}
        </button>
        {showHistory && <UiReviewHistoryList sessions={history} />}
      </div>
    </div>
  )
}
