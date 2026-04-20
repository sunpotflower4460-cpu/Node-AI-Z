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
