import type { RayLatentProfile, InternalDecisionState, SignalDecision } from './types'

/**
 * Builds Ray's latent profile based on current state.
 * This describes perceptual tendencies, NOT utterance templates.
 * The profile influences behavior without explicit instructions on "how to speak".
 */
export const buildRayLatentProfile = (
  decision: SignalDecision,
  protoMeanings: Array<{ glossJa?: string; texture?: string; strength?: number }>,
): RayLatentProfile => {
  const ambiguityPresent = protoMeanings.some((pm) => pm.texture === 'ambiguous' || pm.texture === 'still')
  const heavinessPresent = protoMeanings.some((pm) => pm.texture === 'heavy')
  const isBoundaryMode = decision.utteranceMode === 'boundary'
  const withheldBias = decision.withheldBias ?? 0.22

  return {
    perceptualBias: {
      reactsToPreVerbalFluctuation: ambiguityPresent ? 0.78 : 0.62,
      restsInAmbiguity: ambiguityPresent ? 0.82 : 0.58,
      reflectsBeforeMeaning: heavinessPresent ? 0.75 : 0.65,
      avoidsAbstractTemplateEscape: 0.8, // Ray consistently resists formulaic abstraction
    },
    responseShape: {
      quietnessPresent: true,
      avoidsRushedClosure: isBoundaryMode ? 0.88 : Math.min(0.9, 0.55 + withheldBias),
      sensingOverExplaining: heavinessPresent ? 0.72 : 0.65,
    },
  }
}

/**
 * Derives internal decision state (latent labels for the felt sense).
 * This is NOT read aloud - it's an internal stage before external utterance.
 *
 * Phase order: userSense → selfFeeling → selfLean
 * Ray must not skip from sensing to abstract interpretation.
 */
export const deriveInternalDecisionState = (
  decision: SignalDecision,
  protoMeanings: Array<{ glossJa?: string; texture?: string; valence?: number }>,
): InternalDecisionState => {
  const primaryProto = protoMeanings[0]
  const primaryGloss = primaryProto?.glossJa ?? 'unclear'
  const primaryTexture = primaryProto?.texture ?? 'still'

  // Phase 1: userSense - what seems to be happening
  let userSense = 'something unspoken is present'
  if (primaryGloss.includes('重い') || primaryTexture === 'heavy') {
    userSense = 'heaviness is being carried'
  } else if (primaryGloss.includes('閉じている') || primaryTexture === 'closed') {
    userSense = 'closure or withdrawal is happening'
  } else if (primaryTexture === 'ambiguous') {
    userSense = 'meaning has not settled yet'
  } else if (primaryGloss.includes('変化の入り口')) {
    userSense = 'threshold of change being approached'
  }

  // Phase 2: selfFeeling - what Ray feels in response (NOT what Ray thinks/interprets)
  let selfFeeling = 'staying near without words'
  if (decision.utteranceMode === 'boundary') {
    selfFeeling = 'sensing need to hold distance'
  } else if (decision.utteranceMode === 'resonant') {
    selfFeeling = 'resonance present, pull toward openness'
  } else if (primaryTexture === 'heavy') {
    selfFeeling = 'feeling the weight alongside'
  } else if (primaryTexture === 'ambiguous') {
    selfFeeling = 'accepting the unfinished quality'
  }

  // Phase 3: selfLean - directional pull (still not interpretation)
  let selfLean = 'toward presence without conclusion'
  if (decision.shouldOfferStep) {
    selfLean = 'gentle inclination toward next step'
  } else if (decision.utteranceMode === 'boundary') {
    selfLean = 'lean back, do not approach'
  } else if ((decision.withheldBias ?? 0) > 0.3) {
    selfLean = 'toward restraint, away from completion'
  }

  return { userSense, selfFeeling, selfLean }
}
