import type { ChunkedPipelineStage } from '../signal/chunkTypes'
import type { CoreNode, SuppressedNode } from '../types/nodeStudio'
import type { NodePipelineResult } from '../types/nodeStudio'
import type { PlasticityState } from '../revision/types'
import { chunkText } from '../signal/chunkText'
import { activateChunkFeatures } from '../signal/activateChunkFeatures'
import { applyFeatureInhibition } from '../signal/applyFeatureInhibition'
import { computeDynamicThreshold } from '../signal/computeDynamicThreshold'
import { buildNodeActivationsFromFeatures } from '../signal/buildNodeActivationsFromFeatures'
import { bindNodes, liftPatterns, analyzeNodeField } from '../core/runNodePipeline'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Result of the Integrated Signal Runtime v2.1 pipeline.
 *
 * Extends NodePipelineResult with the chunk + feature stage, so that
 * the existing binding / pattern / field pipeline receives nodes that
 * carry activationProfile information.
 */
export type ChunkedNodePipelineResult = NodePipelineResult & {
  chunkedStage: ChunkedPipelineStage
}

/**
 * ISR v2.1 — Integrated Signal Runtime v2.1
 *
 * Flow:
 *   text
 *   → meaning chunks
 *   → feature activations
 *   → feature inhibition
 *   → dynamic threshold filtering
 *   → node activations with activationProfile
 *   → existing binding / pattern / field pipeline
 *
 * The result is fully compatible with NodePipelineResult; callers that
 * do not need the chunk stage can ignore `chunkedStage`.
 *
 * @param recentActivityScore  0–1 value representing how intense recent
 *   interaction has been.  Defaults to 0.5 (neutral).  Pass higher values
 *   when the previous turn was emotionally heavy, lower when it was quiet.
 */
export const runChunkedNodePipeline = (
  text: string,
  plasticity?: PlasticityState,
  recentActivityScore = 0.5,
): ChunkedNodePipelineResult => {
  const startedAt = now()
  const debug: string[] = ['ISR v2.1 started']

  // ── 1. Meaning chunks ──────────────────────────────────────────────────────
  const chunks = chunkText(text)
  debug.push(`Chunks (${chunks.length}): ${chunks.map((c) => `"${c.text}"`).join(' | ')}`)

  // ── 2. Feature activations ─────────────────────────────────────────────────
  const rawFeatures = activateChunkFeatures(chunks)
  debug.push(`Raw features (${rawFeatures.length}): ${rawFeatures.map((f) => `${f.id}(${f.rawStrength.toFixed(2)})`).join(', ')}`)

  // ── 3. Inhibitory signals ──────────────────────────────────────────────────
  const inhibitedFeatures = applyFeatureInhibition(rawFeatures)
  inhibitedFeatures.forEach((f) => {
    if (f.strength < f.rawStrength) {
      debug.push(`Inhibited: ${f.id} ${f.rawStrength.toFixed(2)} → ${f.strength.toFixed(2)}`)
    }
  })

  // ── 4. Dynamic threshold ───────────────────────────────────────────────────
  const threshold = computeDynamicThreshold(recentActivityScore)
  debug.push(`Dynamic threshold: ${threshold.current.toFixed(3)} (recentActivity: ${threshold.recentActivityScore.toFixed(2)})`)

  const activeFeatures = inhibitedFeatures.filter((f) => f.strength >= threshold.current)
  debug.push(`Active features after threshold (${activeFeatures.length}): ${activeFeatures.map((f) => f.id).join(', ')}`)

  const chunkedStage: ChunkedPipelineStage = {
    chunks,
    rawFeatures,
    inhibitedFeatures,
    threshold,
    activeFeatures,
    debugNotes: [...debug],
  }

  // ── 5. Node activations from features ─────────────────────────────────────
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

  // ── 6. Suppressed nodes (mirror existing pipeline behaviour) ──────────────
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

  // ── 7. Existing binding / pattern / field pipeline ────────────────────────
  const bound = bindNodes(activatedNodes, plasticity)
  const lifted = liftPatterns(activatedNodes, bound.bindings, plasticity)
  const analyzed = analyzeNodeField(activatedNodes, bound.bindings)

  const elapsedMs = now() - startedAt

  return {
    inputText: text,
    activatedNodes: activatedNodes.sort((a, b) => b.value - a.value),
    suppressedNodes: suppressedNodes.sort((a, b) => a.value - b.value),
    bindings: bound.bindings.sort((a, b) => b.weight - a.weight),
    liftedPatterns: lifted.liftedPatterns.sort((a, b) => b.score - a.score),
    stateVector: analyzed.stateVector,
    debugNotes: [
      'ISR v2.1 Pipeline started',
      ...debug,
      ...bound.debugNotes,
      ...lifted.debugNotes,
      ...analyzed.debugNotes,
      `ISR v2.1 Pipeline completed in ${elapsedMs.toFixed(2)} ms`,
    ],
    meta: {
      retrievalCount: activatedNodes.length,
      bindingCount: bound.bindings.length,
      patternCount: lifted.liftedPatterns.length,
      elapsedMs,
    },
    chunkedStage,
  }
}
