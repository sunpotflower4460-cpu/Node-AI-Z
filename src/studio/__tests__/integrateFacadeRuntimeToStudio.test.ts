/**
 * Observer Facade Integration Tests - Phase M16
 * Tests observer connection to facade runtime through studio
 */

import { describe, it, expect } from 'vitest'
import { createEmptySharedTrunk } from '../../core/sharedTrunk'
import { createEmptyPersonalBranch } from '../../core/personalBranch'
import { createCrystallizedThinkingFacade } from '../../core/appFacade'
import { resolveCoreView } from '../../core/resolveCoreView'
import {
  getStudioFacadeView,
  summarizeFacadeViewForStudio,
  isFacadeRuntimeConnected,
} from '../integrateFacadeRuntimeToStudio'

describe('Observer Facade Integration - Phase M16', () => {
  it('should get studio facade view for observer', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('test-user')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const result = getStudioFacadeView(
      coreView,
      trunk,
      branch,
      'session-studio-1',
      'user-studio'
    )

    expect(result.success).toBe(true)
    expect(result.notes.length).toBeGreaterThan(0)
    expect(result.notes[0]).toContain('Observer accessing Mother Core')
    if (result.view) {
      expect(result.view.viewMetadata.mode).toBe('observer')
    }
    expect(result.translation).toBeDefined()
  })

  it('should summarize facade view for studio display', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('test-user')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const result = getStudioFacadeView(
      coreView,
      trunk,
      branch,
      'session-studio-2',
      'user-studio'
    )

    if (result.success && result.view) {
      const summary = summarizeFacadeViewForStudio(result.view)

      expect(summary.length).toBeGreaterThan(0)
      expect(summary.some((s) => s.includes('Mode:'))).toBe(true)
      expect(summary.some((s) => s.includes('Readable scopes:'))).toBe(true)
      expect(summary.some((s) => s.includes('Visible schemas:'))).toBe(true)
    }
  })

  it('should check if facade runtime is connected', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('test-user')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const result = getStudioFacadeView(
      coreView,
      trunk,
      branch,
      'session-studio-3',
      'user-studio'
    )

    if (result.success && result.view) {
      const connected = isFacadeRuntimeConnected(result.view)
      expect(connected).toBe(true)
    }
  })

  it('should detect disconnected facade runtime', () => {
    const connected = isFacadeRuntimeConnected(undefined)
    expect(connected).toBe(false)
  })

  it('should provide helpful notes on error', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('test-user')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const result = getStudioFacadeView(coreView, trunk, branch, '', '')

    expect(result.notes).toBeDefined()
    expect(result.notes.length).toBeGreaterThan(0)
  })

  it('should indicate read-only access for observer', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('test-user')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)

    const result = getStudioFacadeView(
      coreView,
      trunk,
      branch,
      'session-readonly',
      'user-readonly'
    )

    expect(result.notes.some((n) => n.includes('Read-only'))).toBe(true)
  })
})
