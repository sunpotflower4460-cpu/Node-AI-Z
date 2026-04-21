/**
 * Resolve Facade Request - Phase M16
 * Routes and resolves requests from apps through the facade runtime
 */

import type {
  FacadeRequest,
  FacadeResponse,
  FacadeRuntimeContext,
  FacadeObservableState,
} from './facadeRuntimeTypes'
import type { CoreView, SharedTrunkState, PersonalBranchState } from '../coreTypes'
import { getFacadeCapabilityPolicy } from './facadeCapabilityPolicy'
import { buildFacadeView } from './buildFacadeView'
import { routeFacadeAction } from './facadeActionRouter'

/**
 * Resolve a facade request
 * Main entry point for handling app requests through the facade runtime
 */
export const resolveFacadeRequest = (
  request: FacadeRequest,
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState
): FacadeResponse => {
  try {
    // Get capability policy for the requesting mode
    const policy = getFacadeCapabilityPolicy(request.mode)

    // Build runtime context
    const context: FacadeRuntimeContext = {
      sessionId: request.sessionId,
      userId: request.userId,
      mode: request.mode,
      policy,
      timestamp: Date.now(),
    }

    // Route to appropriate handler
    switch (request.type) {
      case 'get_view':
        return handleGetView(request, coreView, context)

      case 'submit_branch_update':
        return handleSubmitBranchUpdate(request, branch, context)

      case 'propose_promotion':
        return handleProposePromotion(request, context)

      case 'query_promotion_status':
        return handleQueryPromotionStatus(request, trunk, context)

      case 'observe_facade_state':
        return handleObserveFacadeState(request, context)

      default:
        return createErrorResponse(
          'INVALID_REQUEST',
          'Unknown request type',
          context.mode
        )
    }
  } catch (error) {
    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error',
      request.mode
    )
  }
}

/**
 * Handle get_view request
 */
const handleGetView = (
  request: Extract<FacadeRequest, { type: 'get_view' }>,
  coreView: CoreView,
  context: FacadeRuntimeContext
): FacadeResponse => {
  // Build facade view from core view
  const facadeView = buildFacadeView(coreView, context.policy, request.mode)

  return {
    success: true,
    type: 'view',
    view: facadeView,
    metadata: {
      timestamp: context.timestamp,
      facadeId: `facade-${request.mode}-${request.sessionId}`,
      mode: request.mode,
    },
  }
}

/**
 * Handle submit_branch_update request
 */
const handleSubmitBranchUpdate = (
  request: Extract<FacadeRequest, { type: 'submit_branch_update' }>,
  _branch: PersonalBranchState,
  context: FacadeRuntimeContext
): FacadeResponse => {
  // Check write permission
  if (!context.policy.writableScopes.includes('personal_branch')) {
    return createErrorResponse(
      'PERMISSION_DENIED',
      'This facade cannot write to personal branch',
      context.mode
    )
  }

  // Route the action
  const actionResult = routeFacadeAction(
    {
      type: 'write_branch',
      mode: request.mode,
      userId: request.userId,
      sessionId: request.sessionId,
      updates: request.payload,
    },
    context
  )

  if (!actionResult.success) {
    return createErrorResponse(
      'INTERNAL_ERROR',
      actionResult.error,
      context.mode
    )
  }

  // Extract updated fields from payload
  const updatedFields = Object.keys(request.payload)

  return {
    success: true,
    type: 'branch_updated',
    updatedFields,
    metadata: {
      timestamp: context.timestamp,
      facadeId: `facade-${request.mode}-${request.sessionId}`,
    },
  }
}

/**
 * Handle propose_promotion request
 */
