import type { SignalBoundarySource } from './signalLoopTypes'
import type { ActivationEvent } from '../signalField/signalFieldTypes'

/**
 * Classify the source of a signal or activation event.
 *
 * Determines whether an activation came from:
 * - External stimulus (direct sensory input from user)
 * - Internal replay (self-generated pattern from replay cycle)
 * - Teacher signal (binding teacher guidance)
 * - Future: Mother hint, AETERNA baseline
 *
 * This helps the boundary loop track signal origin and build awareness
 * of what is "inside" vs "outside".
 */
export function classifySignalSource(event: ActivationEvent): SignalBoundarySource {
  // Use the event's source field to determine origin
  switch (event.source) {
    case 'stimulus':
      return 'external'
    case 'replay':
      return 'internal'
    case 'propagation':
      // Propagation could be internal (self-sustaining) or external (stimulus-driven)
      // For now, treat as internal (part of the system's own dynamics)
      return 'internal'
    default:
      return 'external'
  }
}

/**
 * Classify whether a bridge was created by teacher or self-discovered.
 */
export function classifyBridgeSource(
  createdBy: 'binding_teacher' | 'self_discovered',
): SignalBoundarySource {
  return createdBy === 'binding_teacher' ? 'teacher' : 'internal'
}
