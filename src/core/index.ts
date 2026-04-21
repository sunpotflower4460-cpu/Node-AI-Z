/**
 * Core Module Index - Phase M9
 * Exports all core trunk/branch/facade functionality.
 */

// Type exports
export type {
  CoreLayerScope,
  SharedTrunkState,
  PersonalBranchState,
  AppFacadeConfig,
  PromotionCandidate,
  CoreView,
  CoreInfluenceNote,
  TrunkInfluenceResult,
  BranchInfluenceResult,
} from './coreTypes'

// Shared Trunk exports
export {
  createEmptySharedTrunk,
  getTrunkSchemas,
  getTrunkMixedNodes,
  getTrunkBias,
  getTrunkProtoMeaningBias,
  getTrunkOptionBias,
  addPromotedSchema,
  addPromotedMixedNode,
  updateTrunkBias,
} from './sharedTrunk'

// Personal Branch exports
export {
  createEmptyPersonalBranch,
  getBranchSchemas,
  getBranchMixedNodes,
  getPathwayStrength,
  getSomaticMarker,
  getBranchBias,
  updateBranchSchema,
  updateBranchMixedNode,
  updatePathwayStrength,
  updateSomaticMarker,
  updateBranchSessionState,
  updateBranchBias,
} from './personalBranch'

// App Facade exports
export {
  createCrystallizedThinkingFacade,
  createJibunKaigiFacade,
  createReadOnlyFacade,
  validateFacadePermission,
  getEffectiveInfluenceWeights,
} from './appFacade'

// Core View Resolution exports
export {
  resolveCoreView,
} from './resolveCoreView'

// Trunk Influence exports
export {
  applyTrunkInfluence,
  applyTrunkInfluenceToSchemas,
  applyTrunkInfluenceToMixedNodes,
  applyTrunkConceptualBias,
} from './applyTrunkInfluence'

// Branch Influence exports
export {
  applyBranchInfluence,
  applyBranchInfluenceToSchemas,
  applyBranchInfluenceToMixedNodes,
  applyBranchPersonalBias,
} from './applyBranchInfluence'

// Promotion Candidates exports
export {
  derivePromotionCandidates,
  deriveSchemaPromotionCandidates,
  deriveMixedNodePromotionCandidates,
} from './derivePromotionCandidates'

// Promotion Pipeline exports (Phase M10)
export type {
  PromotionStatus,
  PromotionRiskLevel,
  PromotionValidationResult,
  PromotionQueueEntry,
  PromotionApprovalRecord,
  PromotionApplyResult,
} from './promotion/promotionTypes'

export type {
  PromotionRiskAssessment,
} from './promotion/derivePromotionRisk'

export type {
  PromotionLogEntry,
} from './promotion/promotionLog'

export {
  enqueuePromotionCandidate,
  listPromotionQueue,
  updatePromotionQueueEntry,
  findPromotionQueueEntry,
  clearAppliedPromotionEntries,
  getPromotionQueueState,
  restorePromotionQueueState,
  clearPromotionQueue,
} from './promotion/promotionQueue'

export {
  derivePromotionRisk,
} from './promotion/derivePromotionRisk'

export {
  validatePromotionCandidate,
} from './promotion/validatePromotionCandidate'

export {
  resolvePromotionDecision,
  shouldReEvaluateCandidate,
} from './promotion/resolvePromotionDecision'

export {
  applyApprovedPromotion,
} from './promotion/applyApprovedPromotion'

export {
  logCandidateQueued,
  logValidationFinished,
  logCandidateQuarantined,
  logCandidateRejected,
  logCandidateApproved,
  logCandidateApplied,
  getPromotionLog,
  getPromotionLogForCandidate,
  getPromotionLogByEventType,
  clearPromotionLog,
  getPromotionLogState,
  restorePromotionLogState,
} from './promotion/promotionLog'

// Guardian Layer exports (Phase M11)
export type {
  GuardianMode,
  GuardianActor,
  GuardianDecision,
  GuardianReviewRequest,
  GuardianReviewResult,
  GuardianReviewQueueEntry,
  GuardianPolicy,
} from './guardian/guardianTypes'

export type {
  GuardianDecisionResult,
} from './guardian/guardianDecisionResolver'

export type {
  GuardianAdapter,
} from './guardian/resolveGuardianReview'

export {
  defaultGuardianPolicy,
  resolveGuardianMode,
  getGuardianPolicy,
} from './guardian/guardianPolicy'

export {
  buildGuardianReviewRequest,
} from './guardian/buildGuardianReviewRequest'

export {
  enqueueGuardianReview,
  listGuardianReviewQueue,
  updateGuardianReviewQueueEntry,
  resolveGuardianReviewQueueEntry,
  findGuardianReviewQueueEntry,
  clearResolvedGuardianEntries,
  getGuardianReviewQueueState,
  restoreGuardianReviewQueueState,
  clearGuardianReviewQueue,
} from './guardian/guardianReviewQueue'

export {
  resolveGuardianReview,
} from './guardian/resolveGuardianReview'

export {
  guardianDecisionResolver,
} from './guardian/guardianDecisionResolver'
