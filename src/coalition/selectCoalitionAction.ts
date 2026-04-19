/**
 * Select Coalition Action
 *
 * Phase 3: Selects the preferred action from coalition state.
 * This bridges coalitions -> internal action policy.
 */

import type { CoalitionState } from './mergeCoalitionState'

export type CoalitionActionSelection = {
  preferredAction: 'answer' | 'hold' | 'ask' | 'bridge' | 'explore'
  confidence: number
  reasons: string[]
}

/**
 * Select the preferred action from coalition state.
 *
 * Key principle: Read from coalition dynamics, NOT override with heuristics.
 * - Single stable coalition -> high confidence in its action bias
 * - Multiple conflicting coalitions -> bridge or hold
 * - High unresolved tension -> ask or explore
 */
export const selectCoalitionAction = (
  coalitionState: CoalitionState,
): CoalitionActionSelection => {
  const reasons: string[] = []

  if (coalitionState.activeCoalitions.length === 0) {
    return {
      preferredAction: 'hold',
      confidence: 0.3,
      reasons: ['No active coalitions formed'],
    }
  }

  const dominant = coalitionState.activeCoalitions.find(
    (c) => c.id === coalitionState.dominantCoalitionId,
  )

  // Case 1: Single coalition with high stability
  if (coalitionState.activeCoalitions.length === 1 && dominant && dominant.stability > 0.7) {
    reasons.push(`Single stable coalition (stability=${dominant.stability.toFixed(2)})`)
    return {
      preferredAction: dominant.actionBias,
      confidence: dominant.pull * dominant.stability,
      reasons,
    }
  }

  // Case 2: Dominant coalition with low tension
  if (dominant && coalitionState.unresolvedTension < 0.4) {
    reasons.push(`Dominant coalition with low tension (tension=${coalitionState.unresolvedTension.toFixed(2)})`)
    return {
      preferredAction: dominant.actionBias,
      confidence: dominant.pull * (1.0 - coalitionState.unresolvedTension),
      reasons,
    }
  }

  // Case 3: High unresolved tension -> bridge or explore
  if (coalitionState.unresolvedTension > 0.6) {
    const hasExplore = coalitionState.activeCoalitions.some((c) => c.actionBias === 'explore')
    reasons.push(`High unresolved tension (${coalitionState.unresolvedTension.toFixed(2)})`)

    if (hasExplore) {
      return {
        preferredAction: 'explore',
        confidence: 0.5,
        reasons: [...reasons, 'Explore bias present in coalitions'],
      }
    } else {
      return {
        preferredAction: 'bridge',
        confidence: 0.6,
        reasons: [...reasons, 'Bridge needed to resolve tension'],
      }
    }
  }

  // Case 4: Multiple coalitions with moderate tension
  if (coalitionState.activeCoalitions.length > 1) {
    const actionCounts = new Map<string, number>()
    for (const coalition of coalitionState.activeCoalitions) {
      const count = actionCounts.get(coalition.actionBias) ?? 0
      actionCounts.set(coalition.actionBias, count + coalition.pull)
    }

    // Find most common action bias (weighted by pull)
    let maxAction: CoalitionActionSelection['preferredAction'] = 'hold'
    let maxWeight = 0
    for (const [action, weight] of actionCounts.entries()) {
      if (weight > maxWeight) {
        maxWeight = weight
        maxAction = action as CoalitionActionSelection['preferredAction']
      }
    }

    reasons.push(`Multiple coalitions, weighted action: ${maxAction}`)
    return {
      preferredAction: maxAction,
      confidence: 0.5 + (maxWeight / coalitionState.activeCoalitions.length) * 0.3,
      reasons,
    }
  }

  // Fallback: use dominant coalition action with reduced confidence
  if (dominant) {
    reasons.push('Fallback to dominant coalition')
    return {
      preferredAction: dominant.actionBias,
      confidence: 0.4,
      reasons,
    }
  }

  // Ultimate fallback
  return {
    preferredAction: 'hold',
    confidence: 0.3,
    reasons: ['Fallback: hold due to unclear coalition state'],
  }
}
