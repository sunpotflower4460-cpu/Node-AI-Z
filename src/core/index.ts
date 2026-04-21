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
  AppFacadeMode,
  PromotionCandidate,
  CoreView,
  CoreInfluenceNote,
  TrunkInfluenceResult,
  BranchInfluenceResult,
} from './coreTypes'

export type {
  ComparableBranchSummary,
  BranchComparisonMatch,
  CrossBranchSupport,
  PromotionConsistencyRecord,
  PromotionCandidateComparisonProfile,
  BranchConsistencyScoreResult,
} from './comparison'

// Shared Trunk exports
export {
  createEmptySharedTrunk,
  loadSharedTrunkState,
  saveSharedTrunkState,
  clearSharedTrunkState,
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

export {
  buildComparableBranchSummary,
  comparePromotionCandidateAcrossBranches,
  computeBranchConsistencyScore,
  summarizeBranchConsistency,
  deriveCrossBranchSupport,
  attachConsistencyToPromotionCandidate,
} from './comparison'

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

// Trunk Safety exports (Phase M14)
export type {
  TrunkApplyRecord,
  TrunkRevertRecord,
  TrunkConsistencyResult,
  TrunkUndoResult,
  TrunkSnapshotRecord,
  TrunkApplyRollbackMetadata,
} from './trunkSafety'

export {
  appendTrunkApplyRecord,
  listTrunkApplyRecords,
  findTrunkApplyRecord,
  listApplyRecordsByCandidateId,
  appendTrunkRevertRecord,
  listTrunkRevertRecords,
  findTrunkRevertRecord,
  findRevertRecordByApplyRecordId,
  saveTrunkSnapshot,
  loadTrunkSnapshot,
  listTrunkSnapshotRecords,
  findTrunkSnapshotRecord,
  setCurrentRevertSafetySnapshotId,
  getCurrentRevertSafetySnapshotId,
  setLastTrunkConsistencyCheck,
  getLastTrunkConsistencyCheck,
  setSafeUndoNotes,
  getSafeUndoNotes,
  getTrunkSafetyState,
  restoreTrunkSafetyState,
  attachTrunkSafetyState,
  clearTrunkSafetyState,
  buildTrunkDiffSummary,
  runTrunkConsistencyCheck,
  trunkRevert,
  safeUndoTrunkApply,
} from './trunkSafety'

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
  HumanReviewSummary,
  HumanReviewRecord,
  HumanReviewDecisionInput,
} from './guardian/humanReview/humanReviewTypes'

export type {
  GuardianDecisionResult,
} from './guardian/guardianDecisionResolver'

export type {
  GuardianAdapter,
} from './guardian/resolveGuardianReview'

export type {
  AiSenseiMode,
  AiSenseiReviewPayload,
  AiSenseiReviewRawResponse,
  AiSenseiParsedReview,
  AiSenseiConfig,
} from './guardian/aiSensei'

export {
  defaultGuardianPolicy,
  resolveGuardianMode,
  getGuardianPolicy,
} from './guardian/guardianPolicy'

export {
  defaultAiSenseiConfig,
  getAiSenseiConfig,
  buildAiSenseiPayload,
  coerceAiSenseiRawResponse,
  parseAiSenseiResponse,
  buildAiSenseiFallbackReview,
  reviewWithAiSensei,
} from './guardian/aiSensei'

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

export {
  buildHumanReviewSummary,
} from './guardian/humanReview/buildHumanReviewSummary'

export {
  queueHumanReviewSummary,
  listPendingHumanReviews,
  listResolvedHumanReviews,
  submitHumanReviewDecision,
  getHumanReviewState,
  restoreHumanReviewState,
  clearHumanReviewState,
  resolvePendingWithRecordedDecisions,
} from './guardian/humanReview/humanReviewActions'

export type {
  HumanReviewEntry,
} from './guardian/humanReview/humanReviewActions'

// Facade Runtime exports (Phase M16)
export type {
  FacadeScope,
  FacadeCapabilityPolicy,
  FacadeRequest,
  FacadeResponse,
  FacadeView,
  FacadeObservableState,
  FacadeAction,
  FacadeActionResult,
  FacadeRuntimeContext,
  RunFacadeRuntimeConfig,
} from './facadeRuntime'

export {
  getFacadeCapabilityPolicy,
  validateFacadeScope,
  canAccessPromotions,
  canAccessTrunkSafety,
  getAllFacadeModes,
  getAllPoliciesSummary,
  buildFacadeView,
  createEmptyFacadeView,
  summarizeFacadeView,
  resolveFacadeRequest,
  validateFacadeRequest,
  routeFacadeAction,
  validateFacadeAction,
  getActionMetadata,
  summarizeAction,
  FacadeRuntimeRegistry,
  getFacadeRegistry,
  registerFacade,
  getOrCreateFacade,
  logFacadeRequest,
  getFacadeStatistics,
  cleanupStaleFacades,
  runFacadeRuntime,
  getFacadeRuntimeState,
  initializeFacadeRuntime,
  createTestRequest,
  checkFacadeRuntimeHealth,
  createCrystallizedThinkingRuntime,
  createObserverRuntime,
  createFutureAppStub,
  shutdownFacadeRuntime,
  getFacadeRuntimeSummary,
} from './facadeRuntime'
