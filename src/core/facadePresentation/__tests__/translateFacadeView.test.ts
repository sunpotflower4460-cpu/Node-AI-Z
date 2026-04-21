import { describe, it, expect } from 'vitest'
import { translateFacadeView } from '../translateFacadeView'
import { getPresentationBiasProfile } from '../presentationBiasProfiles'
import { createSampleFacadeView } from './testUtils'

describe('translateFacadeView', () => {
  it('returns translated view with presentation metadata', () => {
    const rawView = createSampleFacadeView('crystallized_thinking')
    const profile = getPresentationBiasProfile('crystallized_thinking')

    const result = translateFacadeView({
      mode: 'crystallized_thinking',
      rawFacadeView: rawView,
      profile,
    })

    expect(result.translatedFacadeView.surfacePresentation).toBeDefined()
    expect(result.translatedFacadeView.surfacePresentation?.summaryStyle).toBe('thinking')
    expect(result.highlightKeys.length).toBeGreaterThan(0)
    expect(result.orderingNotes.length).toBeGreaterThan(0)
  })

  it('keeps raw data but adjusts ordering', () => {
    const rawView = createSampleFacadeView('observer')
    const profile = getPresentationBiasProfile('observer')

    const result = translateFacadeView({
      mode: 'observer',
      rawFacadeView: rawView,
      profile,
    })

    const translated = result.translatedFacadeView
    expect(translated.visibleSchemas[0].origin === 'personal_branch' || translated.visibleSchemas[0].origin === 'shared_trunk').toBe(true)
    expect(translated.viewMetadata.notes.length).toBeGreaterThan(rawView.viewMetadata.notes.length)
  })
})
