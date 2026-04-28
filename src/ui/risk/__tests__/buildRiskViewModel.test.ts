import { describe, expect, it } from 'vitest'
import { buildRiskViewModel, buildEmptyRiskViewModel } from '../buildRiskViewModel'
import type { SignalRiskReport } from '../../../signalRisk/signalRiskTypes'

const mockHighRiskReport: SignalRiskReport = {
  overbindingRisk: 0.72,
  falseBindingRisk: 0.45,
  teacherOvertrustRisk: 0.68,
  dreamNoiseRisk: 0.3,
  riskLevel: 'high',
  warnings: [
    'teacher dependency が高い bridge が promoted に近づいています',
    'similar_but_different 候補が same_object に寄りすぎています',
  ],
  recommendedActions: [
    'contrast test を増やす',
    'teacher-free recall を増やす',
  ],
}

const mockLowRiskReport: SignalRiskReport = {
  overbindingRisk: 0.1,
  falseBindingRisk: 0.05,
  teacherOvertrustRisk: 0.12,
  dreamNoiseRisk: 0.08,
  riskLevel: 'low',
  warnings: [],
  recommendedActions: [],
}

describe('buildRiskViewModel', () => {
  it('builds risk view model with correct overall level', () => {
    const vm = buildRiskViewModel(mockHighRiskReport)
    expect(vm.overallLevel).toBe('high')
  })

  it('builds 4 risk breakdown cards', () => {
    const vm = buildRiskViewModel(mockHighRiskReport)
    expect(vm.cards.length).toBe(4)
    const labels = vm.cards.map((c) => c.label)
    expect(labels).toContain('Overbinding')
    expect(labels).toContain('False Binding')
    expect(labels).toContain('Teacher Overtrust')
    expect(labels).toContain('Dream Noise')
  })

  it('cards have level assigned correctly', () => {
    const vm = buildRiskViewModel(mockHighRiskReport)
    const overbinding = vm.cards.find((c) => c.label === 'Overbinding')
    expect(overbinding?.level).toBe('high')
    const dream = vm.cards.find((c) => c.label === 'Dream Noise')
    expect(dream?.level).toBe('low')
  })

  it('warnings and recommended actions are passed through', () => {
    const vm = buildRiskViewModel(mockHighRiskReport)
    expect(vm.warnings.length).toBe(2)
    expect(vm.recommendedActions.length).toBe(2)
  })

  it('builds summary text for high risk', () => {
    const vm = buildRiskViewModel(mockHighRiskReport)
    expect(typeof vm.summaryText).toBe('string')
    expect(vm.summaryText.length).toBeGreaterThan(0)
  })

  it('builds empty risk view model with low level', () => {
    const vm = buildEmptyRiskViewModel()
    expect(vm.overallLevel).toBe('low')
    expect(vm.warnings.length).toBe(0)
    expect(vm.recommendedActions.length).toBe(0)
  })

  it('low risk has calm summary', () => {
    const vm = buildRiskViewModel(mockLowRiskReport)
    expect(vm.overallLevel).toBe('low')
    expect(typeof vm.summaryText).toBe('string')
  })
})
