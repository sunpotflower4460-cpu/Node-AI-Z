import { describe, expect, it } from 'vitest'
import { buildDevelopmentDashboard } from '../buildDevelopmentDashboard'
import { createInitialSignalPersonalBranch } from '../../signalBranch/createInitialSignalPersonalBranch'

describe('buildDevelopmentDashboard', () => {
  it('returns a dashboard with current stage', () => {
    const dashboard = buildDevelopmentDashboard(createInitialSignalPersonalBranch())
    expect(dashboard.currentStage).toBeTruthy()
    expect(typeof dashboard.stageProgress).toBe('number')
    expect(dashboard.stageProgress).toBeGreaterThanOrEqual(0)
    expect(dashboard.stageProgress).toBeLessThanOrEqual(1)
  })

  it('includes requirements', () => {
    const dashboard = buildDevelopmentDashboard(createInitialSignalPersonalBranch())
    expect(Array.isArray(dashboard.requirements)).toBe(true)
  })

  it('includes next stage for non-final stages', () => {
    const dashboard = buildDevelopmentDashboard(createInitialSignalPersonalBranch())
    expect(dashboard.nextStage).toBeTruthy()
  })
})
