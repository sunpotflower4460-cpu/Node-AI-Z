import type { LayeredThinkingResult } from '../runtime/runtimeTypes'

export type LayeredObservePanelProps = {
  result: LayeredThinkingResult
}

const boolMark = (value: boolean) => (value ? '✓' : '✗')

const formatList = (values: string[]) => (values.length > 0 ? values.join(', ') : 'なし')

const buildL0SummaryLine = (result: LayeredThinkingResult) => {
  const { l0Summary } = result.trace
  const flags = [
    `${l0Summary.totalChars}文字`,
    l0Summary.hasQuestion ? '疑問あり' : '疑問なし',
    l0Summary.hasExclamation ? '感嘆あり' : '感嘆なし',
    l0Summary.hasEllipsis ? '省略あり' : null,
    l0Summary.hasEmoji ? '記号あり' : null,
  ].filter((value): value is string => value !== null)

  return flags.join(' / ')
}

const formatPredictionError = (result: LayeredThinkingResult) => {
  const { predictionError } = result.trace

  if (!predictionError) {
    return '比較なし'
  }

  return `needMismatch:${boolMark(predictionError.needMismatch)} / topicShift:${boolMark(predictionError.topicShift)} / surprise:${predictionError.surprise.toFixed(2)}`
}

export const LayeredObservePanel = ({ result }: LayeredObservePanelProps) => {
  const { trace } = result
  const l7 = trace.l7 ?? {
    utterance: trace.utterance,
    templateKey: 'legacy_trace',
    appliedModifiers: [],
  }

  return (
    <section className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-widest text-emerald-700">
          Turn {trace.nextBrainState.turnCount}
        </div>
        <div className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Input:</span> &quot;{result.input}&quot;
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-bold tracking-wide text-slate-500">【意味】</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">{trace.semanticFrame.gist}</div>
          <div className="mt-1 text-xs text-slate-600">need: {trace.semanticFrame.need}</div>
          <div className="text-xs text-slate-600">relation: {trace.semanticFrame.relation}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="text-xs font-bold tracking-wide text-slate-500">【発話】</div>
          <div className="mt-2 text-sm font-semibold text-slate-900">&quot;{l7.utterance}&quot;</div>
        </div>

        <details className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-800">
            ▶ 詳細を見る
          </summary>
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-slate-700">
            <div><span className="font-semibold text-slate-900">L0 文字:</span> {buildL0SummaryLine(result)}</div>
            <div><span className="font-semibold text-slate-900">L1 トークン:</span> [{trace.tokenNodes.map((token) => token.surface).join(', ')}]</div>
            <div><span className="font-semibold text-slate-900">L2 チャンク:</span> [{trace.chunkNodes.map((chunk) => chunk.surface).join(', ')}]</div>
            <div><span className="font-semibold text-slate-900">L3 文型:</span> {trace.l3Output.overallType} / {trace.l3Output.overallCompleteness}</div>
            <div><span className="font-semibold text-slate-900">L4 意味:</span> {trace.semanticFrame.gist} / need:{trace.semanticFrame.need}</div>
            <div>
              <div className="font-semibold text-slate-900">L5 反応:</div>
              <div className="pl-3">返したい: {boolMark(trace.reactionState.wantToRespond)}</div>
              <div className="pl-3">安全: {boolMark(trace.reactionState.feelsSafe)}</div>
              <div className="pl-3">関連: {boolMark(trace.reactionState.feelsRelevant)}</div>
              <div className="pl-3">緊急: {boolMark(trace.reactionState.feelsUrgent)}</div>
              <div className="pl-3">温度: {trace.reactionState.warmth.toFixed(2)}</div>
              <div className="pl-3">reactedTo: {formatList(trace.reactionState.reactedTo)}</div>
              <div className="pl-3">snag: {trace.reactionState.snag ?? 'なし'}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">L6 判断:</div>
              <div className="pl-3">action: {trace.decision.action}</div>
              <div className="pl-3">length: {trace.decision.length}</div>
              <div className="pl-3">confidence: {trace.decision.confidence.toFixed(2)}</div>
              <div className="pl-3">uncertainty: {boolMark(trace.decision.showUncertainty)}</div>
              <div className="pl-3">askBack: {boolMark(trace.decision.askBack)}</div>
              <div className="pl-3">reasoning: {trace.decision.reasoning}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">L7 発話:</div>
              <div className="pl-3">templateKey: {l7.templateKey}</div>
              <div className="pl-3">modifiers: {formatList(l7.appliedModifiers)}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">予測誤差:</div>
              <div className="pl-3">{formatPredictionError(result)}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">次の予測:</div>
              <div className="pl-3">need: {trace.nextBrainState.prediction.expectedNeed ?? 'なし'}</div>
              <div className="pl-3">topic: {trace.nextBrainState.prediction.expectedTopic ?? 'なし'}</div>
              <div className="pl-3">sentenceType: {trace.nextBrainState.prediction.expectedSentenceType ?? 'なし'}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">状態:</div>
              <div className="pl-3">mood: {trace.nextBrainState.mood}</div>
              <div className="pl-3">topics: {formatList(trace.nextBrainState.recentTopics)}</div>
            </div>
          </div>
        </details>
      </div>
    </section>
  )
}
