import { describe, expect, it } from 'vitest'
import { buildCompactMetricsViewModel } from '../buildCompactMetricsViewModel'

describe('buildCompactMetricsViewModel', () => {
  const base = {
    assemblyCount: 0,
    bridgeCount: 0,
    protoSeedCount: 0,
    recallSuccessRate: 0,
    averageTeacherDependency: 0,
  }

  it('returns 5 metrics', () => {
    const metrics = buildCompactMetricsViewModel(base)
    expect(metrics).toHaveLength(5)
  })

  it('marks all zero values as empty status', () => {
    const metrics = buildCompactMetricsViewModel(base)
    expect(metrics.every((m) => m.status === 'empty')).toBe(true)
  })

  it('marks non-zero assembly count as good', () => {
    const metrics = buildCompactMetricsViewModel({ ...base, assemblyCount: 3 })
    const assembly = metrics.find((m) => m.id === 'assemblies')
    expect(assembly?.status).toBe('good')
    expect(assembly?.value).toBe(3)
  })

  it('formats recall success rate as percentage', () => {
    const metrics = buildCompactMetricsViewModel({ ...base, recallSuccessRate: 0.75 })
    const recall = metrics.find((m) => m.id === 'recall')
    expect(recall?.value).toBe('75%')
    expect(recall?.status).toBe('good')
  })

  it('marks high teacher dependency as warning', () => {
    const metrics = buildCompactMetricsViewModel({ ...base, averageTeacherDependency: 0.8 })
    const dep = metrics.find((m) => m.id === 'teacher-dep')
    expect(dep?.status).toBe('warning')
  })

  it('includes Japanese label for assemblies', () => {
    const metrics = buildCompactMetricsViewModel(base)
    const assembly = metrics.find((m) => m.id === 'assemblies')
    expect(assembly?.label).toBe('成長した点群')
    expect(assembly?.researchLabel).toBe('Assemblies')
  })
})
