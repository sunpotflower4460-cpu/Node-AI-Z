import type { NodePipelineResult, StudioViewModel } from '../types/nodeStudio'
import { buildRelationBoostKey } from './applyPlasticity'
import type { ProposedChange } from './revisionTypes'

const generateId = () => `change_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const SOFTENING_MARKERS = ['かもしれ', '気がします', '感じがあります', '見える気もします', 'まだ言い切れない']
const DECISIVE_REPLY_PATTERN = /です。|ます。|でしょう。|はずです。/g
const AMBIGUITY_CERTAINTY_THRESHOLD = 0.72
const FRAGILITY_CLOSENESS_THRESHOLD = 0.72
// Roughly one short extra sentence: enough to avoid firing on tiny replies, but small enough for everyday inputs.
const MIN_REPLY_LENGTH_FOR_MILD_DRIFT = 28

const changeLabel = (kind: ProposedChange['kind'], key: string, delta: number) => ({
  id: `${kind}:${key}`,
  kind,
  key,
  delta,
})

const isStrongExplanationDrift = (studioView: StudioViewModel) => {
  const advice = studioView.guideObserves.naturalnessAdvice
  return (
    advice.includes('説明') ||
    advice.includes('整え') ||
    advice.includes('頭で') ||
    studioView.homeCheck.reason === 'overperformance'
  )
}

const hasMildExplanationDrift = (studioView: StudioViewModel) => {
  const advice = studioView.guideObserves.naturalnessAdvice
  return (
    (advice.includes('意味づけが少し早い') || advice.includes('解説が先に')) &&
    studioView.adjustedReplyPreview.length >= MIN_REPLY_LENGTH_FOR_MILD_DRIFT
  )
}

const isAssertiveReply = (reply: string) => {
  const decisiveMarkers = reply.match(DECISIVE_REPLY_PATTERN)?.length ?? 0
  const softMarkers = SOFTENING_MARKERS.reduce((count, marker) => count + (reply.includes(marker) ? 1 : 0), 0)
  return decisiveMarkers >= 2 && softMarkers === 0
}

const isExplanationLeaningReply = (reply: string) => {
  return reply.includes('というより') || reply.includes('意味') || reply.includes('見えます')
}

const addChange = (
  bucket: Map<string, ProposedChange>,
  kind: ProposedChange['kind'],
  key: string,
  delta: number,
  reason: string,
) => {
  const mapKey = `${kind}:${key}`
  const existing = bucket.get(mapKey)

  if (existing) {
    bucket.set(mapKey, {
      ...existing,
      delta: existing.delta + delta,
      reason: `${existing.reason} / ${reason}`,
    })
    return
  }

  bucket.set(mapKey, {
    ...changeLabel(kind, key, delta),
    id: generateId(),
    reason,
    status: 'ephemeral',
  })
}

export const buildProposedChanges = (
  result: NodePipelineResult,
  studioView: StudioViewModel,
): { changes: ProposedChange[]; issues: string[] } => {
  const issues: string[] = []
  const changeBucket = new Map<string, ProposedChange>()

  if (isStrongExplanationDrift(studioView)) {
    issues.push('説明が少し先に出やすい')
    addChange(changeBucket, 'tone_bias', 'over_explaining', -0.04, '説明が先に立ったため、次回は over_explaining を少し弱める')
    addChange(changeBucket, 'home_trigger', 'overperformance', 0.03, '過剰整理に早めに戻れるよう overperformance trigger を少し上げる')
  } else if (hasMildExplanationDrift(studioView)) {
    issues.push('意味づけが少し早い')
    addChange(changeBucket, 'tone_bias', 'over_explaining', -0.02, '意味づけが少し先走ったため、次回は説明先行をほんの少し弱める')
  }

  if (result.stateVector.ambiguity > AMBIGUITY_CERTAINTY_THRESHOLD && isAssertiveReply(studioView.adjustedReplyPreview)) {
    issues.push('曖昧さに対して断定が早い')
    addChange(changeBucket, 'pattern_weight', 'unarticulated_feeling', 0.04, '曖昧さが高いので unarticulated_feeling を少し持ち上げる')
    addChange(changeBucket, 'tone_bias', 'certainty', -0.04, '断定を少し緩め、certainty を下げる')
  }

  if (result.stateVector.fragility > FRAGILITY_CLOSENESS_THRESHOLD && isExplanationLeaningReply(studioView.adjustedReplyPreview)) {
    issues.push('fragility で近さがまだ足りない')
    addChange(changeBucket, 'tone_bias', 'gentleness', 0.05, 'fragility が高いため gentleness を少し上げる')
    addChange(changeBucket, 'home_trigger', 'fragility', 0.04, 'fragility return を少し早める')
  }

  if (studioView.mainConflict && studioView.guideObserves.naturalnessAdvice.includes('揺れている感じを1文目に置き')) {
    issues.push('葛藤の経路を少し太くして様子を見る')
    addChange(
      changeBucket,
      'relation_weight',
      buildRelationBoostKey(studioView.mainConflict.source, studioView.mainConflict.target),
      0.03,
      '葛藤の揺れを先に拾いやすくするため、主経路を少しだけ太くして様子を見る',
    )
  }

  if (studioView.homeCheck.needsReturn && studioView.adjustedReplyPreview !== studioView.rawReplyPreview) {
    issues.push(`Home return が自然化に寄与した (${studioView.homeCheck.reason})`)
    addChange(
      changeBucket,
      'home_trigger',
      studioView.homeCheck.reason,
      0.02,
      `Home return が効いたため ${studioView.homeCheck.reason} trigger を少し上げる`,
    )
  }

  return {
    changes: Array.from(changeBucket.values()),
    issues,
  }
}
