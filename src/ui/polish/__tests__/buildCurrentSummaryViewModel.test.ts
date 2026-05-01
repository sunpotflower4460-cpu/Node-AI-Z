import { describe, expect, it } from 'vitest'
import { buildCurrentSummaryViewModel } from '../buildCurrentSummaryViewModel'

const BASE = {
  engineLabel: '新しい信号モード',
  stageLabel: 'Stage 1',
  riskLevel: 'low' as const,
  assemblyCount: 0,
  bridgeCount: 0,
  protoSeedCount: 0,
  hasObservation: false,
  detailMode: 'simple' as const,
}

describe('buildCurrentSummaryViewModel', () => {
  it('returns Analyze instruction when no observation', () => {
    const vm = buildCurrentSummaryViewModel(BASE)
    expect(vm.nextAction).toContain('Analyze')
  })

  it('returns growth summary string', () => {
    const vm = buildCurrentSummaryViewModel(BASE)
    expect(vm.growthSummary).toContain('点群 0')
    expect(vm.growthSummary).toContain('結びつき 0')
    expect(vm.growthSummary).toContain('意味の種 0')
  })

  it('returns low risk label in Japanese', () => {
    const vm = buildCurrentSummaryViewModel(BASE)
    expect(vm.riskLabel).toBe('落ち着いています')
  })

  it('returns growth data instruction when has observation but no growth', () => {
    const vm = buildCurrentSummaryViewModel({ ...BASE, hasObservation: true })
    expect(vm.nextAction).toContain('Analyze')
  })

  it('returns growth-specific instruction when has growth data', () => {
    const vm = buildCurrentSummaryViewModel({
      ...BASE,
      hasObservation: true,
      assemblyCount: 3,
    })
    expect(vm.nextAction).toContain('発火・成長タブ')
  })

  it('includes details in research mode', () => {
    const vm = buildCurrentSummaryViewModel({ ...BASE, detailMode: 'research' })
    expect(vm.details).toBeDefined()
    expect(vm.details?.length).toBeGreaterThan(0)
  })

  it('excludes details in simple mode', () => {
    const vm = buildCurrentSummaryViewModel(BASE)
    expect(vm.details).toBeUndefined()
  })
})
