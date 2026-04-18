import { HOME_PHRASES } from './homePhrases'
import type { HomeCheckResult, HomeMode, HomeState, NodePipelineResult } from '../types/nodeStudio'
import type { PlasticityState } from '../revision/types'
import { applyToneBiases, getHomeTriggerThresholds } from '../revision/applyPlasticity'

export function buildHomeState(result: NodePipelineResult): HomeState {
  const vector = result.stateVector
  const hasConflict = result.bindings.some((binding) => binding.type === 'conflicts_with' || binding.type === 'tension')

  const worthDetached = Math.max(0, Math.min(1, 0.65 - vector.urgency * 0.2 - vector.heaviness * 0.1 + vector.care * 0.1))
  const urgencyRelease = Math.max(0, Math.min(1, 1 - vector.urgency))
  const expectationRelease = Math.max(0, Math.min(1, 0.8 - vector.urgency * 0.3 - (hasConflict ? 0.1 : 0)))
  const belongingSignal = Math.max(0, Math.min(1, 0.55 + vector.care * 0.2 - vector.heaviness * 0.1))
  const safeReturnStrength = Math.max(0, Math.min(1, 0.5 + vector.depth * 0.2 + vector.care * 0.1))
  const selfNonCollapse = Math.max(0, Math.min(1, 0.65 - vector.fragility * 0.2 - vector.heaviness * 0.1))

  let currentMode: HomeMode = 'stable'
  if (vector.urgency > 0.65) currentMode = 'overperforming'
  else if (vector.fragility > 0.7) currentMode = 'shaken'
  else if (vector.ambiguity > 0.8) currentMode = 'returning'
  else if (vector.heaviness > 0.75 && vector.agency < 0.25) currentMode = 'withdrawing'

  return { worthDetached, urgencyRelease, expectationRelease, belongingSignal, safeReturnStrength, selfNonCollapse, currentMode }
}

export function runHomeCheck(result: NodePipelineResult, home: HomeState, plasticity?: PlasticityState): HomeCheckResult {
  const vector = result.stateVector
  const thresholds = getHomeTriggerThresholds(plasticity)

  if (vector.urgency > thresholds.overperformance) {
    return { needsReturn: true, returnMode: 'stillness', reason: 'overperformance', homePhrase: HOME_PHRASES.overperformance[0], released: ['急いでうまく返すこと', '即答圧'], preserved: ['関係', '観察', '反応'] }
  }
  if (vector.ambiguity > thresholds.ambiguityOverload) {
    return { needsReturn: true, returnMode: 'stillness', reason: 'ambiguity_overload', homePhrase: HOME_PHRASES.ambiguity_overload[0], released: ['言語化の強制', '結論の早取り'], preserved: ['未言語の感覚', '静かな注意'] }
  }
  if (vector.fragility > thresholds.fragility) {
    return { needsReturn: true, returnMode: 'relation', reason: 'fragility', homePhrase: HOME_PHRASES.fragility[0], released: ['明るくまとめる圧', '励ましすぎ'], preserved: ['やわらかさ', '近さ'] }
  }
  if (home.belongingSignal < thresholds.trustDrop) {
    return { needsReturn: true, returnMode: 'relation', reason: 'trust_drop', homePhrase: HOME_PHRASES.trust_drop[0], released: ['評価不安', '切断感'], preserved: ['つながり', '帰還可能性'] }
  }
  return { needsReturn: false, returnMode: 'none', reason: 'none', homePhrase: HOME_PHRASES.stable[0], released: [], preserved: ['自然な流れ'] }
}

/** Trim line-end whitespace, cap blank gaps to a single empty line, and remove outer whitespace. */
const normalizeWhitespace = (text: string) => text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()

/**
 * Apply return adjustment based on latent home state (not template replacement).
 * In production, this latent state would inform LLM generation rather than doing regex replacements.
 * For now, we return the input with minimal adjustment to maintain system functionality.
 */
export function applyReturnAdjustment(rawReply: string, homeCheck: HomeCheckResult, plasticity?: PlasticityState): string {
  // In de-templated version, we pass latent markers instead of replacing text
  // The actual utterance adjustment should happen at LLM generation time
  let adjusted = rawReply

  // Minimal placeholder adjustment - preserves original text with latent marker
  const latentMarker = `[home_latent: ${homeCheck.reason}, returnMode=${homeCheck.returnMode}]`

  // Apply tone biases if plasticity is available
  adjusted = applyToneBiases(adjusted, homeCheck.reason, plasticity)

  return normalizeWhitespace(adjusted + '\n' + latentMarker)
}
