/**
 * Integrate Facade Runtime to Studio (Observer) - Phase M16
 * Provides facade runtime view for Observe mode
 */

import type { CoreView, SharedTrunkState, PersonalBranchState } from '../core/coreTypes'
import type { FacadeView } from '../core/facadeRuntime'
import { getObserverFacadeView } from '../runtime/integrateFacadeRuntime'

/**
 * Get observer facade view for studio/observe mode
 * This wraps the facade runtime and returns a filtered read-only view
 */
export const getStudioFacadeView = (
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  sessionId: string,
  userId: string
): {
  success: boolean
  view?: FacadeView
  error?: string
  notes: string[]
} => {
  const notes: string[] = []

  notes.push('Observer accessing Mother Core through facade runtime')
  notes.push(`Session: ${sessionId}, User: ${userId}`)

  const result = getObserverFacadeView(coreView, trunk, branch, sessionId, userId)

  if (result.success && result.view) {
    notes.push(`Facade view retrieved: ${result.view.visibleSchemas.length} schemas visible`)
    notes.push(`Read-only access to ${result.view.viewMetadata.readableScopes.join(', ')}`)
  } else if (!result.success) {
    notes.push(`Facade runtime error: ${result.error}`)
  }

  return {
    ...result,
    notes,
  }
}

/**
 * Summarize facade view for debug/observe display
 */
export const summarizeFacadeViewForStudio = (facadeView: FacadeView): string[] => {
  const summary: string[] = []

  summary.push(`Mode: ${facadeView.viewMetadata.mode}`)
  summary.push(`Readable scopes: ${facadeView.viewMetadata.readableScopes.join(', ')}`)
  summary.push(`Visible schemas: ${facadeView.visibleSchemas.length}`)
  summary.push(`Visible mixed nodes: ${facadeView.visibleMixedNodes.length}`)

  if (facadeView.promotionCandidates) {
    summary.push(`Promotion candidates: ${facadeView.promotionCandidates.length}`)
  } else {
    summary.push('Promotion access: not allowed')
  }

  if (facadeView.influenceNotes && facadeView.influenceNotes.length > 0) {
    summary.push(`Influence notes: ${facadeView.influenceNotes.length}`)
  }

  return summary
}

/**
 * Check if facade runtime is connected for this observation
 */
export const isFacadeRuntimeConnected = (facadeView?: FacadeView): boolean => {
  return !!facadeView && facadeView.viewMetadata.timestamp > 0
}
