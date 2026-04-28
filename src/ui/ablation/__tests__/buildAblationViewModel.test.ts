import { describe, expect, it } from 'vitest'
import { buildAblationConfigViewModel, buildAblationComparisonViewModel } from '../buildAblationViewModel'
import type { SignalAblationConfig, SignalAblationComparison } from '../../../signalAblation/signalAblationTypes'
import { createDefaultAblationConfig } from '../../../signalAblation/createDefaultAblationConfig'

const mockConfig: SignalAblationConfig = createDefaultAblationConfig()

const mockComparison: SignalAblationComparison = {
  baselineRunId: 'run_baseline',
  ablatedRunId: 'run_ablated',
  disabledFeatures: ['inhibition'],
  metricDiff: {
    assemblyGrowthDiff: 1,
    bridgeGrowthDiff: 8,
    recallSuccessDiff: 0.02,
    teacherDependencyDiff: 0.05,
    overbindingRiskDiff: 0.31,
    promotionReadinessDiff: -0.04,
  },
  notes: ['bridge は増えたが、過結合が大きく上昇した'],
}

describe('buildAblationViewModel', () => {
  it('builds config view model with all feature entries', () => {
    const vm = buildAblationConfigViewModel(mockConfig)
    expect(vm.features.length).toBe(8)
    for (const feature of vm.features) {
      expect(typeof feature.label).toBe('string')
      expect(typeof feature.description).toBe('string')
      expect(typeof feature.enabled).toBe('boolean')
    }
  })

  it('all features enabled in default config', () => {
    const vm = buildAblationConfigViewModel(mockConfig)
    for (const feature of vm.features) {
      expect(feature.enabled).toBe(true)
    }
  })

  it('builds comparison view model with metric diffs', () => {
    const vm = buildAblationComparisonViewModel(mockComparison)
    expect(vm.disabledFeatures).toContain('inhibition')
    expect(vm.overbindingRiskDiff).toBe(0.31)
    expect(vm.bridgeGrowthDiff).toBe(8)
    expect(vm.metricDiffs.length).toBe(6)
  })

  it('comparison view model has interpretation text', () => {
    const vm = buildAblationComparisonViewModel(mockComparison)
    expect(typeof vm.interpretation).toBe('string')
    expect(vm.interpretation.length).toBeGreaterThan(0)
  })

  it('metric diffs have goodDirection fields', () => {
    const vm = buildAblationComparisonViewModel(mockComparison)
    for (const diff of vm.metricDiffs) {
      expect(['up', 'down']).toContain(diff.goodDirection)
    }
  })
})
