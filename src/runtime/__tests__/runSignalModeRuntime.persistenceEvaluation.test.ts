import { describe, expect, it } from 'vitest'
import { runSignalModeRuntime } from '../runSignalModeRuntime'
import { createSignalSnapshot } from '../../signalPersistence/createSignalSnapshot'
import { restoreSignalSnapshot } from '../../signalPersistence/restoreSignalSnapshot'
import { buildSignalRiskSummary } from '../../signalRisk/buildSignalRiskSummary'
import { buildDevelopmentDashboard } from '../../signalDevelopmentDashboard/buildDevelopmentDashboard'

describe('runSignalModeRuntime + persistence + evaluation', () => {
  it('can snapshot and restore state', async () => {
    const result = await runSignalModeRuntime({
      stimulus: { modality: 'text', vector: [0.8, 0.5], strength: 1, timestamp: 1000 },
      enableBindingTeacher: true,
      textSummary: 'test concept',
      isUserActive: true,
      recentActivityLevel: 0.5,
    })

    const snapshot = createSignalSnapshot({
      fieldState: result.fieldState,
      personalBranch: result.personalBranch,
      loopState: result.loopState,
      consolidationState: result.consolidationState,
      attentionBudget: result.attentionBudget,
    })
    expect(snapshot.metadata.mode).toBe('signal_mode')

    const restored = restoreSignalSnapshot(snapshot)
    expect(restored).not.toBeNull()
    expect(restored!.personalBranch.id).toBe(result.personalBranch.id)
  })

  it('computes risk report', async () => {
    const result = await runSignalModeRuntime({
      stimulus: { modality: 'text', vector: [0.8, 0.5], strength: 1, timestamp: 2000 },
      enableBindingTeacher: true,
      textSummary: 'risk test',
      isUserActive: true,
    })
    const risk = buildSignalRiskSummary(result.personalBranch, result.fieldState)
    expect(['low', 'medium', 'high']).toContain(risk.riskLevel)
  })

  it('computes development dashboard', async () => {
    const result = await runSignalModeRuntime({
      stimulus: { modality: 'text', vector: [0.8, 0.5], strength: 1, timestamp: 3000 },
      enableBindingTeacher: true,
      textSummary: 'dev dashboard test',
      isUserActive: true,
    })
    const dashboard = buildDevelopmentDashboard(result.personalBranch)
    expect(dashboard.currentStage).toBeTruthy()
    expect(dashboard.stageProgress).toBeGreaterThanOrEqual(0)
  })
})
