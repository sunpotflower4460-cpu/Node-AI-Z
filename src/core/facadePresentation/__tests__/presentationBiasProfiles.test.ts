import { describe, it, expect } from 'vitest'
import { getPresentationBiasProfile, listPresentationBiasProfiles } from '../presentationBiasProfiles'

describe('presentationBiasProfiles', () => {
  it('returns crystallized thinking profile', () => {
    const profile = getPresentationBiasProfile('crystallized_thinking')

    expect(profile.mode).toBe('crystallized_thinking')
    expect(profile.emphasis.branch).toBeCloseTo(1.0)
    expect(profile.ordering).toBe('branch_first')
    expect(profile.summaryStyle).toBe('thinking')
    expect(profile.highlightTopN).toBe(6)
  })

  it('returns observer profile', () => {
    const profile = getPresentationBiasProfile('observer')

    expect(profile.mode).toBe('observer')
    expect(profile.metadataDensity).toBe('rich')
    expect(profile.ordering).toBe('review_first')
    expect(profile.explanationDepth).toBe('deep')
  })

  it('returns future app profile', () => {
    const profile = getPresentationBiasProfile('future_app')

    expect(profile.mode).toBe('future_app')
    expect(profile.explanationDepth).toBe('minimal')
    expect(profile.metadataDensity).toBe('minimal')
    expect(profile.emphasis.promotion).toBe(0)
  })

  it('lists all profiles', () => {
    const profiles = listPresentationBiasProfiles()
    const modes = profiles.map((p) => p.mode)
    expect(modes).toContain('crystallized_thinking')
    expect(modes).toContain('observer')
    expect(modes).toContain('future_app')
  })
})
