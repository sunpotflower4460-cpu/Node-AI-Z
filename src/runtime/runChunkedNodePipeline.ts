import type { ChunkedPipelineStage } from '../intelligence/signal/chunkTypes'
import type { CoreNode, SuppressedNode } from '../types/nodeStudio'
import type { NodePipelineResult } from '../types/nodeStudio'
import type { PlasticityState } from '../revision/types'
import type { TemporalFeatureState } from '../intelligence/signal/temporalTypes'
import type { PredictionState, PredictionModulationResult } from '../intelligence/predictive/types'
import type { ProtoMeaning, ProtoMeaningHierarchy } from '../intelligence/meaning/types'
import type { SomaticMarker, SomaticSignature, SomaticInfluence } from '../intelligence/somatic/types'
import { chunkText } from '../intelligence/signal/chunkText'
import { activateChunkFeatures } from '../intelligence/signal/activateChunkFeatures'
import { applyTemporalDecay } from '../intelligence/signal/applyTemporalDecay'
import { applyRefractoryGating } from '../intelligence/signal/applyRefractoryGating'
import { applyFeatureInhibition } from '../intelligence/signal/applyFeatureInhibition'
import { computeDynamicThreshold } from '../intelligence/signal/computeDynamicThreshold'
import { runRecurrentSelfLoop, SELF_BELIEF_FEATURE_IDS } from '../intelligence/signal/runRecurrentSelfLoop'
import { applyLateralInhibition } from '../intelligence/signal/applyLateralInhibition'
import { buildNodeActivationsFromFeatures } from '../intelligence/signal/buildNodeActivationsFromFeatures'
import { bindNodes, liftPatterns, analyzeNodeField } from '../core/runNodePipeline'
import { applyPredictionModulation } from '../intelligence/predictive/applyPredictionModulation'
import { updatePredictionState } from '../intelligence/predictive/updatePredictionState'
import { buildEmptyPredictionState } from '../intelligence/predictive/buildPredictionState'
import { deriveSensoryProtoMeanings } from '../intelligence/meaning/deriveSensoryProtoMeanings'
import { deriveNarrativeProtoMeanings } from '../intelligence/meaning/deriveNarrativeProtoMeanings'
import { mergeProtoMeaningHierarchy } from '../intelligence/meaning/mergeProtoMeaningHierarchy'
import { deriveSomaticSignature, findRelevantSomaticMarkers, computeSomaticInfluence } from '../intelligence/somatic/index'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Maximum number of lateral-inhibition pathway keys recorded per turn.
 * Kept intentionally small: we care about the most strongly inhibited
 * features, not an exhaustive list, to keep pathway key noise low.
 */
const MAX_LATERAL_PATHWAY_KEYS = 3

/**
 * Result of the Integrated Signal Runtime v2.3 pipeline.
 *
 * Extends NodePipelineResult with the chunk + feature stage, so that
 * the existing binding / pattern / field pipeline receives nodes that
 * carry activationProfile information.
 */
export type ChunkedNodePipelineResult = NodePipelineResult & {
  chunkedStage: ChunkedPipelineStage
  /** Full prediction modulation result (ISR v2.3); undefined if no prior was supplied */
  predictionModulationResult?: PredictionModulationResult
  /** Next-turn prediction state derived from this turn's active features (ISR v2.3) */
  nextPredictionState: PredictionState
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  protoMeaningHierarchy: ProtoMeaningHierarchy
  /** Somatic signature derived from this turn's proto-meanings (ISR v2.5) */
  somaticSignature?: SomaticSignature
  /** Relevant somatic markers found this turn (ISR v2.5) */
  relevantSomaticMarkers?: SomaticMarker[]
  /** Somatic influence on decision computed this turn (ISR v2.5) */
  somaticInfluence?: SomaticInfluence
}

