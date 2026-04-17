import type { FusedState } from '../fusion/types'
import type { OptionAwareness, OptionDecisionShape } from './types'

type MapOptionAwarenessToDecisionInput = {
  awareness: OptionAwareness
  fusedState?: FusedState
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

export const mapOptionAwarenessToDecision = ({
  awareness,
  fusedState,
}: MapOptionAwarenessToDecisionInput): OptionDecisionShape => {
  const notes: string[] = [awareness.summaryLabel]
  let decision: OptionDecisionShape

  if (!awareness.dominantOptionId) {
    notes.push('優勢な選択肢はまだない')
    decision = {
      stance: 'observe',
      shouldDefer: true,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  } else if (awareness.bridgeOptionPossible) {
    notes.push('橋渡し案を試す余地がある')
    decision = {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'bridge',
      shouldDefer: false,
      shouldOfferBridge: true,
      confidence: awareness.confidence,
      notes,
    }
  } else if (awareness.hesitationStrength >= 0.74) {
    notes.push('迷いが強いのでまだ決め切らない')
    decision = {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'observe',
      shouldDefer: true,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  } else if (awareness.confidence >= 0.72 && awareness.differenceMagnitude >= 0.22) {
    notes.push('優勢側を前景化してよい')
    decision = {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'commit',
      shouldDefer: false,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  } else {
    notes.push('やや優勢な側を保ちつつ揺れも残す')
    decision = {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'lean',
      shouldDefer: false,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  }

  if (!fusedState) {
    return decision
  }

  const { dimensions } = fusedState.microSignalState
  const isAdviceLike = fusedState.lexicalState.requestType === 'advice' || fusedState.lexicalState.requestType === 'choice'

  if (isAdviceLike && dimensions.heaviness >= 0.62 && dimensions.openness <= 0.42) {
    if (decision.stance === 'commit') decision.stance = 'lean'
    else if (decision.stance === 'lean' && dimensions.fragility >= 0.58) decision.stance = 'observe'
    decision.shouldDefer = decision.stance === 'observe'
    notes.push('dual-stream: 重さと閉じが強いので押し出しを弱める')
  } else if (
    isAdviceLike
    && dimensions.openness >= 0.58
    && dimensions.clarity >= 0.52
    && decision.stance === 'observe'
    && awareness.dominantOptionId
  ) {
    decision.stance = 'lean'
    decision.shouldDefer = false
    notes.push('dual-stream: 開きと明瞭さがあるので比較整理へ少し進める')
  }

  decision.confidence = clamp(
    decision.confidence
    + (fusedState.fusedConfidence - 0.5) * 0.18
    - Math.max(0, dimensions.drift - 0.5) * 0.12,
  )

  return decision
}
