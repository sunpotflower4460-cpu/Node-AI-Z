/**
 * Facade Runtime Registry - Phase M16
 * Manages registered facades and their runtime state
 */

import type { AppFacadeMode } from '../coreTypes'
import type {
  FacadeCapabilityPolicy,
  FacadeRequest,
  FacadeResponse,
} from './facadeRuntimeTypes'
import { getFacadeCapabilityPolicy, getAllFacadeModes } from './facadeCapabilityPolicy'

/**
 * Facade Runtime Entry
 * Tracks an active facade runtime instance
 */
type FacadeRuntimeEntry = {
  facadeId: string
  mode: AppFacadeMode
  policy: FacadeCapabilityPolicy
  sessionId: string
  userId: string
  createdAt: number
  lastAccessedAt: number
  requestCount: number
}

/**
 * Facade Runtime Registry State
 * In-memory registry of active facades
 */
class FacadeRuntimeRegistry {
  private entries: Map<string, FacadeRuntimeEntry> = new Map()
  private requestLog: Array<{
    facadeId: string
    type: string
    timestamp: number
    success: boolean
  }> = []

  /**
   * Register a new facade runtime
   */
  register(
    mode: AppFacadeMode,
    sessionId: string,
    userId: string
  ): FacadeRuntimeEntry {
    const facadeId = `facade-${mode}-${sessionId}`
    const policy = getFacadeCapabilityPolicy(mode)

    const entry: FacadeRuntimeEntry = {
      facadeId,
      mode,
      policy,
      sessionId,
      userId,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      requestCount: 0,
    }

    this.entries.set(facadeId, entry)
    return entry
  }

  /**
   * Get a facade runtime entry
   */
  get(facadeId: string): FacadeRuntimeEntry | undefined {
    return this.entries.get(facadeId)
  }

  /**
   * Get or create facade runtime entry
   */
  getOrCreate(
    mode: AppFacadeMode,
    sessionId: string,
    userId: string
  ): FacadeRuntimeEntry {
    const facadeId = `facade-${mode}-${sessionId}`
    const existing = this.entries.get(facadeId)

    if (existing) {
      // Update last accessed
      existing.lastAccessedAt = Date.now()
      return existing
    }

    return this.register(mode, sessionId, userId)
  }

  /**
   * Update facade access time and increment request count
   */
  recordAccess(facadeId: string): void {
    const entry = this.entries.get(facadeId)
    if (entry) {
      entry.lastAccessedAt = Date.now()
      entry.requestCount++
    }
  }

  /**
   * Log a request
   */
  logRequest(request: FacadeRequest, response: FacadeResponse): void {
    const facadeId = `facade-${request.mode}-${request.sessionId}`

    this.requestLog.push({
      facadeId,
      type: request.type,
      timestamp: Date.now(),
      success: response.success,
    })

    // Keep only recent requests (last 100)
    if (this.requestLog.length > 100) {
      this.requestLog.shift()
    }

    // Record access
    this.recordAccess(facadeId)
  }

  /**
   * Get all active facades
   */
  listActive(): FacadeRuntimeEntry[] {
    return Array.from(this.entries.values())
  }

  /**
   * Get facades by mode
   */
  listByMode(mode: AppFacadeMode): FacadeRuntimeEntry[] {
    return this.listActive().filter((entry) => entry.mode === mode)
  }

  /**
   * Get facades by user
   */
  listByUser(userId: string): FacadeRuntimeEntry[] {
    return this.listActive().filter((entry) => entry.userId === userId)
  }

  /**
   * Get recent requests
   */
  getRecentRequests(limit: number = 20): typeof this.requestLog {
    return this.requestLog.slice(-limit)
  }

  /**
   * Clean up stale facades
   */
  cleanupStale(maxAgeMs: number = 3600000): number {
    // Default: 1 hour
    const now = Date.now()
    let removed = 0

    for (const [facadeId, entry] of this.entries.entries()) {
      if (now - entry.lastAccessedAt > maxAgeMs) {
        this.entries.delete(facadeId)
        removed++
      }
    }

    return removed
  }

  /**
   * Remove a specific facade
   */
  remove(facadeId: string): boolean {
    return this.entries.delete(facadeId)
  }

  /**
   * Clear all facades
   */
  clear(): void {
    this.entries.clear()
    this.requestLog = []
  }

  /**
   * Get registry statistics
   */
  getStatistics(): {
    totalFacades: number
    facadesByMode: Record<AppFacadeMode, number>
    totalRequests: number
    successRate: number
  } {
    const facadesByMode: Record<string, number> = {}

    for (const mode of getAllFacadeModes()) {
      facadesByMode[mode] = this.listByMode(mode).length
    }

    const totalRequests = this.requestLog.length
    const successfulRequests = this.requestLog.filter((req) => req.success).length
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 1.0

    return {
      totalFacades: this.entries.size,
      facadesByMode: facadesByMode as Record<AppFacadeMode, number>,
      totalRequests,
      successRate,
    }
  }

  /**
   * Get summary for Observe
   */
  getSummary(): string[] {
    const stats = this.getStatistics()
    const summary: string[] = []

    summary.push(`Total active facades: ${stats.totalFacades}`)
    summary.push(`Total requests: ${stats.totalRequests}`)
    summary.push(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`)

    for (const [mode, count] of Object.entries(stats.facadesByMode)) {
      if (count > 0) {
        summary.push(`  ${mode}: ${count} active`)
      }
    }

    return summary
  }
}

/**
 * Global facade registry instance
 */
const globalRegistry = new FacadeRuntimeRegistry()

/**
 * Get the global facade registry
 */
export const getFacadeRegistry = (): FacadeRuntimeRegistry => {
  return globalRegistry
}

/**
 * Register a facade (convenience function)
 */
export const registerFacade = (
  mode: AppFacadeMode,
  sessionId: string,
  userId: string
): FacadeRuntimeEntry => {
  return globalRegistry.register(mode, sessionId, userId)
}

/**
 * Get or create facade (convenience function)
 */
export const getOrCreateFacade = (
  mode: AppFacadeMode,
  sessionId: string,
  userId: string
): FacadeRuntimeEntry => {
  return globalRegistry.getOrCreate(mode, sessionId, userId)
}

/**
 * Log request (convenience function)
 */
export const logFacadeRequest = (
  request: FacadeRequest,
  response: FacadeResponse
): void => {
  globalRegistry.logRequest(request, response)
}

/**
 * Get registry statistics (convenience function)
 */
export const getFacadeStatistics = () => {
  return globalRegistry.getStatistics()
}

/**
 * Cleanup stale facades (convenience function)
 */
export const cleanupStaleFacades = (maxAgeMs?: number): number => {
  return globalRegistry.cleanupStale(maxAgeMs)
}

/**
 * Export registry class for testing
 */
export { FacadeRuntimeRegistry }
