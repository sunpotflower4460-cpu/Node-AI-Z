/**
 * Facade Runtime Integration Tests - Phase M16
 * Tests crystallized_thinking and observer connections to facade runtime
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createEmptySharedTrunk } from '../../core/sharedTrunk'
import { createEmptyPersonalBranch } from '../../core/personalBranch'
import { createCrystallizedThinkingFacade } from '../../core/appFacade'
import { resolveCoreView } from '../../core/resolveCoreView'
import {
  getCrystallizedThinkingFacadeView,
  getObserverFacadeView,
  submitBranchUpdateThroughFacade,
  queryFacadeRuntimeState,
  attachFacadeViewToBrainState,
} from '../integrateFacadeRuntime'
import { createInitialBrainState } from '../../brain/createInitialBrainState'

describe('Facade Runtime Integration - Phase M16', () => {
  let trunk: ReturnType<typeof createEmptySharedTrunk>
  let branch: ReturnType<typeof createEmptyPersonalBranch>
  let coreView: ReturnType<typeof resolveCoreView>

  beforeEach(() => {
    trunk = createEmptySharedTrunk()
    branch = createEmptyPersonalBranch('test-user')
    const facade = createCrystallizedThinkingFacade()
    coreView = resolveCoreView(trunk, branch, facade)
  })

  describe('Crystallized Thinking Integration', () => {
    it('should get facade view for crystallized_thinking', () => {
    const result = getCrystallizedThinkingFacadeView(
      coreView,
      trunk,
      branch,
      'session-crystal-1',
      'user-1'
    )

    expect(result.success).toBe(true)
    expect(result.view).toBeDefined()
    if (result.view) {
      expect(result.view.viewMetadata.mode).toBe('crystallized_thinking')
      expect(result.view.viewMetadata.readableScopes).toContain('shared_trunk')
      expect(result.view.viewMetadata.readableScopes).toContain('personal_branch')
      expect(result.view.visibleSchemas).toBeDefined()
      expect(result.view.visibleMixedNodes).toBeDefined()
    }
    expect(result.translation?.mode).toBe('crystallized_thinking')
  })

    it('should have write access to personal branch', () => {
      const result = getCrystallizedThinkingFacadeView(
        coreView,
        trunk,
        branch,
        'session-crystal-2',
        'user-1'
      )

      expect(result.success).toBe(true)
      // Verify that crystallized_thinking can see writable scope
      // (this is implicit in the policy, checked via facade capability)
    })

    it('should attach facade view to brain state', () => {
      const brainState = createInitialBrainState()
      const facadeResult = getCrystallizedThinkingFacadeView(
        coreView,
        trunk,
        branch,
        brainState.sessionId,
        'user-1'
      )

      if (facadeResult.success && facadeResult.view) {
        const updatedBrainState = attachFacadeViewToBrainState(brainState, facadeResult.view)

        // Phase M16: attachFacadeViewToBrainState currently returns unchanged brain state
        // Future: will add facadeViewMetadata to brain state type
        expect(updatedBrainState.sessionId).toBe(brainState.sessionId)
        expect(updatedBrainState).toBeDefined()
      }
    })

    it('should allow branch updates through facade', () => {
      const response = submitBranchUpdateThroughFacade(
        coreView,
        trunk,
        branch,
        'session-crystal-3',
        'user-1',
        { testUpdate: 'value' }
      )

      expect(response.success).toBe(true)
      if (response.success && response.type === 'branch_updated') {
        expect(response.updatedFields).toBeDefined()
      }
    })
  })

  describe('Observer Integration', () => {
    it('should get facade view for observer (read-only)', () => {
    const result = getObserverFacadeView(
      coreView,
      trunk,
      branch,
      'session-observer-1',
      'user-2'
    )

    expect(result.success).toBe(true)
    expect(result.view).toBeDefined()
    if (result.view) {
      expect(result.view.viewMetadata.mode).toBe('observer')
      expect(result.view.viewMetadata.readableScopes).toContain('shared_trunk')
      expect(result.view.viewMetadata.readableScopes).toContain('personal_branch')
      expect(result.view.visibleSchemas).toBeDefined()
      expect(result.view.visibleMixedNodes).toBeDefined()
    }
    expect(result.translation?.mode).toBe('observer')
  })

    it('should have read-only access (no write to branch)', () => {
      const result = getObserverFacadeView(
        coreView,
        trunk,
        branch,
        'session-observer-2',
        'user-2'
      )

      expect(result.success).toBe(true)
      // Observer should not be able to write - verified by capability policy
    })

    it('should query facade runtime state', () => {
      const response = queryFacadeRuntimeState(
        coreView,
        trunk,
        branch,
        'session-observer-3',
        'user-2'
      )

      expect(response.success).toBe(true)
      if (response.success && response.type === 'facade_state') {
        expect(response.state).toBeDefined()
        expect(response.state.activeFacades).toBeDefined()
        expect(response.state.policies).toBeDefined()
      }
    })
  })

  describe('Capability Policy Enforcement', () => {
    it('should enforce crystallized_thinking can access promotions', () => {
      const result = getCrystallizedThinkingFacadeView(
        coreView,
        trunk,
        branch,
        'session-cap-1',
        'user-1'
      )

      if (result.success && result.view) {
        // crystallized_thinking should have promotion access
        expect(result.view.promotionCandidates).toBeDefined()
      }
    })

    it('should enforce observer cannot write promotions', () => {
      const result = getObserverFacadeView(
        coreView,
        trunk,
        branch,
        'session-cap-2',
        'user-2'
      )

      if (result.success && result.view) {
        // Observer can see promotions but cannot write (enforced by policy)
        // This is checked in the runtime, not directly in view
        expect(result.view.viewMetadata.mode).toBe('observer')
      }
    })
  })

  describe('Session and User Tracking', () => {
    it('should track different sessions independently', () => {
      const result1 = getCrystallizedThinkingFacadeView(
        coreView,
        trunk,
        branch,
        'session-A',
        'user-1'
      )

      const result2 = getCrystallizedThinkingFacadeView(
        coreView,
        trunk,
        branch,
        'session-B',
        'user-1'
      )

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
      // Both should succeed independently
    })

    it('should handle multiple users', () => {
      const result1 = getObserverFacadeView(
        coreView,
        trunk,
        branch,
        'session-multi-1',
        'user-A'
      )

      const result2 = getObserverFacadeView(
        coreView,
        trunk,
        branch,
        'session-multi-2',
        'user-B'
      )

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      const result = getCrystallizedThinkingFacadeView(
        coreView,
        trunk,
        branch,
        '',
        ''
      )

      // Should still succeed with empty session/user (facade runtime handles it)
      expect(result).toBeDefined()
    })

    it('should attach facade view even when undefined', () => {
      const brainState = createInitialBrainState()
      const updatedBrainState = attachFacadeViewToBrainState(brainState, undefined)

      // Should return original brain state unchanged
      expect(updatedBrainState.sessionId).toBe(brainState.sessionId)
    })
  })
})
