import { describe, it, expect } from 'vitest'
import { buildSurfaceOrdering } from '../buildSurfaceOrdering'
import { getPresentationBiasProfile } from '../presentationBiasProfiles'
import { createSampleFacadeView } from './testUtils'

describe('buildSurfaceOrdering', () => {
  it('prefers branch first for crystallized thinking', () => {
    const ordering = buildSurfaceOrdering(
      createSampleFacadeView('crystallized_thinking'),
      getPresentationBiasProfile('crystallized_thinking')
    )

    expect(ordering.sectionOrder[0]).toBe('branch')
  })

  it('places review first for observer', () => {
    const ordering = buildSurfaceOrdering(
      createSampleFacadeView('observer'),
      getPresentationBiasProfile('observer')
    )

    expect(ordering.sectionOrder.slice(0, 2)).toEqual(['promotion', 'guardian'])
  })

  it('keeps branch first for future app stub', () => {
    const ordering = buildSurfaceOrdering(
      createSampleFacadeView('future_app'),
      getPresentationBiasProfile('future_app')
    )

    expect(ordering.sectionOrder[0]).toBe('branch')
  })
})
