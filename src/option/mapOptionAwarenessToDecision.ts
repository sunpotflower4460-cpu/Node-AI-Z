import type { OptionAwareness, OptionDecisionShape } from './types'

type MapOptionAwarenessToDecisionInput = {
  awareness: OptionAwareness
}

export const mapOptionAwarenessToDecision = ({
  awareness,
}: MapOptionAwarenessToDecisionInput): OptionDecisionShape => {
  const notes: string[] = [awareness.summaryLabel]

  if (!awareness.dominantOptionId) {
    notes.push('優勢な選択肢はまだない')
    return {
      stance: 'observe',
      shouldDefer: true,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  }

  if (awareness.bridgeOptionPossible) {
    notes.push('橋渡し案を試す余地がある')
    return {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'bridge',
      shouldDefer: false,
      shouldOfferBridge: true,
      confidence: awareness.confidence,
      notes,
    }
  }

  if (awareness.hesitationStrength >= 0.74) {
    notes.push('迷いが強いのでまだ決め切らない')
    return {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'observe',
      shouldDefer: true,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  }

  if (awareness.confidence >= 0.72 && awareness.differenceMagnitude >= 0.22) {
    notes.push('優勢側を前景化してよい')
    return {
      preferredOptionId: awareness.dominantOptionId,
      stance: 'commit',
      shouldDefer: false,
      shouldOfferBridge: false,
      confidence: awareness.confidence,
      notes,
    }
  }

  notes.push('やや優勢な側を保ちつつ揺れも残す')
  return {
    preferredOptionId: awareness.dominantOptionId,
    stance: 'lean',
    shouldDefer: false,
    shouldOfferBridge: false,
    confidence: awareness.confidence,
    notes,
  }
}
