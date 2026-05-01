import { describe, expect, it } from 'vitest'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MetricDensityController } from '../MetricDensityController'
import type { UiDensityViewModel } from '../buildUiDensityViewModel'

const makeVM = (overrides: Partial<UiDensityViewModel> = {}): UiDensityViewModel => ({
  hasObservation: false,
  hasGrowthData: false,
  detailMode: 'simple',
  shouldShowHeroCards: true,
  shouldShowCompactMetrics: false,
  shouldCollapseDetails: true,
  shouldShowRawMetrics: false,
  ...overrides,
})

describe('MetricDensityController', () => {
  it('shows empty slot before first Analyze', () => {
    const html = renderToString(
      createElement(MetricDensityController, {
        density: makeVM({ hasObservation: false }),
        emptySlot: createElement('div', null, 'EmptyState'),
      })
    )
    expect(html).toContain('EmptyState')
  })

  it('shows postAnalyze slot after Analyze but before growth', () => {
    const html = renderToString(
      createElement(MetricDensityController, {
        density: makeVM({ hasObservation: true, hasGrowthData: false }),
        emptySlot: createElement('div', null, 'EmptyState'),
        postAnalyzeSlot: createElement('div', null, 'PostAnalyze'),
      })
    )
    expect(html).toContain('PostAnalyze')
    expect(html).not.toContain('EmptyState')
  })

  it('shows compact metrics when growth data exists', () => {
    const html = renderToString(
      createElement(MetricDensityController, {
        density: makeVM({
          hasObservation: true,
          hasGrowthData: true,
          shouldShowCompactMetrics: true,
          shouldShowRawMetrics: false,
        }),
        emptySlot: createElement('div', null, 'EmptyState'),
        compactMetricsSlot: createElement('div', null, 'CompactMetrics'),
      })
    )
    expect(html).toContain('CompactMetrics')
  })

  it('shows research slot in research view', () => {
    const html = renderToString(
      createElement(MetricDensityController, {
        density: makeVM({
          hasObservation: true,
          hasGrowthData: true,
          shouldShowCompactMetrics: true,
          shouldShowRawMetrics: true,
        }),
        emptySlot: createElement('div', null, 'EmptyState'),
        compactMetricsSlot: createElement('div', null, 'CompactMetrics'),
        researchSlot: createElement('div', null, 'ResearchDetails'),
      })
    )
    expect(html).toContain('ResearchDetails')
  })
})
