/**
 * Facade Runtime Tests - Phase M16
 * Tests for the minimal facade runtime implementation
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  runFacadeRuntime,
  createTestRequest,
  getFacadeRuntimeState,
  checkFacadeRuntimeHealth,
  shutdownFacadeRuntime,
  createCrystallizedThinkingRuntime,
  createObserverRuntime,
  createFutureAppStub,
} from '../runFacadeRuntime'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import { createEmptyPersonalBranch } from '../../personalBranch'
import { resolveCoreView } from '../../resolveCoreView'
import { createCrystallizedThinkingFacade } from '../../appFacade'

describe('Facade Runtime - Phase M16', () => {
  beforeEach(() => {
    // Clean up before each test
    shutdownFacadeRuntime()
  })

  it('should initialize crystallized_thinking facade runtime', () => {
    const result = createCrystallizedThinkingRuntime('session-1', 'user-1')

    expect(result.facadeId).toBe('facade-crystallized_thinking-session-1')
    expect(result.policy.mode).toBe('crystallized_thinking')
    expect(result.policy.readableScopes).toContain('shared_trunk')
    expect(result.policy.readableScopes).toContain('personal_branch')
    expect(result.policy.writableScopes).toContain('personal_branch')
    expect(result.policy.allowPromotionRead).toBe(true)
    expect(result.policy.allowPromotionWrite).toBe(true)
  })

  it('should initialize observer facade runtime with read-only access', () => {
    const result = createObserverRuntime('session-2', 'user-2')

    expect(result.facadeId).toBe('facade-observer-session-2')
    expect(result.policy.mode).toBe('observer')
    expect(result.policy.readableScopes).toContain('shared_trunk')
    expect(result.policy.readableScopes).toContain('personal_branch')
    expect(result.policy.writableScopes).toHaveLength(0)
    expect(result.policy.allowPromotionWrite).toBe(false)
  })

  it('should initialize future_app stub with minimal access', () => {
    const result = createFutureAppStub('session-3', 'user-3')

    expect(result.facadeId).toBe('facade-future_app-session-3')
    expect(result.policy.mode).toBe('future_app')
    expect(result.policy.readableScopes).toContain('personal_branch')
    expect(result.policy.writableScopes).toHaveLength(0)
    expect(result.policy.allowPromotionRead).toBe(false)
  })

  it('should handle get_view request through facade runtime', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('user-1')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const request = createTestRequest('crystallized_thinking', 'session-1', 'user-1')
    const response = runFacadeRuntime(request, coreView, trunk, branch)

    expect(response.success).toBe(true)
    if (response.success && response.type === 'view') {
      expect(response.view).toBeDefined()
      expect(response.view.viewMetadata.mode).toBe('crystallized_thinking')
      expect(response.metadata.mode).toBe('crystallized_thinking')
    }
  })

  it('should return facade runtime state', () => {
    // Initialize some facades
    createCrystallizedThinkingRuntime('session-1', 'user-1')
    createObserverRuntime('session-2', 'user-2')

    const state = getFacadeRuntimeState()

    expect(state.activeFacades.length).toBeGreaterThanOrEqual(2)
    expect(state.policies.length).toBe(4) // All 4 mode policies
    expect(state.notes.length).toBeGreaterThan(0)
  })

  it('should check facade runtime health', () => {
    const health = checkFacadeRuntimeHealth()

    expect(health.healthy).toBe(true)
    expect(health.statistics).toBeDefined()
    expect(health.notes.length).toBeGreaterThan(0)
  })

  it('should handle invalid request gracefully', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('user-1')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const invalidRequest = {
      type: 'invalid_type',
      mode: 'crystallized_thinking',
      sessionId: 'session-1',
      userId: 'user-1',
    } as any

    const response = runFacadeRuntime(invalidRequest, coreView, trunk, branch)

    expect(response.success).toBe(false)
    if (!response.success) {
      expect(response.errorCode).toBe('INVALID_REQUEST')
    }
  })

  it('should track multiple facade sessions', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('user-1')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    // Create multiple requests
    const request1 = createTestRequest('crystallized_thinking', 'session-1', 'user-1')
    const request2 = createTestRequest('observer', 'session-2', 'user-2')
    const request3 = createTestRequest('future_app', 'session-3', 'user-3')

    runFacadeRuntime(request1, coreView, trunk, branch)
    runFacadeRuntime(request2, coreView, trunk, branch)
    runFacadeRuntime(request3, coreView, trunk, branch)

    const state = getFacadeRuntimeState()
    expect(state.activeFacades.length).toBeGreaterThanOrEqual(3)
  })

  it('should shutdown facade runtime cleanly', () => {
    createCrystallizedThinkingRuntime('session-1', 'user-1')
    createObserverRuntime('session-2', 'user-2')

    let state = getFacadeRuntimeState()
    expect(state.activeFacades.length).toBeGreaterThan(0)

    shutdownFacadeRuntime()

    state = getFacadeRuntimeState()
    expect(state.activeFacades.length).toBe(0)
  })
})
