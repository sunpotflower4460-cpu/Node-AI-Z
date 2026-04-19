/**
 * Merge Coalition State
 *
 * Phase 3: Merges coalition fields into active coalitions.
 * NOT single winner. Multiple coalitions can remain active, creating distributed decision state.
 */

import type { CoalitionField } from './buildCoalitionFields'
import type { InteroceptiveControl } from '../interoception/applyInteroceptiveControl'

export type Coalition = {
  id: string
  memberFieldTypes: CoalitionField['fieldType'][]
  memberIds: string[]
  pull: number
  stability: number
  tension: number
  actionBias: 'answer' | 'hold' | 'ask' | 'bridge' | 'explore'
}

export type CoalitionState = {
  activeCoalitions: Coalition[]
  dominantCoalitionId?: string
  unresolvedTension: number
}

export type MergeCoalitionStateInput = {
  coalitionFields: CoalitionField[]
  interoceptiveControl: InteroceptiveControl
}

/**
 * Merge coalition fields into active coalitions.
 *
 * Key principle: NOT winner-take-all.
 * - If fields agree (low tension), they form a single coalition
 * - If fields disagree (high tension), multiple coalitions remain active
 * - Interoceptive control biases toward stability or diversity
 */
export const mergeCoalitionState = ({
  coalitionFields,
  interoceptiveControl,
}: MergeCoalitionStateInput): CoalitionState => {
  if (coalitionFields.length === 0) {
    return {
      activeCoalitions: [],
      unresolvedTension: 0,
    }
  }

  // Sort fields by pull strength
  const sortedFields = [...coalitionFields].sort((a, b) => b.pull - a.pull)

  const activeCoalitions: Coalition[] = []
  const usedFieldIndices = new Set<number>()

  // Stability bias: higher -> merge more aggressively, lower -> keep separate
  const stabilityThreshold = 0.4 + interoceptiveControl.coalitionStabilityBias

  for (let i = 0; i < sortedFields.length; i++) {
    if (usedFieldIndices.has(i)) continue

    const seedField = sortedFields[i]
    const coalitionMembers: CoalitionField[] = [seedField]
    usedFieldIndices.add(i)

    // Try to merge with compatible fields
    for (let j = i + 1; j < sortedFields.length; j++) {
      if (usedFieldIndices.has(j)) continue

      const candidateField = sortedFields[j]

      // Check compatibility: similar action bias and low tension
      const actionCompatible = seedField.actionBias === candidateField.actionBias ||
        (seedField.actionBias === 'bridge' && candidateField.actionBias !== 'hold') ||
        (candidateField.actionBias === 'bridge' && seedField.actionBias !== 'hold')

      const lowTension = (seedField.tension + candidateField.tension) / 2 < stabilityThreshold

      if (actionCompatible && lowTension) {
        coalitionMembers.push(candidateField)
        usedFieldIndices.add(j)
      }
    }

    // Create coalition from merged fields
    const coalitionPull = coalitionMembers.reduce((sum, f) => sum + f.pull, 0) / coalitionMembers.length
    const coalitionStability = coalitionMembers.reduce((sum, f) => sum + f.stability, 0) / coalitionMembers.length
    const coalitionTension = coalitionMembers.reduce((sum, f) => sum + f.tension, 0) / coalitionMembers.length

    // Action bias: use seed field's bias, or bridge if diverse
    const actionBias = coalitionMembers.length > 2 ? 'bridge' : seedField.actionBias

    activeCoalitions.push({
      id: `coalition_${activeCoalitions.length}`,
      memberFieldTypes: coalitionMembers.map((f) => f.fieldType),
      memberIds: coalitionMembers.flatMap((f) => f.memberIds),
      pull: coalitionPull,
      stability: coalitionStability,
      tension: coalitionTension,
      actionBias,
    })
  }

  // Determine dominant coalition (highest pull, but not necessarily the only active one)
  const dominantCoalition = activeCoalitions.length > 0
    ? activeCoalitions.reduce((best, c) => c.pull > best.pull ? c : best)
    : undefined

  // Compute unresolved tension: sum of tension in active coalitions
  const unresolvedTension = activeCoalitions.reduce((sum, c) => sum + c.tension, 0) / activeCoalitions.length

  return {
    activeCoalitions,
    dominantCoalitionId: dominantCoalition?.id,
    unresolvedTension,
  }
}
