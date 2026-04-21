/**
 * Core Types - Phase M9
 * Shared Trunk / Personal Branch / App Facade separation
 *
 * Separates the Mother Core into three distinct layers:
 * - Shared Trunk: Common patterns and knowledge across all users
 * - Personal Branch: Individual user's learned patterns and state
 * - App Facade: Application-specific views and access control
 */

import type { SchemaPattern } from '../memory/types'
import type { MixedLatentNode } from '../node/mixedNodeTypes'
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { PromotionQueueEntry } from './promotion/promotionTypes'
import type { PromotionLogEntry } from './promotion/promotionLog'

/**
 * Core Layer Scope
 * Identifies which layer a piece of data or influence belongs to
 */
export type CoreLayerScope = 'shared_trunk' | 'personal_branch' | 'app_facade'

/**
 * Shared Trunk State
 * Read-mostly repository of universal patterns, concepts, and biases.
 * Shared across all users and apps. Updated rarely, through promotion.
 */
export type SharedTrunkState = {
  /** Unique identifier for this trunk instance */
  trunkId: string

  /** Schema patterns promoted to trunk (universal recurring patterns) */
  schemaPatterns: SchemaPattern[]

  /** Conceptual biases: general tendencies in meaning-making */
  conceptualBiases: Record<string, number>

  /** Mixed nodes that have been promoted to trunk (universal multi-axis states) */
  promotedMixedNodes: MixedLatentNode[]

  /** Proto-meaning bias weights (affect how meanings are derived) */
  protoMeaningBias: Record<string, number>

  /** Option detection bias (which options get noticed more often) */
  optionDetectionBias: Record<string, number>

  /** Trunk version (incremented on updates) */
  version: number

  /** Last update timestamp */
  lastUpdatedAt: number

  /** Notes about what's in the trunk (for Observe) */
  notes: string[]

  /** Promotion queue entries (Phase M10) */
  promotionQueue?: PromotionQueueEntry[]

  /** Promotion event logs (Phase M10) */
  promotionLogs?: PromotionLogEntry[]

  /** Guardian review queue (Phase M11) */
  guardianReviewQueue?: import('./guardian/guardianTypes').GuardianReviewQueueEntry[]
}

/**
 * Personal Branch State
 * User-specific learned patterns, memories, and preferences.
 * This is where active learning happens. Grows independently per user.
 */
export type PersonalBranchState = {
  /** Unique identifier for this branch (typically userId) */
  branchId: string

  /** User's personal schema patterns (not yet promoted to trunk) */
  personalSchemas: SchemaPattern[]

  /** User's personal mixed nodes (session-independent) */
  personalMixedNodes: MixedLatentNode[]

  /** User's pathway strengths (learning state) */
  pathwayStrengths: Map<string, number>

  /** User's somatic markers (personal body-state associations) */
  somaticMarkers: Map<string, number>

  /** User's personal conceptual biases */
  personalBiases: Record<string, number>

  /** User's personal proto-meaning weights */
  personalProtoWeights: Record<string, number>

  /** Active session brain state (runtime state) */
  sessionBrainState: SessionBrainState

  /** Branch version (incremented on updates) */
  version: number

  /** Last update timestamp */
  lastUpdatedAt: number

  /** Notes about what's in this branch (for Observe) */
  notes: string[]
}

/**
 * App Facade Configuration
 * Application-specific view layer and access control.
 * Determines what the app sees and how it can interact.
 */
export type AppFacadeConfig = {
  /** Unique identifier for this app facade */
  facadeId: string

  /** Application name (e.g., 'jibun_kaigi', 'crystallized_thinking') */
  appName: string

  /** Whether this app can read from shared trunk */
  canReadTrunk: boolean

  /** Whether this app can read from personal branch */
  canReadBranch: boolean

  /** Whether this app can write to personal branch */
  canWriteBranch: boolean

  /** Whether this app can propose promotions to trunk */
  canProposePromotions: boolean

  /** Trunk influence weight (0.0 - 1.0, how much trunk affects this app) */
  trunkInfluenceWeight: number

  /** Branch influence weight (0.0 - 1.0, how much branch affects this app) */
  branchInfluenceWeight: number

  /** Which schema patterns are visible to this app */
  visibleSchemaFilter?: (pattern: SchemaPattern) => boolean

  /** Which mixed nodes are visible to this app */
  visibleMixedNodeFilter?: (node: MixedLatentNode) => boolean

  /** App-specific display preferences */
  displayPreferences: {
    showTrunkOrigin: boolean
    showBranchOrigin: boolean
    showPromotionCandidates: boolean
  }

  /** Notes about this facade's configuration */
  notes: string[]
}

/**
 * Promotion Candidate
 * A personal branch pattern that may be promoted to shared trunk.
 */
export type PromotionCandidate = {
  /** Unique identifier for this candidate */
  id: string

  /** What is being considered for promotion */
  type: 'schema' | 'mixed_node' | 'bias' | 'proto_weight'

  /** Source data (the actual schema, node, etc.) */
  sourceData: SchemaPattern | MixedLatentNode | Record<string, number>

  /** Promotion score (0.0 - 1.0, higher = more worthy of promotion) */
  score: number

  /** Reasons why this is a promotion candidate */
  reasons: string[]

  /** When this candidate was first identified */
  firstIdentifiedAt: number

  /** How many times this candidate has been reinforced */
  reinforcementCount: number

  /** Whether this candidate has been approved for promotion */
  approved: boolean

  /** Whether this candidate has been rejected */
  rejected: boolean
}

/**
 * Core View
 * Unified view combining trunk + branch + facade for runtime use.
 * This is what the runtime actually sees and uses.
 */
export type CoreView = {
  /** Active schema patterns (merged from trunk + branch) */
  activeSchemas: Array<SchemaPattern & { origin: CoreLayerScope }>

  /** Active mixed nodes (merged from trunk + branch) */
  activeMixedNodes: Array<MixedLatentNode & { origin: CoreLayerScope }>

  /** Merged conceptual biases */
  mergedBiases: Record<string, number>

  /** Merged proto-meaning weights */
  mergedProtoWeights: Record<string, number>

  /** Current session brain state (from personal branch) */
  sessionBrainState: SessionBrainState

  /** Promotion candidates (for Observe visibility) */
  promotionCandidates: PromotionCandidate[]

  /** Influence notes (for Observe visibility) */
  influenceNotes: CoreInfluenceNote[]
}

/**
 * Core Influence Note
 * Records how trunk or branch influenced processing.
 */
export type CoreInfluenceNote = {
  /** Which layer had influence */
  origin: CoreLayerScope

  /** What was influenced */
  target: 'schema' | 'mixed_node' | 'proto' | 'option' | 'decision'

  /** ID of the source pattern/node */
  sourceId: string

  /** Magnitude of influence */
  delta: number

  /** Reason for this influence */
  reason: string
}

/**
 * Trunk Influence Application Result
 */
export type TrunkInfluenceResult = {
  /** Influenced schema patterns */
  influencedSchemas: SchemaPattern[]

  /** Influenced mixed nodes */
  influencedMixedNodes: MixedLatentNode[]

  /** Influence notes */
  notes: CoreInfluenceNote[]
}

/**
 * Branch Influence Application Result
 */
export type BranchInfluenceResult = {
  /** Influenced schema patterns */
  influencedSchemas: SchemaPattern[]

  /** Influenced mixed nodes */
  influencedMixedNodes: MixedLatentNode[]

  /** Influence notes */
  notes: CoreInfluenceNote[]
}
