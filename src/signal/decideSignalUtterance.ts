import type { SignalDecision, ProtoMeaningInput, UtteranceMode, SignalReplyIntent } from './types'
import { normalizeProtoMeaningInput } from './normalizeProtoMeaningInput'

const ALL_MODES: UtteranceMode[] = ['receptive', 'reflective', 'boundary', 'resonant']

const hasNarrative = (narratives: string[], target: string) => narratives.includes(target)
const hasSensory = (sensory: string[], target: string) => sensory.includes(target)

export const decideSignalUtterance = (
  protoMeanings: ProtoMeaningInput,
  boundaryTension: number,
  resonanceScore: number,
): SignalDecision => {
  const trace: string[] = []
  const { narrative, sensory } = normalizeProtoMeaningInput(protoMeanings)
  const primaryNarratives = narrative.slice(0, 2)
  const primarySensory = sensory.slice(0, 2)
  const narrativeGlosses = primaryNarratives.map((meaning) => meaning.glossJa)
  const sensoryGlosses = primarySensory.map((meaning) => meaning.glossJa)

  trace.push(`Narrative proto-meanings: ${primaryNarratives.map((meaning) => `${meaning.glossJa}(${meaning.strength.toFixed(2)})`).join(', ') || 'none'}`)
  trace.push(`Sensory proto-meanings: ${primarySensory.map((meaning) => `${meaning.glossJa}(${meaning.strength.toFixed(2)})`).join(', ') || 'none'}`)
  trace.push(`Boundary tension: ${boundaryTension.toFixed(2)}, resonance: ${resonanceScore.toFixed(2)}`)

  let utteranceMode: UtteranceMode = 'receptive'
  let replyIntent: SignalReplyIntent = 'emotional_holding'
  let shouldOfferStep = false
  let closeness = 0.46
  let withheldBias = 0.22

  if (hasSensory(sensoryGlosses, '重い')) closeness += 0.16
  if (hasSensory(sensoryGlosses, '閉じている')) closeness += 0.08
  if (hasSensory(sensoryGlosses, '押されている')) withheldBias += 0.2
  if (hasSensory(sensoryGlosses, '張っている')) withheldBias += 0.1

  if (hasNarrative(narrativeGlosses, 'まだ押さない方がよい') || (boundaryTension > 0.64 && hasSensory(sensoryGlosses, '閉じている'))) {
    utteranceMode = 'boundary'
    replyIntent = 'boundary_hold'
    withheldBias += 0.14
    trace.push('Decision: boundary (do-not-push narrative or high boundary tension + closed sensory)')
  } else if (hasNarrative(narrativeGlosses, '変化の入り口にいる') && resonanceScore > 0.58) {
    utteranceMode = 'resonant'
    replyIntent = 'soft_answer_offer_step'
    shouldOfferStep = true
    trace.push('Decision: resonant (threshold-of-change narrative + resonance)')
  } else if (
    hasNarrative(narrativeGlosses, '新しい方向を探し始めている')
    || hasNarrative(narrativeGlosses, '休息より再定位が必要そう')
    || hasNarrative(narrativeGlosses, '変化の入り口にいる')
  ) {
    utteranceMode = 'reflective'
    replyIntent = 'soft_answer_offer_step'
    shouldOfferStep = true
    trace.push('Decision: reflective (reorientation / new-direction narrative)')
  } else if (
    hasNarrative(narrativeGlosses, '意味を見失いかけている')
    || hasNarrative(narrativeGlosses, '目的の芯が薄れている')
    || hasNarrative(narrativeGlosses, '崩れかけている')
  ) {
    utteranceMode = 'receptive'
    replyIntent = hasSensory(sensoryGlosses, '重い') ? 'emotional_holding' : 'judgment_support'
    trace.push('Decision: receptive (meaning-loss / fraying narrative)')
  } else if (hasNarrative(narrativeGlosses, '答えを急ぎすぎている')) {
    utteranceMode = 'boundary'
    replyIntent = 'boundary_hold'
    withheldBias += 0.12
    trace.push('Decision: boundary (rushing-answer narrative)')
  } else if (resonanceScore > 0.68) {
    utteranceMode = 'resonant'
    replyIntent = 'emotional_holding'
    trace.push('Decision: resonant (fallback resonance)')
  } else {
    trace.push('Decision: receptive (default)')
  }

  const suppressedModes = ALL_MODES.filter((mode) => mode !== utteranceMode)
  const pathwayKeys = primaryNarratives.map((meaning) => `narrative:${meaning.glossJa}->decision:${replyIntent}`)

  trace.push(`Reply intent: ${replyIntent}`)
  trace.push(`closeness=${closeness.toFixed(2)}, withheldBias=${withheldBias.toFixed(2)}, offerStep=${shouldOfferStep ? 'true' : 'false'}`)
  trace.push(`Suppressed modes: ${suppressedModes.join(', ')}`)

  return {
    shouldSpeak: true,
    utteranceMode,
    suppressedModes,
    decisionTrace: trace,
    replyIntent,
    shouldOfferStep,
    closeness: Math.max(0, Math.min(1, closeness)),
    withheldBias: Math.max(0, Math.min(1, withheldBias)),
    primaryNarrativeIds: primaryNarratives.map((meaning) => meaning.id),
    primarySensoryIds: primarySensory.map((meaning) => meaning.id),
    pathwayKeys,
  }
}
