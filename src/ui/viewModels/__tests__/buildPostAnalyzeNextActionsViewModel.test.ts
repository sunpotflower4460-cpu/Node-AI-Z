/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest'
import { buildPostAnalyzeNextActionsViewModel } from '../buildPostAnalyzeNextActionsViewModel'

describe('buildPostAnalyzeNextActionsViewModel', () => {
  it('returns empty actions when no observation', () => {
    const vm = buildPostAnalyzeNextActionsViewModel({
      currentObservation: null,
      previousObservation: null,
    })
    expect(vm.actions).toHaveLength(0)
  })

  it('returns field tab action when assembly count > 0', () => {
    const obs = {
      id: '1',
      type: 'observe' as const,
      runtimeMode: 'node' as const,
      text: 'test',
      timestamp: '2024-01-01T00:00:00Z',
      time: '00:00:00',
      pipelineResult: { meta: { bindingCount: 0, patternCount: 0, retrievalCount: 0 }, activatedNodes: [], bindings: [], liftedPatterns: [] } as any,
      studioView: {} as any,
      revisionEntry: { proposedChanges: [] } as any,
      assistantReply: 'test',
      signalOverviewSource: {
        observeSummary: {
          branch: {
            assemblyCount: 3,
            bridgeCount: 1,
            protoSeedCount: 0,
            teacherFreeBridgeCount: 0,
            averageRecallSuccess: 0,
            averageTeacherDependency: 0,
            branchId: 'test-branch',
          },
        },
        riskReport: { riskLevel: 'low', warnings: [], overbindingRisk: 0, teacherOvertrustRisk: 0, falseBindingRisk: 0, dreamNoiseRisk: 0, recommendedActions: [] },
        developmentDashboard: { stageProgress: 0.5, requirements: [], bottlenecks: [], recommendedNextActions: [] },
        developmentStage: { stage: 1, label: 'Stage 1', summary: '', nextRequirements: [] },
      } as any,
    }
    const vm = buildPostAnalyzeNextActionsViewModel({
      currentObservation: obs,
      previousObservation: null,
    })
    expect(vm.actions.some((a) => a.tabId === 'field')).toBe(true)
  })

  it('returns at most 3 actions', () => {
    const obs = {
      id: '1',
      type: 'observe' as const,
      runtimeMode: 'node' as const,
      text: 'test',
      timestamp: '2024-01-01T00:00:00Z',
      time: '00:00:00',
      pipelineResult: { meta: { bindingCount: 0, patternCount: 0, retrievalCount: 0 }, activatedNodes: [], bindings: [], liftedPatterns: [] } as any,
      studioView: {} as any,
      revisionEntry: { proposedChanges: [] } as any,
      assistantReply: 'test',
      signalOverviewSource: {
        observeSummary: {
          branch: {
            assemblyCount: 5,
            bridgeCount: 3,
            protoSeedCount: 2,
            teacherFreeBridgeCount: 1,
            averageRecallSuccess: 0.5,
            averageTeacherDependency: 0.6,
            branchId: 'test-branch',
          },
        },
        riskReport: { riskLevel: 'high', warnings: ['overbinding'], overbindingRisk: 0.8, teacherOvertrustRisk: 0.7, falseBindingRisk: 0.6, dreamNoiseRisk: 0.5, recommendedActions: [] },
        developmentDashboard: { stageProgress: 0.5, requirements: [], bottlenecks: [], recommendedNextActions: [] },
        developmentStage: { stage: 2, label: 'Stage 2', summary: '', nextRequirements: [] },
      } as any,
    }
    const vm = buildPostAnalyzeNextActionsViewModel({
      currentObservation: obs,
      previousObservation: null,
    })
    expect(vm.actions.length).toBeLessThanOrEqual(3)
  })
})
