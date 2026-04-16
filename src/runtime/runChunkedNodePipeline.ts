import type { ChunkedPipelineStage } from '../signal/chunkTypes'
import type { CoreNode, SuppressedNode } from '../types/nodeStudio'
import type { NodePipelineResult } from '../types/nodeStudio'
import type { PlasticityState } from '../revision/types'
import type { TemporalFeatureState } from '../signal/temporalTypes'
import { chunkText } from '../signal/chunkText'
import { activateChunkFeatures } from '../signal/activateChunkFeatures'
import { applyTemporalDecay } from '../signal/applyTemporalDecay'
import { applyRefractoryGating } from '../signal/applyRefractoryGating'
import { applyFeatureInhibition } from '../signal/applyFeatureInhibition'
import { computeDynamicThreshold } from '../signal/computeDynamicThreshold'
import { runRecurrentSelfLoop } from '../signal/runRecurrentSelfLoop'
import { applyLateralInhibition } from '../signal/applyLateralInhibition'
import { buildNodeActivationsFromFeatures } from '../signal/buildNodeActivationsFromFeatures'
import { bindNodes, liftPatterns, analyzeNodeField } from '../core/runNodePipeline'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Result of the Integrated Signal Runtime v2.2 pipeline.
 *
 * Extends NodePipelineResult with the chunk + feature stage, so that
 * the existing binding / pattern / field pipeline receives nodes that
 * carry activationProfile information.
 */
export type ChunkedNodePipelineResult = NodePipelineResult & {
  chunkedStage: ChunkedPipelineStage
}

/**
 * ISR v2.2 — Integrated Signal Runtime v2.2
 * (Temporal Decay + Refractory Period + Recurrent Self Loop + Lateral Inhibition)
 *
 * Flow:
 *   text
 *   → meaning chunks
 *   → feature activations
 *   → temporal decay          [NEW v2.2]
 *   → refractory gating       [NEW v2.2]
 *   → feature inhibition
 *   → dynamic threshold filtering
 *   → recurrent self loop     [NEW v2.2]
 *   → lateral inhibition      [NEW v2.2]
 *   → node activations with activationProfile
 *   → existing binding / pattern / field pipeline
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
 */
export const runChunkedNodePipeline = (
  text: string,
  plasticity?: PlasticityState,
  recentActivityScore = 0.5,
  currentTurn = 0,
  previousTemporalStates?: Map<string, TemporalFeatureState>,
  personalBias?: Record<string, number>,
  afterglowStrength = 0,
): ChunkedNodePipelineResult => {
  const startedAt = now()
  const debug: string[] = ['ISR v2.2 started']

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

  // ── 6. Dynamic threshold ───────────────────────────────────────────────────
  const threshold = computeDynamicThreshold(recentActivityScore)
  debug.push(`Dynamic threshold: ${threshold.current.toFixed(3)} (recentActivity: ${threshold.recentActivityScore.toFixed(2)})`)

  const thresholdPathwayKey = `threshold:adaptive=${threshold.current.toFixed(2)}`
  const thresholdedFeatures = inhibitedFeatures.filter((f) => f.strength >= threshold.current)
  debug.push(`Features after threshold (${thresholdedFeatures.length}): ${thresholdedFeatures.map((f) => f.id).join(', ')}`)

  // ── 7. Recurrent self loop ─────────────────────────────────────────────────
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
    .filter((f) =>
      ['self_critique', 'uncertainty_expression', 'hope_signal', 'distress_signal', 'longing_for_recognition'].includes(f.id),
    )
    .map((f) => `feature:${f.id}->recurrent_loop`)

  // ── 8. Lateral inhibition ─────────────────────────────────────────────────
  const { features: lateralInhibitedFeatures, debugNotes: lateralNotes } =
    applyLateralInhibition(loopFeatures)
  debug.push(...lateralNotes)

  // Pathway keys for lateral inhibition
  const lateralPathwayKeys: string[] = loopFeatures
    .filter((lf) => {
      const after = lateralInhibitedFeatures.find((a) => a.id === lf.id)
      return after && after.strength < lf.strength
    })
    .slice(0, 3)
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
    debugNotes: [...debug],
  }

  // ── 9. Node activations from features ─────────────────────────────────────
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

  // ── 10. Suppressed nodes (mirror existing pipeline behaviour) ─────────────
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

  // ── 11. Existing binding / pattern / field pipeline ───────────────────────
  const bound = bindNodes(activatedNodes, plasticity)
  const lifted = liftPatterns(activatedNodes, bound.bindings, plasticity)
  const analyzed = analyzeNodeField(activatedNodes, bound.bindings)

  const elapsedMs = now() - startedAt

  // ── Pathway keys for learning ─────────────────────────────────────────────
  const allPathwayKeys: string[] = [
    ...decayPathwayKeys,
    ...loopPathwayKeys,
    ...lateralPathwayKeys,
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
      'ISR v2.2 Pipeline started',
      ...debug,
      ...bound.debugNotes,
      ...lifted.debugNotes,
      ...analyzed.debugNotes,
      `ISR v2.2 Pipeline completed in ${elapsedMs.toFixed(2)} ms`,
    ],
    meta: {
      retrievalCount: activatedNodes.length,
      bindingCount: bound.bindings.length,
      patternCount: lifted.liftedPatterns.length,
      elapsedMs,
    },
    pathwayKeys: allPathwayKeys,
    chunkedStage,
  }
}
