import type { ChunkFeature } from '../ingest/chunkTypes'
import type { RecurrentLoopResult } from './temporalTypes'
import { applyLateralInhibition } from './applyLateralInhibition'

/**
 * Feature ids considered "self / belief / field" oriented.
 * These are the features targeted by the recurrent self loop.
 * Extend this set as new features are added to activateChunkFeatures.
 *
 * Exported so that callers (e.g. runChunkedNodePipeline) can reference the
 * same set without duplicating it.
 */
export const SELF_BELIEF_FEATURE_IDS = new Set([
  'self_critique',
  'uncertainty_expression',
  'hope_signal',
  'distress_signal',
  'longing_for_recognition',
  'purpose_confusion',
  // future feature ids can be added here
  'care_pull',
  'answer_pull',
  'hesitation',
  'guard_response',
  'curiosity',
  'protect_aliveness',
  'not_push_too_early',
  'truth_without_force',
])

/**
 * Rate at which co-activated self/belief features mutually reinforce each other
 * within each loop iteration.
 */
const CO_ACTIVATION_RATE = 0.04

/** Maximum strength a feature can reach through the recurrent loop */
const MAX_LOOP_STRENGTH = 0.99

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v))

/**
 * Run a recurrent convergence loop over self / belief / field features.
 *
 * Algorithm per iteration:
 *   1. Each self/belief feature is slightly boosted by co-activated peers
 *      (mutual reinforcement at CO_ACTIVATION_RATE).
 *   2. Light lateral inhibition is applied within the loop.
 *   3. State delta (sum of absolute strength changes) is computed.
 *   4. If delta ≤ convergenceThreshold, the loop is considered converged.
 *
 * Non-self features are carried through unchanged; only self/belief features
 * participate in the loop dynamics.
 *
 * @param features        Full feature array (self + non-self)
 * @param personalBias    Optional per-feature bias adjustments (feature id → delta)
 * @param maxLoops        Upper bound on iterations (default 8)
 * @param convergenceThreshold  Sum-of-abs-delta below which loop stops (default 0.01)
 */
export const runRecurrentSelfLoop = (
  features: ChunkFeature[],
  personalBias?: Record<string, number>,
  maxLoops = 8,
  convergenceThreshold = 0.01,
): RecurrentLoopResult<ChunkFeature[]> => {
  const states: ChunkFeature[][] = [[...features]]
  const debugNotes: string[] = []

  let current = features.map((f): ChunkFeature => {
    const bias = personalBias?.[f.id] ?? 0
    return bias !== 0 ? { ...f, strength: clamp(f.strength + bias, 0, MAX_LOOP_STRENGTH) } : f
  })

  let iterations = 0
  let converged = false

  for (let loop = 0; loop < maxLoops; loop++) {
    iterations = loop + 1

    const selfFeatures = current.filter((f) => SELF_BELIEF_FEATURE_IDS.has(f.id))
    const nonSelfFeatures = current.filter((f) => !SELF_BELIEF_FEATURE_IDS.has(f.id))

    if (selfFeatures.length === 0) {
      debugNotes.push(`Loop ${iterations}: no self/belief features — early exit`)
      converged = true
      break
    }

    // Step 1: mutual reinforcement among self/belief features
    const reinforced = selfFeatures.map((f): ChunkFeature => {
      const coActivatedSum = selfFeatures
        .filter((s) => s.id !== f.id)
        .reduce((sum, s) => sum + s.strength, 0)
      const boost = coActivatedSum * CO_ACTIVATION_RATE
      return { ...f, strength: clamp(f.strength + boost, 0, MAX_LOOP_STRENGTH) }
    })

    // Step 2: light lateral inhibition within self/belief group
    const { features: inhibited } = applyLateralInhibition(reinforced)

    // Reassemble full feature list
    const next: ChunkFeature[] = [
      ...nonSelfFeatures,
      ...inhibited,
    ]

    // Step 3: compute state delta
    const delta = current.reduce((sum, prev) => {
      const nextF = next.find((n) => n.id === prev.id)
      return sum + Math.abs((nextF?.strength ?? prev.strength) - prev.strength)
    }, 0)

    debugNotes.push(
      `Loop ${iterations}: delta=${delta.toFixed(5)} self=[${inhibited.map((f) => `${f.id}(${f.strength.toFixed(3)})`).join(', ')}]`,
    )

    states.push([...next])
    current = next

    // Step 4: convergence check
    if (delta <= convergenceThreshold) {
      converged = true
      debugNotes.push(`Loop ${iterations}: converged (delta ${delta.toFixed(5)} ≤ ${convergenceThreshold})`)
      break
    }
  }

  if (!converged) {
    debugNotes.push(`Recurrent self loop: max loops (${maxLoops}) reached without convergence`)
  }

  return {
    iterations,
    converged,
    states,
    debugNotes,
  }
}
