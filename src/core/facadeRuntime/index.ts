/**
 * Facade Runtime Module - Phase M16
 * Exports all facade runtime functionality
 */

// Type exports
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
} from './facadeRuntimeTypes'

export type { RunFacadeRuntimeConfig } from './runFacadeRuntime'

// Capability Policy exports
export {
  getFacadeCapabilityPolicy,
  validateFacadeScope,
  canAccessPromotions,
  canAccessTrunkSafety,
  getAllFacadeModes,
  getAllPoliciesSummary,
} from './facadeCapabilityPolicy'

// Build Facade View exports
export {
  buildFacadeView,
  createEmptyFacadeView,
  summarizeFacadeView,
} from './buildFacadeView'

// Resolve Facade Request exports
export {
  resolveFacadeRequest,
  validateFacadeRequest,
} from './resolveFacadeRequest'

// Facade Action Router exports
export {
  routeFacadeAction,
  validateFacadeAction,
  getActionMetadata,
  summarizeAction,
} from './facadeActionRouter'

// Facade Runtime Registry exports
export {
  FacadeRuntimeRegistry,
  getFacadeRegistry,
  registerFacade,
  getOrCreateFacade,
  logFacadeRequest,
  getFacadeStatistics,
  cleanupStaleFacades,
} from './facadeRuntimeRegistry'

// Run Facade Runtime exports
export {
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
} from './runFacadeRuntime'
