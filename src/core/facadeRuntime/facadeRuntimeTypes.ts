/**
 * Facade Runtime Types - Phase M16
 * Types for the facade runtime layer that allows different apps to connect to Mother Core
 */

import type { AppFacadeMode, CoreView } from '../coreTypes'

export type SurfacePresentationMeta = {
  summary: string
  summaryStyle: 'plain' | 'observe' | 'thinking'
  explanationDepth: 'minimal' | 'medium' | 'deep'
  metadataDensity: 'minimal' | 'balanced' | 'rich'
  ordering: string[]
  highlightKeys: string[]
  notes?: string[]
  biasProfileMode?: AppFacadeMode
}

export type FacadeViewTranslation = {
  mode: AppFacadeMode
  highlightKeys: string[]
  orderingNotes: string[]
  summaryNotes: string[]
  biasProfile?: {
    mode: AppFacadeMode
    emphasis: {
      branch: number
      trunk: number
      promotion: number
      guardian: number
      persistence: number
    }
    explanationDepth: 'minimal' | 'medium' | 'deep'
    metadataDensity: 'minimal' | 'balanced' | 'rich'
    ordering: 'branch_first' | 'trunk_first' | 'review_first' | 'persistence_first'
    summaryStyle: 'plain' | 'observe' | 'thinking'
    highlightTopN: number
  }
}

/**
 * Facade Scope - identifies which layer a facade can access
 */
export type FacadeScope = 'shared_trunk' | 'personal_branch' | 'app_facade'

/**
 * Facade Capability Policy
 * Defines what a specific facade mode can read and write
 */
export type FacadeCapabilityPolicy = {
  /** The app mode this policy applies to */
  mode: AppFacadeMode

  /** Which layers this facade can read from */
  readableScopes: FacadeScope[]

  /** Which layers this facade can write to */
  writableScopes: FacadeScope[]

  /** Can read promotion queue and candidates */
  allowPromotionRead: boolean

  /** Can submit promotion proposals */
  allowPromotionWrite: boolean

  /** Can read trunk apply/revert history */
  allowTrunkApplyRead: boolean

  /** Can trigger trunk operations (very restricted) */
  allowTrunkApplyWrite: boolean
}

/**
 * Facade Request - requests from apps to the facade runtime
 */
export type FacadeRequest =
  | {
      type: 'get_view'
      mode: AppFacadeMode
      sessionId: string
      userId: string
    }
  | {
      type: 'submit_branch_update'
      mode: AppFacadeMode
      sessionId: string
      userId: string
      payload: Record<string, unknown>
    }
  | {
      type: 'propose_promotion'
      mode: AppFacadeMode
      sessionId: string
      userId: string
      candidateType: 'schema' | 'mixed_node' | 'bias' | 'proto_weight'
      candidateData: unknown
      reasons: string[]
    }
  | {
      type: 'query_promotion_status'
      mode: AppFacadeMode
      sessionId: string
      userId: string
      candidateId?: string
    }
  | {
      type: 'observe_facade_state'
      mode: AppFacadeMode
      sessionId: string
      userId: string
    }

/**
 * Facade Response - responses from the facade runtime to apps
 */
export type FacadeResponse =
  | {
      success: true
      type: 'view'
      view: FacadeView
      rawView?: FacadeView
      translation?: FacadeViewTranslation
      metadata: {
        timestamp: number
        facadeId: string
        mode: AppFacadeMode
      }
    }
  | {
      success: true
      type: 'branch_updated'
      updatedFields: string[]
      metadata: {
        timestamp: number
        facadeId: string
        notes?: string[]
      }
    }
  | {
      success: true
      type: 'promotion_proposed'
      candidateId: string
      queuePosition: number
      metadata: {
        timestamp: number
        facadeId: string
      }
    }
  | {
      success: true
      type: 'promotion_status'
      candidates: Array<{
        id: string
        status: string
        score: number
      }>
      metadata: {
        timestamp: number
        facadeId: string
      }
    }
  | {
      success: true
      type: 'facade_state'
      state: FacadeObservableState
      metadata: {
        timestamp: number
        facadeId: string
      }
    }
  | {
      success: false
      error: string
      errorCode:
        | 'PERMISSION_DENIED'
        | 'INVALID_REQUEST'
        | 'INTERNAL_ERROR'
        | 'NOT_FOUND'
      metadata: {
        timestamp: number
        facadeId?: string
      }
    }

/**
 * Facade View - filtered view of CoreView based on facade permissions
 * This is what apps see through the facade
 */
export type FacadeView = {
  /** Visible schemas (filtered by facade capability) */
  visibleSchemas: CoreView['activeSchemas']

  /** Visible mixed nodes (filtered by facade capability) */
  visibleMixedNodes: CoreView['activeMixedNodes']

  /** Visible biases (may be summarized or filtered) */
  visibleBiases: Record<string, number>

  /** Visible proto-weights (may be summarized or filtered) */
  visibleProtoWeights: Record<string, number>

  /** Session state snapshot (filtered) */
  sessionSnapshot: {
    hasActiveSession: boolean
    sessionMetadata?: Record<string, unknown>
  }

  /** Visible promotion candidates (if allowed) */
  promotionCandidates?: Array<{
    id: string
    type: string
    score: number
    reasons: string[]
  }>

  /** Influence notes (if allowed) */
  influenceNotes?: Array<{
    origin: string
    target: string
    delta: number
    reason: string
  }>

  /** Metadata about this view */
  viewMetadata: {
    mode: AppFacadeMode
    readableScopes: FacadeScope[]
    timestamp: number
    notes: string[]
  }

  /** Presentation metadata applied on top of raw facade view */
  surfacePresentation?: SurfacePresentationMeta
}

/**
 * Facade Observable State - for Observe mode to see facade runtime info
 */
export type FacadeObservableState = {
  /** Active facades */
  activeFacades: Array<{
    facadeId: string
    mode: AppFacadeMode
    activeSessionCount: number
    lastAccessedAt: number
  }>

  /** Facade capability policies */
  policies: FacadeCapabilityPolicy[]

  /** Facade request log (recent) */
  recentRequests: Array<{
    type: string
    mode: AppFacadeMode
    timestamp: number
    success: boolean
  }>

  /** Notes about facade runtime state */
  notes: string[]
}

/**
 * Facade Action - internal action type for routing within facade runtime
 */
export type FacadeAction =
  | {
      type: 'read_view'
      mode: AppFacadeMode
      userId: string
      sessionId: string
    }
  | {
      type: 'write_branch'
      mode: AppFacadeMode
      userId: string
      sessionId: string
      updates: Record<string, unknown>
    }
  | {
      type: 'propose_promotion'
      mode: AppFacadeMode
      userId: string
      sessionId: string
      candidateData: unknown
      reasons: string[]
    }

/**
 * Facade Action Result - result of routing an action
 */
export type FacadeActionResult =
  | {
      success: true
      data: unknown
    }
  | {
      success: false
      error: string
      errorCode: string
    }

/**
 * Facade Runtime Context - runtime state for facade operations
 */
export type FacadeRuntimeContext = {
  /** Active session ID */
  sessionId: string

  /** User ID */
  userId: string

  /** Facade mode */
  mode: AppFacadeMode

  /** Capability policy for this facade */
  policy: FacadeCapabilityPolicy

  /** Request timestamp */
  timestamp: number
}
