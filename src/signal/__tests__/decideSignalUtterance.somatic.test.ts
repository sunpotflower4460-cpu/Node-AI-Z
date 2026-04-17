import { describe, it, expect } from 'vitest'
import { decideSignalUtterance } from '../decideSignalUtterance'
import type { SomaticInfluence } from '../../somatic/types'

const emptySomaticInfluence: SomaticInfluence = {
  matchedMarkerIds: [],
  averageOutcome: { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 },
  influenceStrength: 0,
  debugNotes: [],
}

describe('decideSignalUtterance with somatic influence', () => {
  it('returns without somatic fields when no influence provided', () => {
    const result = decideSignalUtterance([], 0.3, 0.3)
    expect(result.somaticInfluence).toBeUndefined()
  })

  it('attaches somaticInfluence to result when provided', () => {
    const influence: SomaticInfluence = {
      matchedMarkerIds: ['m1'],
      averageOutcome: { naturalness: 0.3, safety: 0.2, helpfulness: 0.4, openness: 0.1 },
      influenceStrength: 0.5,
      debugNotes: [],
    }
    const result = decideSignalUtterance([], 0.3, 0.3, influence)
    expect(result.somaticInfluence).toBeDefined()
    expect(result.somaticInfluence?.matchedMarkerIds).toContain('m1')
  })

  it('shifts boundary to receptive when naturalness < -0.2 and strength > 0.5', () => {
    // Need to produce a boundary decision first
    // Use high boundary tension and closed sensory to force boundary mode
    const protoMeanings = [
      {
        id: 'sensory:閉じている',
        level: 'sensory' as const,
        glossJa: '閉じている',
        strength: 0.9,
        sourceFeatureIds: [],
        sourceNodeIds: [],
      },
      {
        id: 'narrative:まだ押さない方がよい',
        level: 'narrative' as const,
        glossJa: 'まだ押さない方がよい',
        strength: 0.9,
        sourceFeatureIds: [],
        sourceNodeIds: [],
        childIds: ['sensory:閉じている'],
      },
    ]
    const influence: SomaticInfluence = {
      matchedMarkerIds: ['m1'],
      averageOutcome: { naturalness: -0.5, safety: 0, helpfulness: 0, openness: 0 },
      influenceStrength: 0.8,
      debugNotes: [],
    }
    const result = decideSignalUtterance(protoMeanings, 0.8, 0.3, influence)
    expect(result.utteranceMode).toBe('receptive')
  })

  it('enables shouldOfferStep when openness > 0.3 and strength > 0.4', () => {
    const influence: SomaticInfluence = {
      matchedMarkerIds: ['m1'],
      averageOutcome: { naturalness: 0, safety: 0, helpfulness: 0, openness: 0.5 },
      influenceStrength: 0.6,
      debugNotes: [],
    }
    const result = decideSignalUtterance([], 0.3, 0.3, influence)
    expect(result.shouldOfferStep).toBe(true)
  })

  it('reduces withheldBias when helpfulness > 0.3', () => {
    const influence: SomaticInfluence = {
      matchedMarkerIds: [],
      averageOutcome: { naturalness: 0, safety: 0, helpfulness: 0.5, openness: 0 },
      influenceStrength: 0.5,
      debugNotes: [],
    }
    const baseResult = decideSignalUtterance([], 0.3, 0.3)
    const somaticResult = decideSignalUtterance([], 0.3, 0.3, influence)
    expect((somaticResult.withheldBias ?? 0)).toBeLessThan((baseResult.withheldBias ?? 1))
  })

  it('does nothing when influenceStrength is 0', () => {
    const base = decideSignalUtterance([], 0.3, 0.3)
    const withInfluence = decideSignalUtterance([], 0.3, 0.3, emptySomaticInfluence)
    expect(withInfluence.utteranceMode).toBe(base.utteranceMode)
    expect(withInfluence.withheldBias).toBe(base.withheldBias)
  })
})