const handleProposePromotion = (
  request: Extract<FacadeRequest, { type: 'propose_promotion' }>,
  context: FacadeRuntimeContext
): FacadeResponse => {
  // Check promotion write permission
  if (!context.policy.allowPromotionWrite) {
    return createErrorResponse(
      'PERMISSION_DENIED',
      'This facade cannot propose promotions',
      context.mode
    )
  }

  // Route the action
  const actionResult = routeFacadeAction(
    {
      type: 'propose_promotion',
      mode: request.mode,
      userId: request.userId,
      sessionId: request.sessionId,
      candidateData: request.candidateData,
      reasons: request.reasons,
    },
    context
  )

  if (!actionResult.success) {
    return createErrorResponse(
      'INTERNAL_ERROR',
      actionResult.error,
      context.mode
    )
  }

  // Generate a candidate ID (in real impl, this would come from promotion queue)
  const candidateId = `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  return {
    success: true,
    type: 'promotion_proposed',
    candidateId,
    queuePosition: 0, // Placeholder
    metadata: {
      timestamp: context.timestamp,
      facadeId: `facade-${request.mode}-${request.sessionId}`,
    },
  }
}

/**
 * Handle query_promotion_status request
 */
const handleQueryPromotionStatus = (
  request: Extract<FacadeRequest, { type: 'query_promotion_status' }>,
  trunk: SharedTrunkState,
  context: FacadeRuntimeContext
): FacadeResponse => {
  // Check promotion read permission
  if (!context.policy.allowPromotionRead) {
    return createErrorResponse(
      'PERMISSION_DENIED',
      'This facade cannot read promotion status',
      context.mode
    )
  }

  // Get promotion queue from trunk
  const promotionQueue = trunk.promotionQueue ?? []

  // Filter by candidate ID if provided
  const candidates = request.candidateId
    ? promotionQueue.filter((entry) => entry.candidate.id === request.candidateId)
    : promotionQueue

  return {
    success: true,
    type: 'promotion_status',
    candidates: candidates.map((entry) => ({
      id: entry.candidate.id,
      status: entry.status,
      score: entry.validation?.confidenceScore ?? 0,
    })),
    metadata: {
      timestamp: context.timestamp,
      facadeId: `facade-${request.mode}-${request.sessionId}`,
    },
  }
}

/**
 * Handle observe_facade_state request
 */
const handleObserveFacadeState = (
  request: Extract<FacadeRequest, { type: 'observe_facade_state' }>,
  context: FacadeRuntimeContext
): FacadeResponse => {
  // Build observable state
  const state: FacadeObservableState = {
    activeFacades: [
      {
        facadeId: `facade-${request.mode}-${request.sessionId}`,
        mode: request.mode,
        activeSessionCount: 1, // Placeholder
        lastAccessedAt: context.timestamp,
      },
    ],
    policies: [context.policy],
    recentRequests: [
      {
        type: request.type,
        mode: request.mode,
        timestamp: context.timestamp,
        success: true,
      },
    ],
    notes: [
      'Facade runtime is operational',
      `Current mode: ${request.mode}`,
      `Policy scopes: ${context.policy.readableScopes.join(', ')}`,
    ],
  }

  return {
    success: true,
    type: 'facade_state',
    state,
    metadata: {
      timestamp: context.timestamp,
      facadeId: `facade-${request.mode}-${request.sessionId}`,
    },
  }
}

/**
 * Create an error response
 */
const createErrorResponse = (
  errorCode: 'PERMISSION_DENIED' | 'INVALID_REQUEST' | 'INTERNAL_ERROR' | 'NOT_FOUND',
  error: string,
  mode: string
): Extract<FacadeResponse, { success: false }> => {
  return {
    success: false,
    error,
    errorCode,
    metadata: {
      timestamp: Date.now(),
      facadeId: `facade-${mode}-error`,
    },
  }
}

/**
 * Validate facade request structure
 */
export const validateFacadeRequest = (request: unknown): request is FacadeRequest => {
  if (!request || typeof request !== 'object') {
    return false
  }

  const req = request as Record<string, unknown>

  // Check required fields
  if (!req.type || !req.mode || !req.sessionId || !req.userId) {
    return false
  }

  // Check valid type
  const validTypes = [
    'get_view',
    'submit_branch_update',
    'propose_promotion',
    'query_promotion_status',
    'observe_facade_state',
  ]

  return validTypes.includes(req.type as string)
}
