/**
 * Build Coalition Fields
 *
 * Phase 3: Forms distributed coalitions across multiple field types.
 * NOT winner-take-all. Multiple active coalitions can coexist, creating tension and enabling
 * bridge/explore/hold outcomes structurally.
 */

import type { CoreNode } from '../types/nodeStudio'
import type { ProtoMeaning } from '../meaning/types'
import type { OptionNode, OptionField } from '../option/types'
import type { InteroceptiveState } from '../interoception/interoceptiveState'

export type CoalitionField = {
  /**
   * Field type identifier
   */
  fieldType: 'signal' | 'protoMeaning' | 'option' | 'interoception' | 'memory' | 'relation'

  /**
   * Member identifiers (node IDs, meaning IDs, option IDs, etc.)
   */
  memberIds: string[]

  /**
   * Pull strength of this field (0.0 - 1.0)
   */
  pull: number

  /**
   * Stability of this field (0.0 - 1.0)
   * High stability = coherent, low stability = fragmented
   */
  stability: number

  /**
   * Tension with other fields (0.0 - 1.0)
   * High tension = conflicting with other active fields
   */
  tension: number

  /**
   * Action bias suggested by this field
   */
  actionBias: 'answer' | 'hold' | 'ask' | 'bridge' | 'explore'
}

export type BuildCoalitionFieldsInput = {
  nodes: CoreNode[]
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  optionFields: OptionField[]
  interoceptiveState: InteroceptiveState
}

/**
 * Build coalition fields from multiple sources.
 *
 * This creates separate fields for signal, proto-meaning, option, interoception, etc.
 * Later, these fields compete and form coalitions (not just one winner).
 */
export const buildCoalitionFields = ({
  nodes,
  sensoryProtoMeanings,
  narrativeProtoMeanings,
  optionFields,
  interoceptiveState,
}: BuildCoalitionFieldsInput): CoalitionField[] => {
  const coalitionFields: CoalitionField[] = []

  // ── Signal Field ──
  // Top activated nodes form a signal coalition
  const topNodes = nodes.slice(0, 5)
  if (topNodes.length > 0) {
    const signalPull = topNodes.reduce((sum, n) => sum + n.value, 0) / topNodes.length
    const signalStability = topNodes.length >= 3 ? 0.7 : 0.4
    const signalTension = 0.1 // low baseline tension

    // Action bias from signal: if nodes suggest confusion/ambiguity -> explore/ask
    const hasAmbiguity = topNodes.some((n) => n.id.includes('ambiguity') || n.id.includes('confusion'))
    const hasClarity = topNodes.some((n) => n.id.includes('clarity') || n.id.includes('certainty'))
    const signalActionBias: CoalitionField['actionBias'] = hasAmbiguity ? 'ask' : hasClarity ? 'answer' : 'explore'

    coalitionFields.push({
      fieldType: 'signal',
      memberIds: topNodes.map((n) => n.id),
      pull: signalPull,
      stability: signalStability,
      tension: signalTension,
      actionBias: signalActionBias,
    })
  }

  // ── Proto-Meaning Field ──
  // Strong narrative meanings form a meaning coalition
  const strongNarratives = narrativeProtoMeanings.filter((m) => m.strength > 0.4)
  const strongSensory = sensoryProtoMeanings.filter((m) => m.strength > 0.5)
  if (strongNarratives.length > 0 || strongSensory.length > 0) {
    const meaningPull = (
      strongNarratives.reduce((sum, m) => sum + m.strength, 0) +
      strongSensory.reduce((sum, m) => sum + m.strength, 0)
    ) / (strongNarratives.length + strongSensory.length)

    const meaningStability = strongNarratives.length >= 2 ? 0.8 : 0.5
    const meaningTension = 0.15

    // Action bias: strong narrative -> answer, weak/fragmented -> hold/bridge
    const meaningActionBias: CoalitionField['actionBias'] = strongNarratives.length >= 2 ? 'answer' : 'bridge'

    coalitionFields.push({
      fieldType: 'protoMeaning',
      memberIds: [
        ...strongNarratives.map((m) => `narrative:${m.glossJa}`),
        ...strongSensory.map((m) => `sensory:${m.glossJa}`),
      ],
      pull: meaningPull,
      stability: meaningStability,
      tension: meaningTension,
      actionBias: meaningActionBias,
    })
  }

  // ── Option Field ──
  // Option fields with high net pull form option coalitions
  const strongOptions = optionFields.filter((opt) => opt.netPull > 0.3)
  if (strongOptions.length > 0) {
    const optionPull = strongOptions.reduce((sum, opt) => sum + opt.netPull, 0) / strongOptions.length
    const optionStability = strongOptions.length === 1 ? 0.9 : 0.5 // single option is stable, multiple creates tension
    const optionTension = strongOptions.length > 1 ? 0.6 : 0.2

    // Action bias: single strong option -> answer, multiple -> bridge, ambiguous -> ask
    let optionActionBias: CoalitionField['actionBias'] = 'answer'
    if (strongOptions.length > 1) {
      const topTwo = strongOptions.slice(0, 2)
      const gap = Math.abs(topTwo[0].netPull - (topTwo[1]?.netPull ?? 0))
      optionActionBias = gap < 0.2 ? 'bridge' : 'answer'
    }

    coalitionFields.push({
      fieldType: 'option',
      memberIds: strongOptions.map((opt) => opt.optionId),
      pull: optionPull,
      stability: optionStability,
      tension: optionTension,
      actionBias: optionActionBias,
    })
  }

  // ── Interoceptive Field ──
  // Interoceptive state forms its own coalition field
  // High overload/low energy -> hold, high arousal/novelty -> explore, etc.
  const interoceptivePull = (
    interoceptiveState.energy +
    interoceptiveState.arousal +
    (1.0 - interoceptiveState.overload)
  ) / 3.0

  const interoceptiveStability = interoceptiveState.uncertaintyTolerance
  const interoceptiveTension = interoceptiveState.overload + (1.0 - interoceptiveState.socialSafety) * 0.5

  let interoceptiveActionBias: CoalitionField['actionBias'] = 'hold'
  if (interoceptiveState.noveltyHunger > 0.6) {
    interoceptiveActionBias = 'explore'
  } else if (interoceptiveState.overload > 0.6 || interoceptiveState.energy < 0.4) {
    interoceptiveActionBias = 'hold'
  } else if (interoceptiveState.uncertaintyTolerance > 0.6) {
    interoceptiveActionBias = 'bridge'
  } else {
    interoceptiveActionBias = 'ask'
  }

  coalitionFields.push({
    fieldType: 'interoception',
    memberIds: ['interoceptive_regulation'],
    pull: interoceptivePull,
    stability: interoceptiveStability,
    tension: interoceptiveTension,
    actionBias: interoceptiveActionBias,
  })

  // TODO: Memory and Relation fields could be added here in future iterations

  return coalitionFields
}
