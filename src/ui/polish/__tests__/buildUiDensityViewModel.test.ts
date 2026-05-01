import { describe, expect, it } from 'vitest'
import { buildUiDensityViewModel } from '../buildUiDensityViewModel'

describe('buildUiDensityViewModel', () => {
  it('returns false for all data flags when no observation', () => {
    const vm = buildUiDensityViewModel({
      hasObservation: false,
      assemblyCount: 0,
      bridgeCount: 0,
      protoSeedCount: 0,
      detailMode: 'simple',
    })
    expect(vm.hasObservation).toBe(false)
    expect(vm.hasGrowthData).toBe(false)
    expect(vm.shouldShowCompactMetrics).toBe(false)
  })

  it('shows compact metrics when observation and growth data exist', () => {
    const vm = buildUiDensityViewModel({
      hasObservation: true,
      assemblyCount: 3,
      bridgeCount: 1,
      protoSeedCount: 0,
      detailMode: 'simple',
    })
    expect(vm.hasGrowthData).toBe(true)
    expect(vm.shouldShowCompactMetrics).toBe(true)
  })

  it('does not show raw metrics in simple mode', () => {
    const vm = buildUiDensityViewModel({
      hasObservation: true,
      assemblyCount: 5,
      bridgeCount: 2,
      protoSeedCount: 1,
      detailMode: 'simple',
    })
    expect(vm.shouldShowRawMetrics).toBe(false)
    expect(vm.shouldCollapseDetails).toBe(true)
  })

  it('shows raw metrics in research mode', () => {
    const vm = buildUiDensityViewModel({
      hasObservation: true,
      assemblyCount: 5,
      bridgeCount: 2,
      protoSeedCount: 1,
      detailMode: 'research',
    })
    expect(vm.shouldShowRawMetrics).toBe(true)
    expect(vm.shouldCollapseDetails).toBe(false)
  })
})