const collectProtoMeaningPathwayKeys = (meanings: ProtoMeaning[]) => {
  const keys: string[] = []

  for (const meaning of meanings) {
    if (meaning.level === 'sensory') {
      keys.push(...meaning.sourceFeatureIds.map((featureId) => `feature:${featureId}->sensory:${meaning.glossJa}`))
      continue
    }

    if (meaning.level === 'narrative') {
      const childLabels = meaning.childIds?.map((childId) => childId.replace(/^sensory:/, '')).join('+')
      if (childLabels) {
        keys.push(`sensory:${childLabels}->narrative:${meaning.glossJa}`)
      }
    }
  }

  return [...new Set(keys)]
}

/**
 * ISR v2.3 — Integrated Signal Runtime v2.3
 * (Predictive Coding + Surprise Layer)
 *
 * Flow:
 *   text
 *   → meaning chunks
 *   → feature activations
 *   → temporal decay          [v2.2]
 *   → refractory gating       [v2.2]
 *   → feature inhibition
 *   → prediction modulation   [NEW v2.3] ← compare against prior, boost surprising features
 *   → dynamic threshold filtering
 *   → recurrent self loop     [v2.2]
 *   → lateral inhibition      [v2.2]
 *   → node activations with activationProfile
 *   → existing binding / pattern / field pipeline
 *   → update prediction prior [NEW v2.3]
 *
 * The result is fully compatible with NodePipelineResult; callers that
 * do not need the chunk stage can ignore `chunkedStage`.
 *
 * @param recentActivityScore  0–1 value representing how intense recent
 *   interaction has been.  Defaults to 0.5 (neutral).
 * @param currentTurn  Turn counter for temporal decay / refractory calculations.
 *   Defaults to 0.  Callers should pass the current session turn number so
 *   that elapsed time is computed correctly across turns.
 * @param previousTemporalStates  Optional map of feature id → TemporalFeatureState
 *   carried over from the previous turn.  Used to compute decay from prior firing.
 * @param personalBias  Optional per-feature bias adjustments for the recurrent
 *   self loop (feature id → delta, e.g. from personal learning state).
 * @param afterglowStrength  Residual activation from the previous turn (0–0.2).
 *   A positive value slightly boosts initial feature strengths.
 * @param previousPredictionState  [ISR v2.3] Prior prediction from the previous turn.
 *   If supplied, prediction errors are computed and surprise-driven modulation is applied
 *   before the dynamic threshold / self-loop stages.  When omitted, the step is a no-op.
 */
