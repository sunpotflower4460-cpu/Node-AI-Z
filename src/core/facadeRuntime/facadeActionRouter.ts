/**
 * Facade Action Router - Phase M16
 * Routes facade actions to appropriate handlers
 */

import type {
  FacadeAction,
  FacadeActionResult,
  FacadeRuntimeContext,
} from './facadeRuntimeTypes'

/**
 * Route a facade action to appropriate handler
 */
export const routeFacadeAction = (
  action: FacadeAction,
  context: FacadeRuntimeContext
): FacadeActionResult => {
  try {
    switch (action.type) {
      case 'read_view':
        return handleReadViewAction(action, context)

      case 'write_branch':
        return handleWriteBranchAction(action, context)

      case 'propose_promotion':
        return handleProposePromotionAction(action, context)

      default:
        return {
          success: false,
          error: 'Unknown action type',
          errorCode: 'INVALID_ACTION',
        }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'INTERNAL_ERROR',
    }
  }
}

/**
 * Handle read_view action
 */
const handleReadViewAction = (
  action: Extract<FacadeAction, { type: 'read_view' }>,
  context: FacadeRuntimeContext
): FacadeActionResult => {
  // Validate read permissions
  if (context.policy.readableScopes.length === 0) {
    return {
      success: false,
      error: 'No read permissions',
      errorCode: 'PERMISSION_DENIED',
    }
  }

  // Action is valid
  return {
    success: true,
    data: {
      action: 'read_view',
      allowedScopes: context.policy.readableScopes,
      timestamp: context.timestamp,
    },
  }
}

/**
 * Handle write_branch action
 */
const handleWriteBranchAction = (
  action: Extract<FacadeAction, { type: 'write_branch' }>,
  context: FacadeRuntimeContext
): FacadeActionResult => {
  // Validate write permissions
  if (!context.policy.writableScopes.includes('personal_branch')) {
    return {
      success: false,
      error: 'No write permission for personal branch',
      errorCode: 'PERMISSION_DENIED',
    }
  }

  // Validate updates payload
  if (!action.updates || typeof action.updates !== 'object') {
    return {
      success: false,
      error: 'Invalid updates payload',
      errorCode: 'INVALID_PAYLOAD',
    }
  }

  // In a real implementation, this would actually update the branch
  // For now, we just validate and return success
  const updateKeys = Object.keys(action.updates)

  return {
    success: true,
    data: {
      action: 'write_branch',
      updatedKeys: updateKeys,
      timestamp: context.timestamp,
      note: 'Branch update queued (minimal implementation)',
    },
  }
}

/**
 * Handle propose_promotion action
 */
const handleProposePromotionAction = (
  action: Extract<FacadeAction, { type: 'propose_promotion' }>,
  context: FacadeRuntimeContext
): FacadeActionResult => {
  // Validate promotion permissions
  if (!context.policy.allowPromotionWrite) {
    return {
      success: false,
      error: 'No permission to propose promotions',
      errorCode: 'PERMISSION_DENIED',
    }
  }

  // Validate candidate data
  if (!action.candidateData) {
    return {
      success: false,
      error: 'Missing candidate data',
      errorCode: 'INVALID_PAYLOAD',
    }
  }

  // Validate reasons
  if (!action.reasons || action.reasons.length === 0) {
    return {
      success: false,
      error: 'Promotion proposals must include reasons',
      errorCode: 'INVALID_PAYLOAD',
    }
  }

  // In a real implementation, this would queue the promotion
  // For now, we just validate and return success
  return {
    success: true,
    data: {
      action: 'propose_promotion',
      reasonCount: action.reasons.length,
      timestamp: context.timestamp,
      note: 'Promotion proposal queued (minimal implementation)',
    },
  }
}

/**
 * Validate action structure
 */
export const validateFacadeAction = (action: unknown): action is FacadeAction => {
  if (!action || typeof action !== 'object') {
    return false
  }

  const act = action as Record<string, unknown>

  // Check required fields
  if (!act.type || !act.mode || !act.userId || !act.sessionId) {
    return false
  }

  // Check valid type
  const validTypes = ['read_view', 'write_branch', 'propose_promotion']
  return validTypes.includes(act.type as string)
}

/**
 * Get action metadata for logging
 */
export const getActionMetadata = (
  action: FacadeAction,
  context: FacadeRuntimeContext
): Record<string, unknown> => {
  return {
    type: action.type,
    mode: action.mode,
    userId: action.userId,
    sessionId: action.sessionId,
    timestamp: context.timestamp,
    facadeId: `facade-${action.mode}-${action.sessionId}`,
  }
}

/**
 * Create action summary for Observe
 */
export const summarizeAction = (action: FacadeAction): string => {
  switch (action.type) {
    case 'read_view':
      return `Read view request from ${action.mode}`

    case 'write_branch':
      return `Write branch request from ${action.mode} (${
        Object.keys(action.updates).length
      } updates)`

    case 'propose_promotion':
      return `Promotion proposal from ${action.mode} (${action.reasons.length} reasons)`

    default:
      return `Unknown action from ${action.mode}`
  }
}
