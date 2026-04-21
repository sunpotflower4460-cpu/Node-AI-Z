import { describe, it, expect } from 'vitest'
import { buildSurfaceHighlights } from '../buildSurfaceHighlights'
import { getPresentationBiasProfile } from '../presentationBiasProfiles'
import { createSampleFacadeView } from './testUtils'

describe('buildSurfaceHighlights', () => {
  it('selects branch-focused highlights for crystallized thinking', () => {
    const view = createSampleFacadeView('crystallized_thinking')
    const profile = getPresentationBiasProfile('crystallized_thinking')

    const result = buildSurfaceHighlights(view, profile)

    expect(result.highlightKeys).toContain('branch_summary')
    expect(result.highlightKeys.some((key) => key.startsWith('mixed:'))).toBe(true)
  })

  it('surfaces promotion and guardian context for observer', () => {
    const view = createSampleFacadeView('observer')
    const profile = getPresentationBiasProfile('observer')

    const result = buildSurfaceHighlights(view, profile)

    expect(result.highlightKeys).toContain('promotion_summary')
    expect(result.highlightKeys).toContain('guardian_review')
  })

  it('keeps only light branch summary for future app', () => {
    const view = createSampleFacadeView('future_app')
    const profile = getPresentationBiasProfile('future_app')

    const result = buildSurfaceHighlights(view, profile)

    expect(result.highlightKeys).toContain('branch_micro_summary')
    expect(result.highlightKeys).not.toContain('promotion_summary')
  })
})