export const runChunkedNodePipeline = (
  text: string,
  plasticity?: PlasticityState,
  recentActivityScore = 0.5,
  currentTurn = 0,
  previousTemporalStates?: Map<string, TemporalFeatureState>,
  personalBias?: Record<string, number>,
  afterglowStrength = 0,
  previousPredictionState?: PredictionState,
  somaticMarkers?: SomaticMarker[],
): ChunkedNodePipelineResult => {
  const startedAt = now()
  const debug: string[] = ['ISR v2.5 started', 'ISR v2.3 predictive coding retained']

  // ── 1. Meaning chunks ──────────────────────────────────────────────────────
  const chunks = chunkText(text)
  debug.push(`Chunks (${chunks.length}): ${chunks.map((c) => `"${c.text}"`).join(' | ')}`)

  // ── 2. Feature activations ─────────────────────────────────────────────────
  let rawFeatures = activateChunkFeatures(chunks)

  // Apply afterglow: slight residual boost from previous turn activity
  if (afterglowStrength > 0 && rawFeatures.length > 0) {
    rawFeatures = rawFeatures.map((f) => ({
      ...f,
      strength: Math.min(f.rawStrength, f.strength + afterglowStrength),
    }))
    debug.push(`Afterglow applied: +${afterglowStrength.toFixed(3)} bias`)
  }

  debug.push(`Raw features (${rawFeatures.length}): ${rawFeatures.map((f) => `${f.id}(${f.rawStrength.toFixed(2)})`).join(', ')}`)

  // ── 3. Temporal decay ──────────────────────────────────────────────────────
  const { features: decayedFeatures, debugNotes: decayNotes } = applyTemporalDecay(
    rawFeatures,
    currentTurn,
    previousTemporalStates,
  )
  debug.push(...decayNotes)

  // Pathway keys for features affected by decay
  const decayPathwayKeys: string[] = rawFeatures
    .filter((rf) => {
      const df = decayedFeatures.find((d) => d.id === rf.id)
      return df && df.strength < rf.strength
    })
    .map((rf) => `feature:${rf.id}->decay`)

  // ── 4. Refractory gating ───────────────────────────────────────────────────
  const { features: refractoryFeatures, debugNotes: refractoryNotes } = applyRefractoryGating(
    decayedFeatures,
    currentTurn,
  )
  debug.push(...refractoryNotes)

  // ── 5. Inhibitory signals ──────────────────────────────────────────────────
  const inhibitedFeatures = applyFeatureInhibition(refractoryFeatures)
  inhibitedFeatures.forEach((f) => {
    const pre = refractoryFeatures.find((r) => r.id === f.id)
    if (pre && f.strength < pre.strength) {
      debug.push(`Inhibited: ${f.id} ${pre.strength.toFixed(2)} → ${f.strength.toFixed(2)}`)
    }
  })

  // ── 6. Prediction modulation (ISR v2.3) ────────────────────────────────────
  const prior = previousPredictionState ?? buildEmptyPredictionState(currentTurn)
  const predictionModulation = applyPredictionModulation(inhibitedFeatures, prior)
  debug.push(...predictionModulation.debugNotes)

  // Pathway keys for significant surprise signals
  const surprisePathwayKeys: string[] = predictionModulation.surpriseSignals
    .filter((s) => s.magnitude >= 0.3)
    .map((s) => `feature:${s.featureId}->surprise_${s.direction}`)

  // Features entering the threshold stage: modulated when a prior was present,
  // otherwise unchanged (modulation was a no-op).
  const preThresholdFeatures = predictionModulation.features

  // ── 7. Dynamic threshold ───────────────────────────────────────────────────
  const threshold = computeDynamicThreshold(recentActivityScore)
  debug.push(`Dynamic threshold: ${threshold.current.toFixed(3)} (recentActivity: ${threshold.recentActivityScore.toFixed(2)})`)

  const thresholdPathwayKey = `threshold:adaptive=${threshold.current.toFixed(2)}`
  const thresholdedFeatures = preThresholdFeatures.filter((f) => f.strength >= threshold.current)
  debug.push(`Features after threshold (${thresholdedFeatures.length}): ${thresholdedFeatures.map((f) => f.id).join(', ')}`)

  // ── 8. Recurrent self loop ─────────────────────────────────────────────────
  const recurrentResult = runRecurrentSelfLoop(
    thresholdedFeatures,
    personalBias,
    /* maxLoops */ 8,
    /* convergenceThreshold */ 0.01,
  )
  debug.push(
    `Recurrent self loop: ${recurrentResult.iterations} iteration(s), converged=${recurrentResult.converged}`,
  )
  debug.push(...recurrentResult.debugNotes)

  const loopPathwayKey = recurrentResult.converged
    ? 'loop:self_reaction->converged'
    : 'loop:self_reaction->max_loops'

  // Final features after the loop
  const loopFeatures =
    recurrentResult.states.length > 0
      ? recurrentResult.states[recurrentResult.states.length - 1]
      : thresholdedFeatures

  // Pathway keys for self/belief features that went through the loop
  const loopPathwayKeys: string[] = loopFeatures
    .filter((f) => SELF_BELIEF_FEATURE_IDS.has(f.id))
    .map((f) => `feature:${f.id}->recurrent_loop`)

  // ── 9. Lateral inhibition ─────────────────────────────────────────────────
  const { features: lateralInhibitedFeatures, debugNotes: lateralNotes } =
    applyLateralInhibition(loopFeatures)
  debug.push(...lateralNotes)

  // Pathway keys for lateral inhibition
  // Limited to MAX_LATERAL_PATHWAY_KEYS to avoid flooding the learning layer with noise.
  const lateralPathwayKeys: string[] = loopFeatures
    .filter((lf) => {
      const after = lateralInhibitedFeatures.find((a) => a.id === lf.id)
      return after && after.strength < lf.strength
    })
    .slice(0, MAX_LATERAL_PATHWAY_KEYS)
    .map((f) => `feature:${f.id}->lateral_inhibition`)

  const activeFeatures = lateralInhibitedFeatures

  const chunkedStage: ChunkedPipelineStage = {
    chunks,
    rawFeatures,
    decayedFeatures,
    refractoryFeatures,
    inhibitedFeatures,
    threshold,
    recurrentResult,
    lateralInhibitedFeatures,
    activeFeatures,
    modulatedFeatures: previousPredictionState ? predictionModulation.features : undefined,
    debugNotes: [...debug],
  }

  // ── 11. Node activations from features ────────────────────────────────────
  let activatedNodes: CoreNode[] = []
  if (activeFeatures.length > 0) {
    activatedNodes = buildNodeActivationsFromFeatures(activeFeatures, plasticity)
      .sort((a, b) => b.value - a.value)
    debug.push(`Nodes from features (${activatedNodes.length}): ${activatedNodes.map((n) => `${n.id}(${n.value.toFixed(2)})`).join(', ')}`)
  }

  // Fallback: no features cleared the threshold
  if (activatedNodes.length === 0) {
    activatedNodes = [{
      id: 'processing',
      label: 'processing',
      category: 'system',
      value: 0.5,
      reasons: ['feature 発火がしきい値を超えなかったため、受容モードで待機'],
    }]
    debug.push("Fallback: 'processing' node activated")
  }

  // ── 12. Suppressed nodes (mirror existing pipeline behaviour) ─────────────
  const suppressedNodes: SuppressedNode[] = []
  const hasNode = (id: string) => activatedNodes.some((n) => n.id === id)

  if (hasNode('fatigue')) {
    suppressedNodes.push({ id: 'excitement', label: 'excitement', value: 0.1, reason: 'fatigue ノードによる強い抑制' })
  }
  if (hasNode('ambiguity')) {
    suppressedNodes.push({ id: 'clarity', label: 'clarity', value: 0.05, reason: 'ambiguity による完全な抑制' })
    suppressedNodes.push({ id: 'articulation', label: 'articulation', value: 0.1, reason: '明示的な言語化の停止' })
  }
  if (hasNode('self_doubt')) {
    suppressedNodes.push({ id: 'self_efficacy', label: 'self_efficacy', value: 0.05, reason: 'self_doubt による完全な抑制' })
    suppressedNodes.push({ id: 'decisiveness', label: 'decisiveness', value: 0.2, reason: '葛藤による判断の保留' })
  }
  if (hasNode('faint_hope')) {
    suppressedNodes.push({ id: 'despair', label: 'despair', value: 0.15, reason: '希望の兆しによる押し返し' })
  }

  // ── 13. Existing binding / pattern / field pipeline ───────────────────────
  const bound = bindNodes(activatedNodes, plasticity)
  const lifted = liftPatterns(activatedNodes, bound.bindings, plasticity)
  const analyzed = analyzeNodeField(activatedNodes, bound.bindings)

  // ── 14. Hierarchical proto-meanings (ISR v2.4) ────────────────────────────
  const sensoryProtoMeanings = deriveSensoryProtoMeanings({
    features: activeFeatures,
    nodes: activatedNodes,
    field: analyzed.stateVector,
    bindings: bound.bindings,
  })
  debug.push(
    `Sensory proto-meanings (${sensoryProtoMeanings.length}): ${sensoryProtoMeanings.map((meaning) => `${meaning.glossJa}(${meaning.strength.toFixed(2)})`).join(', ')}`,
  )

  const narrativeProtoMeanings = deriveNarrativeProtoMeanings({
    sensoryProtoMeanings,
    nodes: activatedNodes,
    field: analyzed.stateVector,
    predictionErrorSummary: {
      overallSurprise: predictionModulation.overallSurprise,
      featureIds: predictionModulation.surpriseSignals.map((signal) => signal.featureId),
    },
  })
  debug.push(
    `Narrative proto-meanings (${narrativeProtoMeanings.length}): ${narrativeProtoMeanings.map((meaning) => `${meaning.glossJa}(${meaning.strength.toFixed(2)})`).join(', ')}`,
  )

  const protoMeaningHierarchy = mergeProtoMeaningHierarchy(sensoryProtoMeanings, narrativeProtoMeanings)

  // ── 14b. Somatic Marker Layer (ISR v2.5) ──────────────────────────────────
  let somaticSignature: SomaticSignature | undefined
  let relevantSomaticMarkers: SomaticMarker[] | undefined
  let somaticInfluence: SomaticInfluence | undefined

  if (somaticMarkers && somaticMarkers.length >= 0) {
    somaticSignature = deriveSomaticSignature(sensoryProtoMeanings, narrativeProtoMeanings, analyzed.stateVector)
    relevantSomaticMarkers = findRelevantSomaticMarkers(somaticSignature, somaticMarkers)
    somaticInfluence = computeSomaticInfluence(relevantSomaticMarkers)
    debug.push(`ISR v2.5 Somatic: signature derived, ${relevantSomaticMarkers.length} relevant marker(s), influenceStrength=${somaticInfluence.influenceStrength.toFixed(2)}`)
    if (somaticInfluence.debugNotes.length > 0) {
      debug.push(...somaticInfluence.debugNotes.map((note) => `  somatic: ${note}`))
    }
  }

  // ── 15. Next-turn prediction prior (ISR v2.3) ─────────────────────────────
  const nextPredictionState = updatePredictionState(activeFeatures, currentTurn)
  debug.push(
    `Prediction prior updated: ${nextPredictionState.expectedFeatureIds.length} feature(s) → next turn (confidence=${nextPredictionState.confidence.toFixed(3)})`,
  )

  const elapsedMs = now() - startedAt

  // ── Pathway keys for learning ─────────────────────────────────────────────
  const allPathwayKeys: string[] = [
    ...decayPathwayKeys,
    ...loopPathwayKeys,
    ...lateralPathwayKeys,
    ...surprisePathwayKeys,
    ...collectProtoMeaningPathwayKeys(protoMeaningHierarchy.all),
    loopPathwayKey,
    thresholdPathwayKey,
  ]

  return {
    inputText: text,
    activatedNodes: activatedNodes.sort((a, b) => b.value - a.value),
    suppressedNodes: suppressedNodes.sort((a, b) => a.value - b.value),
    bindings: bound.bindings.sort((a, b) => b.weight - a.weight),
    liftedPatterns: lifted.liftedPatterns.sort((a, b) => b.score - a.score),
    stateVector: analyzed.stateVector,
    debugNotes: [
      'ISR v2.5 Pipeline started',
      'ISR v2.5 Somatic Marker Decision Layer enabled',
      ...debug,
      ...bound.debugNotes,
      ...lifted.debugNotes,
      ...analyzed.debugNotes,
      `ISR v2.5 Pipeline completed in ${elapsedMs.toFixed(2)} ms`,
    ],
    meta: {
      retrievalCount: activatedNodes.length,
      bindingCount: bound.bindings.length,
      patternCount: lifted.liftedPatterns.length,
      elapsedMs,
    },
    pathwayKeys: allPathwayKeys,
    chunkedStage,
    predictionModulationResult: previousPredictionState ? predictionModulation : undefined,
    nextPredictionState,
    sensoryProtoMeanings,
    narrativeProtoMeanings,
    protoMeaningHierarchy,
    somaticSignature,
    relevantSomaticMarkers,
    somaticInfluence,
  }
}
