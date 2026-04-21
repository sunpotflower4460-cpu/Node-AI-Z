import { describe, it, expect, beforeEach } from 'vitest'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import { createEmptyPersonalBranch } from '../../personalBranch'
import { createCrystallizedThinkingFacade } from '../../appFacade'
import { resolveCoreView } from '../../resolveCoreView'
import { createTestRequest, runFacadeRuntime, shutdownFacadeRuntime } from '../runFacadeRuntime'

describe('runFacadeRuntime surface translator', () => {
  beforeEach(() => {
    shutdownFacadeRuntime()
  })

  it('returns translated and raw facade views with translation metadata', () => {
    const trunk = createEmptySharedTrunk()
    const branch = createEmptyPersonalBranch('user-1')
    const facade = createCrystallizedThinkingFacade()
    const coreView = resolveCoreView(trunk, branch, facade)
    const request = createTestRequest('crystallized_thinking', 'session-translation', 'user-1')

    const response = runFacadeRuntime(request, coreView, trunk, branch)

    expect(response.success).toBe(true)
    if (response.success && response.type === 'view') {
      expect(response.view.surfacePresentation).toBeDefined()
      expect(response.rawView).toBeDefined()
      expect(response.translation).toBeDefined()
      expect(response.translation?.highlightKeys.length).toBeGreaterThanOrEqual(0)
    }
  })
})
