import { describe, expect, it } from 'vitest'
import { buildHistoryTimelineViewModel } from '../buildHistoryTimelineViewModel'
import type { BuildHistoryTimelineInput } from '../buildHistoryTimelineViewModel'
import type { SignalModeSnapshot } from '../../../signalPersistence/signalPersistenceTypes'
import type { SignalScenarioResult } from '../../../signalScenario/signalScenarioTypes'

const mockSnapshot: SignalModeSnapshot = {
  id: 'snapshot_001',
  version: 1,
  createdAt: 1000,
  updatedAt: 2000,
  signalFieldState: null,
  signalPersonalBranch: null,
  signalLoopState: null,
  metadata: {
    mode: 'signal_mode',
    particleCount: 10,
    assemblyCount: 3,
    bridgeCount: 2,
    developmentStage: 'Stage 2',
  },
}

const mockScenarioResult: SignalScenarioResult = {
  scenarioId: 'same_object_learning',
  startedAt: 3000,
  endedAt: 4000,
  stepResults: [],
  metrics: {
    assemblyGrowth: 2,
    bridgeGrowth: 1,
    teacherDependencyDelta: -0.1,
    recallSuccessDelta: 0.15,
    overbindingRiskDelta: 0,
    promotionReadinessDelta: 0.05,
  },
  notes: [],
}

describe('buildHistoryTimelineViewModel', () => {
  it('returns empty timeline when no input', () => {
    const vm = buildHistoryTimelineViewModel({})
    expect(vm.events.length).toBe(0)
    expect(vm.hasEvents).toBe(false)
    expect(vm.snapshotHistory.length).toBe(0)
  })

  it('builds snapshot events from snapshots', () => {
    const input: BuildHistoryTimelineInput = { snapshots: [mockSnapshot] }
    const vm = buildHistoryTimelineViewModel(input)
    expect(vm.events.length).toBe(1)
    expect(vm.events[0].eventType).toBe('snapshot')
    expect(vm.hasEvents).toBe(true)
  })

  it('builds scenario events from results', () => {
    const input: BuildHistoryTimelineInput = { scenarioResults: [mockScenarioResult] }
    const vm = buildHistoryTimelineViewModel(input)
    expect(vm.events.length).toBe(1)
    expect(vm.events[0].eventType).toBe('scenario')
    expect(vm.events[0].scoreDelta).toBe(2)
  })

  it('events are sorted by timestamp descending', () => {
    const input: BuildHistoryTimelineInput = {
      snapshots: [mockSnapshot],
      scenarioResults: [mockScenarioResult],
    }
    const vm = buildHistoryTimelineViewModel(input)
    expect(vm.events.length).toBe(2)
    expect(vm.events[0].timestamp).toBeGreaterThanOrEqual(vm.events[1].timestamp)
  })

  it('builds stage change events', () => {
    const input: BuildHistoryTimelineInput = {
      stageChanges: [{ fromStage: 4, toStage: 5, timestamp: 5000, unlockedCapability: 'Contrast Learning unlocked' }],
    }
    const vm = buildHistoryTimelineViewModel(input)
    expect(vm.events[0].eventType).toBe('stage_change')
    expect(vm.events[0].description).toContain('Stage 4')
    expect(vm.events[0].description).toContain('Stage 5')
  })

  it('builds risk events', () => {
    const input: BuildHistoryTimelineInput = {
      riskEvents: [
        { level: 'high', timestamp: 6000, warning: 'overbinding detected' },
        { level: 'low', timestamp: 7000 },
      ],
    }
    const vm = buildHistoryTimelineViewModel(input)
    expect(vm.events.length).toBe(2)
    const highRisk = vm.events.find((e) => e.eventType === 'risk_detected')
    const resolved = vm.events.find((e) => e.eventType === 'risk_resolved')
    expect(highRisk).toBeDefined()
    expect(resolved).toBeDefined()
  })

  it('builds snapshot history sorted by updatedAt descending', () => {
    const snapshots: SignalModeSnapshot[] = [
      { ...mockSnapshot, id: 'snap_a', updatedAt: 1000 },
      { ...mockSnapshot, id: 'snap_b', updatedAt: 5000 },
    ]
    const vm = buildHistoryTimelineViewModel({ snapshots })
    expect(vm.snapshotHistory[0].snapshotId).toBe('snap_b')
    expect(vm.snapshotHistory[1].snapshotId).toBe('snap_a')
  })

  it('snapshot history entry includes metadata', () => {
    const vm = buildHistoryTimelineViewModel({ snapshots: [mockSnapshot] })
    const entry = vm.snapshotHistory[0]
    expect(entry.assemblyCount).toBe(3)
    expect(entry.bridgeCount).toBe(2)
    expect(entry.developmentStage).toBe('Stage 2')
  })
})
