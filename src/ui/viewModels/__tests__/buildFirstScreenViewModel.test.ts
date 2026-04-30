import { describe, expect, it } from 'vitest'
import { buildFirstScreenViewModel } from '../buildFirstScreenViewModel'

describe('buildFirstScreenViewModel', () => {
  const baseInput = {
    screenMode: 'observe' as const,
    engine: 'signal_mode' as const,
    stageLabel: 'Stage 1 — Ignition',
    riskLevel: 'low' as const,
    hasSnapshot: false,
    assemblyCount: 0,
    bridgeCount: 0,
    protoSeedCount: 0,
    hasObservation: false,
  }

  it('sets shouldShowEmptyState=true when no observation and all counts are 0', () => {
    const vm = buildFirstScreenViewModel(baseInput)
    expect(vm.shouldShowEmptyState).toBe(true)
    expect(vm.shouldShowCompactMetrics).toBe(false)
  })

  it('sets shouldShowEmptyState=false when hasObservation=true with data', () => {
    const vm = buildFirstScreenViewModel({
      ...baseInput,
      assemblyCount: 3,
      bridgeCount: 2,
      protoSeedCount: 1,
      hasObservation: true,
    })
    expect(vm.shouldShowEmptyState).toBe(false)
    expect(vm.shouldShowCompactMetrics).toBe(true)
  })

  it('maps risk level to capitalised label', () => {
    expect(buildFirstScreenViewModel(baseInput).riskLabel).toBe('Low')
    expect(buildFirstScreenViewModel({ ...baseInput, riskLevel: 'high' }).riskLabel).toBe('High')
  })

  it('sets snapshotLabel correctly', () => {
    expect(buildFirstScreenViewModel(baseInput).snapshotLabel).toBe('保存なし')
    expect(buildFirstScreenViewModel({ ...baseInput, hasSnapshot: true }).snapshotLabel).toBe('保存あり')
  })

  it('returns engineLabel from ENGINE_LABEL_MAP', () => {
    const vm = buildFirstScreenViewModel(baseInput)
    expect(vm.engineLabel).toBe('New Signal')
  })

  it('Simple View label shows Japanese', () => {
    const vm = buildFirstScreenViewModel(baseInput)
    expect(vm.snapshotLabel).toBe('保存なし')
  })
})
