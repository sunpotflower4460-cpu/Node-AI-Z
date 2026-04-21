/**
 * Build Facade View - Phase M16
 * Converts CoreView to FacadeView based on facade capability policy
 */

import type { CoreView, AppFacadeMode } from '../coreTypes'
import type { FacadeView, FacadeCapabilityPolicy } from './facadeRuntimeTypes'
import { validateFacadeScope, canAccessPromotions } from './facadeCapabilityPolicy'

/**
 * Build a facade view from a core view based on capability policy
 */
export const buildFacadeView = (
  coreView: CoreView,
  policy: FacadeCapabilityPolicy,
  mode: AppFacadeMode
): FacadeView => {
  // Filter schemas based on readable scopes
  const visibleSchemas = coreView.activeSchemas.filter((schema) => {
    return validateFacadeScope(policy, 'read', schema.origin)
  })

  // Filter mixed nodes based on readable scopes
  const visibleMixedNodes = coreView.activeMixedNodes.filter((node) => {
    return validateFacadeScope(policy, 'read', node.origin)
  })

  // Filter or summarize biases
  const visibleBiases = filterBiases(coreView.mergedBiases, policy)

  // Filter or summarize proto-weights
  const visibleProtoWeights = filterProtoWeights(coreView.mergedProtoWeights, policy)

  // Build session snapshot
  const sessionSnapshot = buildSessionSnapshot(coreView, policy)

  // Include promotion candidates if allowed
  const promotionCandidates = canAccessPromotions(policy, 'read')
    ? coreView.promotionCandidates.map((candidate) => ({
        id: candidate.id,
        type: candidate.type,
        score: candidate.score,
        reasons: candidate.reasons,
      }))
    : undefined

  // Include influence notes if allowed
  const influenceNotes = canAccessPromotions(policy, 'read')
    ? coreView.influenceNotes.map((note) => ({
        origin: note.origin,
        target: note.target,
        delta: note.delta,
        reason: note.reason,
      }))
    : undefined

  return {
    visibleSchemas,
    visibleMixedNodes,
    visibleBiases,
    visibleProtoWeights,
    sessionSnapshot,
    promotionCandidates,
    influenceNotes,
    viewMetadata: {
      mode,
      readableScopes: policy.readableScopes,
      timestamp: Date.now(),
      notes: [`Facade view for ${mode}`, `Scopes: ${policy.readableScopes.join(', ')}`],
    },
  }
}

/**
 * Filter biases based on policy
 * For now, returns all biases if branch is readable
 * Future: may implement more granular filtering
 */
const filterBiases = (
  biases: Record<string, number>,
  policy: FacadeCapabilityPolicy
): Record<string, number> => {
  // If can read personal_branch, show all biases
  if (validateFacadeScope(policy, 'read', 'personal_branch')) {
    return { ...biases }
  }

  // If can only read trunk, show trunk-like biases (future: more sophisticated)
  if (validateFacadeScope(policy, 'read', 'shared_trunk')) {
    return { ...biases }
  }

  // Otherwise, return empty
  return {}
}

/**
 * Filter proto-weights based on policy
 */
const filterProtoWeights = (
  protoWeights: Record<string, number>,
  policy: FacadeCapabilityPolicy
): Record<string, number> => {
  // If can read personal_branch, show all proto-weights
  if (validateFacadeScope(policy, 'read', 'personal_branch')) {
    return { ...protoWeights }
  }

  // If can only read trunk, show trunk-like weights
  if (validateFacadeScope(policy, 'read', 'shared_trunk')) {
    return { ...protoWeights }
  }

  // Otherwise, return empty
  return {}
}

/**
 * Build session snapshot from core view
 */
const buildSessionSnapshot = (
  coreView: CoreView,
  policy: FacadeCapabilityPolicy
): FacadeView['sessionSnapshot'] => {
  const hasActiveSession = coreView.sessionBrainState !== null

  // If can read branch, include session metadata
  if (validateFacadeScope(policy, 'read', 'personal_branch') && hasActiveSession) {
    return {
      hasActiveSession: true,
      sessionMetadata: {
        // Include safe metadata (not the full brain state)
        hasState: true,
        timestamp: Date.now(),
      },
    }
  }

  return {
    hasActiveSession,
  }
}

/**
 * Create an empty facade view for error cases
 */
export const createEmptyFacadeView = (
  mode: AppFacadeMode,
  errorNote: string
): FacadeView => {
  return {
    visibleSchemas: [],
    visibleMixedNodes: [],
    visibleBiases: {},
    visibleProtoWeights: {},
    sessionSnapshot: {
      hasActiveSession: false,
    },
    viewMetadata: {
      mode,
      readableScopes: [],
      timestamp: Date.now(),
      notes: [errorNote],
    },
  }
}

/**
 * Summarize facade view for logging/debugging
 */
export const summarizeFacadeView = (view: FacadeView): string => {
  const parts = [
    `Mode: ${view.viewMetadata.mode}`,
    `Schemas: ${view.visibleSchemas.length}`,
    `Nodes: ${view.visibleMixedNodes.length}`,
    `Biases: ${Object.keys(view.visibleBiases).length}`,
    `ProtoWeights: ${Object.keys(view.visibleProtoWeights).length}`,
    `Session: ${view.sessionSnapshot.hasActiveSession ? 'active' : 'inactive'}`,
  ]

  if (view.promotionCandidates) {
    parts.push(`Candidates: ${view.promotionCandidates.length}`)
  }

  if (view.influenceNotes) {
    parts.push(`Influences: ${view.influenceNotes.length}`)
  }

  return parts.join(', ')
}
