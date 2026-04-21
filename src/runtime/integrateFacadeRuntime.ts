/**
 * Facade Runtime Integration - Phase M16
 * Helpers to integrate facade runtime with crystallized_thinking and observer
 */

import type { SessionBrainState } from '../brain/sessionBrainState'
import type { CoreView, SharedTrunkState, PersonalBranchState } from '../core/coreTypes'
import type { FacadeRequest, FacadeResponse, FacadeView } from '../core/facadeRuntime'
import { runFacadeRuntime } from '../core/facadeRuntime'

/**
 * Get facade view for crystallized_thinking mode
 * This function wraps the facade runtime and returns a filtered view
 */
export const getCrystallizedThinkingFacadeView = (
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  sessionId: string,
  userId: string
): { success: boolean; view?: FacadeView; error?: string } => {
  const request: FacadeRequest = {
    type: 'get_view',
    mode: 'crystallized_thinking',
    sessionId,
    userId,
  }

  const response = runFacadeRuntime(request, coreView, trunk, branch)

  if (response.success && response.type === 'view') {
    return {
      success: true,
      view: response.view,
    }
  }

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    }
  }

  return {
    success: false,
    error: 'Unexpected response type',
  }
}

/**
 * Get facade view for observer mode
 * Observer has read-only access through facade runtime
 */
export const getObserverFacadeView = (
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  sessionId: string,
  userId: string
): { success: boolean; view?: FacadeView; error?: string } => {
  const request: FacadeRequest = {
    type: 'get_view',
    mode: 'observer',
    sessionId,
    userId,
  }

  const response = runFacadeRuntime(request, coreView, trunk, branch)

  if (response.success && response.type === 'view') {
    return {
      success: true,
      view: response.view,
    }
  }

  if (!response.success) {
    return {
      success: false,
      error: response.error,
    }
  }

  return {
    success: false,
    error: 'Unexpected response type',
  }
}

/**
 * Submit branch update through facade runtime
 * Only allowed for modes with write permissions
 */
export const submitBranchUpdateThroughFacade = (
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  sessionId: string,
  userId: string,
  updates: Record<string, unknown>
): FacadeResponse => {
  const request: FacadeRequest = {
    type: 'submit_branch_update',
    mode: 'crystallized_thinking',
    sessionId,
    userId,
    payload: updates,
  }

  return runFacadeRuntime(request, coreView, trunk, branch)
}

/**
 * Query facade runtime state for Observe mode
 */
export const queryFacadeRuntimeState = (
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  sessionId: string,
  userId: string
): FacadeResponse => {
  const request: FacadeRequest = {
    type: 'observe_facade_state',
    mode: 'observer',
    sessionId,
    userId,
  }

  return runFacadeRuntime(request, coreView, trunk, branch)
}

/**
 * Attach facade view metadata to brain state for visibility
 * Returns metadata separately to avoid modifying brain state type
 */
export const attachFacadeViewToBrainState = (
  brainState: SessionBrainState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _facadeView: FacadeView | undefined
): SessionBrainState => {
  // Phase M16: For now, we don't modify brain state directly
  // Instead, facade view is tracked separately in the runtime result
  // Future: Add facadeViewMetadata to SessionBrainState type definition
  return brainState
}

/**
 * Extract facade view metadata for tracking
 */
export const extractFacadeViewMetadata = (
  facadeView: FacadeView | undefined
): Record<string, unknown> | undefined => {
  if (!facadeView) {
    return undefined
  }

  return {
    mode: facadeView.viewMetadata.mode,
    readableScopes: facadeView.viewMetadata.readableScopes,
    timestamp: facadeView.viewMetadata.timestamp,
    visibleSchemaCount: facadeView.visibleSchemas.length,
    visibleMixedNodeCount: facadeView.visibleMixedNodes.length,
    hasPromotionAccess: !!facadeView.promotionCandidates,
  }
}
