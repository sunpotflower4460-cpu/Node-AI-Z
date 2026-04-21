import { describe, it, expect } from 'vitest'
import { buildSurfaceSummary } from '../buildSurfaceSummary'
import { getPresentationBiasProfile } from '../presentationBiasProfiles'
import { createSampleFacadeView } from './testUtils'

describe('buildSurfaceSummary', () => {
  it('creates thinking style summary', () => {
    const result = buildSurfaceSummary(
      createSampleFacadeView('crystallized_thinking'),
      ['branch_summary'],
      getPresentationBiasProfile('crystallized_thinking')
    )

    expect(result.summary).toContain('Branch-forward')
    expect(result.summaryNotes.some((note) => note.includes('thinking'))).toBe(true)
  })

  it('creates observe style summary', () => {
    const result = buildSurfaceSummary(
      createSampleFacadeView('observer'),
      ['promotion_summary'],
      getPresentationBiasProfile('observer')
    )

    expect(result.summary).toContain('Observation snapshot')
    expect(result.summaryNotes).toContain('Summary style: observe')
  })

  it('creates plain summary for future app', () => {
    const result = buildSurfaceSummary(
      createSampleFacadeView('future_app'),
      [],
      getPresentationBiasProfile('future_app')
    )

    expect(result.summary).toContain('branch')
    expect(result.summaryNotes).toContain('Summary style: plain')
  })
})
