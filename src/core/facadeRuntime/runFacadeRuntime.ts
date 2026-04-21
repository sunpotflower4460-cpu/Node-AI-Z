/**
 * Run Facade Runtime - Phase M16
 * Main orchestrator for facade runtime operations
 */

import type {
  FacadeRequest,
  FacadeResponse,
  FacadeObservableState,
} from './facadeRuntimeTypes'
import type {
  CoreView,
  SharedTrunkState,
  PersonalBranchState,
  AppFacadeMode,
} from '../coreTypes'
import { resolveFacadeRequest, validateFacadeRequest } from './resolveFacadeRequest'
import {
  getOrCreateFacade,
  logFacadeRequest,
  getFacadeRegistry,
  cleanupStaleFacades,
} from './facadeRuntimeRegistry'
import { getFacadeCapabilityPolicy, getAllPoliciesSummary } from './facadeCapabilityPolicy'

/**
 * Run Facade Runtime Configuration
 */
export type RunFacadeRuntimeConfig = {
  /** Whether to auto-cleanup stale facades */
  autoCleanup: boolean

  /** Max age for stale facade cleanup (ms) */
  staleMaxAge: number

  /** Whether to log all requests */
  logRequests: boolean
}

/**
 * Default configuration
 */
const defaultConfig: RunFacadeRuntimeConfig = {
  autoCleanup: true,
  staleMaxAge: 3600000, // 1 hour
  logRequests: true,
}

/**
 * Run facade runtime - main entry point
 * Processes a facade request and returns a response
 */
export const runFacadeRuntime = (
  request: FacadeRequest,
  coreView: CoreView,
  trunk: SharedTrunkState,
  branch: PersonalBranchState,
  config: Partial<RunFacadeRuntimeConfig> = {}
): FacadeResponse => {
  const finalConfig = { ...defaultConfig, ...config }

  try {
    // Validate request structure
    if (!validateFacadeRequest(request)) {
      return createErrorResponse('INVALID_REQUEST', 'Invalid request structure')
    }

    // Register or update facade
    getOrCreateFacade(request.mode, request.sessionId, request.userId)

    // Resolve the request
    const response = resolveFacadeRequest(request, coreView, trunk, branch)

    // Log request if enabled
    if (finalConfig.logRequests) {
      logFacadeRequest(request, response)
    }

    // Auto-cleanup stale facades if enabled
    if (finalConfig.autoCleanup) {
      cleanupStaleFacades(finalConfig.staleMaxAge)
    }

    return response
  } catch (error) {
    return createErrorResponse(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Unknown error'
    )
  }
}

/**
 * Get facade runtime state for Observe
 */
export const getFacadeRuntimeState = (): FacadeObservableState => {
  const registry = getFacadeRegistry()
  const activeFacades = registry.listActive()
  const recentRequests = registry.getRecentRequests(20)
  const policies = getAllPoliciesSummary()

  return {
    activeFacades: activeFacades.map((entry) => ({
      facadeId: entry.facadeId,
      mode: entry.mode,
      activeSessionCount: 1, // Simplified for minimal implementation
      lastAccessedAt: entry.lastAccessedAt,
    })),
    policies: policies.map((p) => getFacadeCapabilityPolicy(p.mode)),
    recentRequests: recentRequests.map((req) => ({
      type: req.type,
      mode: activeFacades.find((f) => f.facadeId === req.facadeId)?.mode ?? 'future_app',
      timestamp: req.timestamp,
      success: req.success,
    })),
    notes: registry.getSummary(),
  }
}

/**
 * Initialize facade runtime for a specific mode
 * Convenience function to set up a facade before first use
 */
export const initializeFacadeRuntime = (
  mode: AppFacadeMode,
  sessionId: string,
  userId: string
): {
  facadeId: string
  policy: ReturnType<typeof getFacadeCapabilityPolicy>
} => {
  const facade = getOrCreateFacade(mode, sessionId, userId)
  return {
    facadeId: facade.facadeId,
    policy: facade.policy,
  }
}

/**
 * Create a minimal test request
 * Useful for testing facade runtime
 */
export const createTestRequest = (
  mode: AppFacadeMode,
  sessionId: string,
  userId: string
): FacadeRequest => {
  return {
    type: 'get_view',
    mode,
    sessionId,
    userId,
  }
}

/**
 * Validate facade runtime health
 * Returns health check information
 */
export const checkFacadeRuntimeHealth = (): {
  healthy: boolean
  statistics: {
    totalFacades: number
    facadesByMode: Record<AppFacadeMode, number>
    totalRequests: number
    successRate: number
  }
  notes: string[]
} => {
  const registry = getFacadeRegistry()
  const stats = registry.getStatistics()

  const notes: string[] = []
  notes.push(`${stats.totalFacades} active facades`)
  notes.push(`${stats.totalRequests} total requests`)
  notes.push(`${(stats.successRate * 100).toFixed(1)}% success rate`)

  const healthy = stats.successRate >= 0.95 || stats.totalRequests === 0

  return {
    healthy,
    statistics: stats,
    notes,
  }
}

/**
 * Create minimal crystallized_thinking facade runtime
 */
export const createCrystallizedThinkingRuntime = (
  sessionId: string,
  userId: string
) => {
  return initializeFacadeRuntime('crystallized_thinking', sessionId, userId)
}

/**
 * Create minimal observer facade runtime
 */
export const createObserverRuntime = (sessionId: string, userId: string) => {
  return initializeFacadeRuntime('observer', sessionId, userId)
}

/**
 * Create minimal future_app facade stub
 */
export const createFutureAppStub = (sessionId: string, userId: string) => {
  return initializeFacadeRuntime('future_app', sessionId, userId)
}

/**
 * Shutdown facade runtime
 * Cleanup all facades and reset state
 */
export const shutdownFacadeRuntime = (): void => {
  const registry = getFacadeRegistry()
  registry.clear()
}

/**
 * Helper: Create error response
 */
const createErrorResponse = (
  errorCode: 'PERMISSION_DENIED' | 'INVALID_REQUEST' | 'INTERNAL_ERROR' | 'NOT_FOUND',
  error: string
): Extract<FacadeResponse, { success: false }> => {
  return {
    success: false,
    error,
    errorCode,
    metadata: {
      timestamp: Date.now(),
    },
  }
}

/**
 * Get facade runtime summary for logging/debugging
 */
export const getFacadeRuntimeSummary = (): string => {
  const registry = getFacadeRegistry()
  const stats = registry.getStatistics()

  return `Facade Runtime: ${stats.totalFacades} active, ${stats.totalRequests} requests, ${(
    stats.successRate * 100
  ).toFixed(1)}% success`
}
