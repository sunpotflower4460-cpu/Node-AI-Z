/**
 * Apply Workspace Phase Control
 *
 * Phase 3: Applies workspace phase to control what gets admitted, held, blocked, or released.
 * This is NOT cosmetic. Phase causally affects threshold, held items, and processing.
 */

import type { WorkspaceState, WorkspaceItem, WorkspacePhase } from './workspacePhaseMachine'
import type { ProtoMeaning } from '../meaning/types'

export type ApplyWorkspacePhaseControlInput = {
  currentState: WorkspaceState
  newPhase: WorkspacePhase
  narrativeProtoMeanings: ProtoMeaning[]
  sensoryProtoMeanings: ProtoMeaning[]
}

export type WorkspacePhaseControlResult = {
  updatedState: WorkspaceState
  admittedItemIds: string[]
  blockedItemIds: string[]
  releasedItemIds: string[]
  thresholdModifier: number // multiplier for feature threshold
  inhibitionModifier: number // multiplier for inhibition
}

/**
 * Apply workspace phase control to update held items and processing parameters.
 *
 * Key principle: Phase changes what happens to information.
 * - encode: admit new items, low filtering
 * - hold: protect current items, resist new items
 * - block: filter aggressively, prevent overload
 * - release: clear stale items, reset
 */
export const applyWorkspacePhaseControl = ({
  currentState,
  newPhase,
  narrativeProtoMeanings,
  sensoryProtoMeanings,
}: ApplyWorkspacePhaseControlInput): WorkspacePhaseControlResult => {
  const admittedItemIds: string[] = []
  const blockedItemIds: string[] = []
  const releasedItemIds: string[] = []

  let thresholdModifier = 1.0
  let inhibitionModifier = 1.0

  // Age existing items
  const agedItems = currentState.heldItems.map((item) => ({
    ...item,
    age: item.age + 1,
  }))

  let updatedHeldItems: WorkspaceItem[] = [...agedItems]

  // Phase-specific behavior
  switch (newPhase) {
    case 'encode': {
      // Admit new strong narrative meanings
      const strongNarratives = narrativeProtoMeanings.filter((m) => m.strength > 0.5)
      for (const narrative of strongNarratives) {
        const itemId = `narrative:${narrative.glossJa}`
        if (!updatedHeldItems.some((item) => item.id === itemId)) {
          updatedHeldItems.push({
            id: itemId,
            content: narrative.glossJa,
            strength: narrative.strength,
            age: 0,
          })
          admittedItemIds.push(itemId)
        }
      }

      // Lower threshold to admit more
      thresholdModifier = 0.85
      inhibitionModifier = 0.9

      break
    }

    case 'hold': {
      // Resist new items, strengthen held items
      const strongNarratives = narrativeProtoMeanings.filter((m) => m.strength > 0.7)
      for (const narrative of strongNarratives) {
        const itemId = `narrative:${narrative.glossJa}`
        const existing = updatedHeldItems.find((item) => item.id === itemId)
        if (existing) {
          // Strengthen existing item
          existing.strength = Math.min(1.0, existing.strength + 0.1)
        } else {
          // Only admit very strong new items
          blockedItemIds.push(itemId)
        }
      }

      // Higher threshold to protect focus
      thresholdModifier = 1.15
      inhibitionModifier = 1.2

      break
    }

    case 'block': {
      // Aggressively filter, only keep strongest items
      const strongestItems = updatedHeldItems
        .filter((item) => item.strength > 0.6 && item.age < 3)
        .slice(0, 3) // max 3 items in block phase

      const removedItems = updatedHeldItems.filter(
        (item) => !strongestItems.some((strong) => strong.id === item.id),
      )
      removedItems.forEach((item) => releasedItemIds.push(item.id))

      updatedHeldItems = strongestItems

      // Block new admissions
      const candidates = narrativeProtoMeanings.filter((m) => m.strength > 0.6)
      for (const candidate of candidates) {
        const itemId = `narrative:${candidate.glossJa}`
        if (!updatedHeldItems.some((item) => item.id === itemId)) {
          blockedItemIds.push(itemId)
        }
      }

      // Very high threshold and inhibition
      thresholdModifier = 1.4
      inhibitionModifier = 1.5

      break
    }

    case 'release': {
      // Clear stale items
      const freshItems = updatedHeldItems.filter((item) => item.age < 2)
      const staleItems = updatedHeldItems.filter((item) => item.age >= 2)

      staleItems.forEach((item) => releasedItemIds.push(item.id))
      updatedHeldItems = freshItems

      // Neutral threshold, preparing for next encode
      thresholdModifier = 1.0
      inhibitionModifier = 1.0

      break
    }
  }

  // Update distractor pressure based on phase
  let distractorPressure = currentState.distractorPressure
  if (newPhase === 'block') {
    distractorPressure = Math.max(0, distractorPressure - 0.3) // block reduces pressure
  } else if (newPhase === 'encode') {
    distractorPressure = Math.min(1.0, distractorPressure + 0.1) // encode increases pressure
  } else if (newPhase === 'release') {
    distractorPressure = 0.1 // release resets pressure
  }

  // Update stability based on phase and item count
  let stability = currentState.stability
  if (newPhase === 'hold' && updatedHeldItems.length <= 3) {
    stability = Math.min(1.0, stability + 0.1)
  } else if (newPhase === 'encode' && updatedHeldItems.length > 5) {
    stability = Math.max(0.0, stability - 0.1)
  } else if (newPhase === 'release') {
    stability = 0.5 // reset to neutral
  }

  // Update phase timer
  const phaseTimer = newPhase === currentState.phase ? currentState.phaseTimer + 1 : 0

  return {
    updatedState: {
      phase: newPhase,
      heldItems: updatedHeldItems,
      stability,
      distractorPressure,
      phaseTimer,
    },
    admittedItemIds,
    blockedItemIds,
    releasedItemIds,
    thresholdModifier,
    inhibitionModifier,
  }
}
