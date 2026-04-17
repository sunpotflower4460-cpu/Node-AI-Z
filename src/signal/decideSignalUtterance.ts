import type { SignalDecision, ProtoMeaningInput, UtteranceMode, SignalReplyIntent } from './types'
import type { OptionAwareness, OptionDecisionShape, OptionUtteranceHints } from '../option/types'
import type { SomaticInfluence } from '../somatic/types'
import type { FusedState } from '../fusion/types'
import type { LexicalState } from '../lexical/types'
import type { MicroSignalState } from './packetTypes'
import { normalizeProtoMeaningInput } from './normalizeProtoMeaningInput'

const ALL_MODES: UtteranceMode[] = ['receptive', 'reflective', 'boundary', 'resonant']
// Neutral baselines before sensory modulation: moderately close, but still slightly
// withheld so the runtime does not overstep before narrative evidence accumulates.
const BASE_CLOSENESS = 0.46
const BASE_WITHHELD_BIAS = 0.22

const hasNarrative = (narratives: string[], target: string) => narratives.includes(target)
const hasSensory = (sensory: string[], target: string) => sensory.includes(target)

type SignalDecisionOptionContext = {
  awareness?: OptionAwareness
  optionDecision?: OptionDecisionShape
  optionUtteranceHints?: OptionUtteranceHints
  fusedState?: FusedState
  lexicalState?: LexicalState
  microSignalState?: MicroSignalState
}

export const decideSignalUtterance = (
  protoMeanings: ProtoMeaningInput,
  boundaryTension: number,
  resonanceScore: number,
  somaticInfluence?: SomaticInfluence,
  optionContext?: SignalDecisionOptionContext,
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
  let closeness = BASE_CLOSENESS
  let withheldBias = BASE_WITHHELD_BIAS

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

  // ── ISR v2.5: apply somatic bias ──────────────────────────────────────────
  if (somaticInfluence && somaticInfluence.influenceStrength > 0) {
    const s = somaticInfluence.influenceStrength
    const avg = somaticInfluence.averageOutcome

    if (avg.naturalness < -0.2 && utteranceMode === 'boundary' && s > 0.5) {
      utteranceMode = 'receptive'
      trace.push(`Somatic bias: shifted boundary → receptive (naturalness=${avg.naturalness.toFixed(2)}, strength=${s.toFixed(2)})`)
    }

    if (avg.openness > 0.3 && s > 0.4) {
      shouldOfferStep = true
      trace.push(`Somatic bias: shouldOfferStep=true (openness=${avg.openness.toFixed(2)})`)
    }

    if (avg.helpfulness > 0.3) {
      withheldBias -= s * 0.08
      trace.push(`Somatic bias: withheldBias reduced by ${(s * 0.08).toFixed(3)} (helpfulness=${avg.helpfulness.toFixed(2)})`)
    }

    if (avg.naturalness < -0.2) {
      withheldBias += s * 0.08
      trace.push(`Somatic bias: withheldBias increased by ${(s * 0.08).toFixed(3)} (naturalness=${avg.naturalness.toFixed(2)})`)
    }

    trace.push(`Somatic influence applied: strength=${s.toFixed(2)}, markers=${somaticInfluence.matchedMarkerIds.length}`)
  }

  if (optionContext?.awareness) {
    const ratioSummary = Object.entries(optionContext.awareness.optionRatios)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([optionId, ratio]) => `${optionId}:${ratio}`)
      .join(', ')
    trace.push(`Option awareness: ${optionContext.awareness.summaryLabel} [${ratioSummary}]`)
  }

  if (optionContext?.optionDecision) {
    const optionDecision = optionContext.optionDecision
    trace.push(`Option decision: stance=${optionDecision.stance}, preferred=${optionDecision.preferredOptionId ?? 'none'}`)

    if (optionDecision.stance === 'observe' && utteranceMode !== 'boundary') {
      utteranceMode = 'receptive'
      replyIntent = 'emotional_holding'
      withheldBias += 0.08
      trace.push('Option shaping: receptive hold (hesitation kept explicit)')
    } else if (optionDecision.stance === 'bridge' && utteranceMode !== 'boundary') {
      utteranceMode = 'reflective'
      replyIntent = 'soft_answer_offer_step'
      shouldOfferStep = true
      withheldBias = Math.max(0, withheldBias - 0.04)
      trace.push('Option shaping: reflective bridge (middle path suggested)')
    } else if (optionDecision.stance === 'lean' && utteranceMode === 'receptive') {
      utteranceMode = 'reflective'
      replyIntent = 'soft_answer_offer_step'
      shouldOfferStep = true
      trace.push('Option shaping: reflective lean (slight foregrounding)')
    } else if (optionDecision.stance === 'commit' && utteranceMode !== 'boundary') {
      utteranceMode = resonanceScore > 0.55 ? 'resonant' : 'reflective'
      replyIntent = 'soft_answer_offer_step'
      shouldOfferStep = true
      closeness += 0.04
      withheldBias = Math.max(0, withheldBias - 0.05)
      trace.push('Option shaping: favored option foregrounded')
    }
  }

  if (optionContext?.fusedState) {
    const fusedState = optionContext.fusedState
    const lexicalState = optionContext.lexicalState ?? fusedState.lexicalState
    const microSignalState = optionContext.microSignalState ?? fusedState.microSignalState
    const { dimensions, fieldTone } = microSignalState

    trace.push(
      `Dual stream: request=${lexicalState.requestType ?? 'none'}, fieldTone=${fieldTone}, textures=${fusedState.dominantTextures.join(', ') || 'none'}, confidence=${fusedState.fusedConfidence.toFixed(2)}`,
    )

    if (lexicalState.requestType === 'advice' && dimensions.heaviness >= 0.62 && dimensions.openness <= 0.42) {
      utteranceMode = utteranceMode === 'boundary' ? 'boundary' : 'reflective'
      replyIntent = 'soft_answer_offer_step'
      shouldOfferStep = true
      closeness += 0.06
      withheldBias += 0.06
      trace.push('Dual stream shaping: advice request kept soft because heaviness is high and openness is low')
    } else if (
      (lexicalState.requestType === 'advice' || lexicalState.requestType === 'choice')
      && dimensions.openness >= 0.58
      && dimensions.clarity >= 0.54
      && utteranceMode === 'receptive'
    ) {
      utteranceMode = 'reflective'
      replyIntent = 'soft_answer_offer_step'
      shouldOfferStep = true
      withheldBias = Math.max(0, withheldBias - 0.04)
      trace.push('Dual stream shaping: openness and clarity allow a clearer comparative answer')
    }

    if (dimensions.fragility >= 0.64) {
      closeness += 0.04
      withheldBias += 0.05
      trace.push('Dual stream shaping: fragility raised closeness and caution')
    }
  }

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
    somaticInfluence,
    optionAwareness: optionContext?.awareness,
    optionDecision: optionContext?.optionDecision,
    optionUtteranceHints: optionContext?.optionUtteranceHints,
    fusedState: optionContext?.fusedState,
    lexicalState: optionContext?.lexicalState ?? optionContext?.fusedState?.lexicalState,
    microSignalState: optionContext?.microSignalState ?? optionContext?.fusedState?.microSignalState,
  }
}
