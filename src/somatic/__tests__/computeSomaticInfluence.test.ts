import { describe, it, expect } from 'vitest'
import { computeSomaticInfluence } from '../computeSomaticInfluence'
import type { SomaticMarker } from '../types'

const makeMarker = (id: string, outcome: SomaticMarker['outcome'], count: number): SomaticMarker => ({
  id,
  signature: {
    sensoryIds: [],
    narrativeIds: [],
    fieldShape: { closenessBand: 'mid', fragilityBand: 'mid', urgencyBand: 'mid', answerPressureBand: 'mid' },
  },
  decisionShape: { stance: 'answer', shouldAnswerQuestion: false, shouldOfferStep: false, shouldStayOpen: false },
  outcome,
  count,
  updatedAt: Date.now(),
})

describe('computeSomaticInfluence', () => {
  it('returns empty influence when no markers', () => {
    const result = computeSomaticInfluence([])
    expect(result.influenceStrength).toBe(0)
    expect(result.matchedMarkerIds).toHaveLength(0)
    expect(result.debugNotes).toContain('No relevant somatic markers found')
    expect(result.averageOutcome.naturalness).toBe(0)
  })

  it('computes weighted average outcome', () => {
    const markers = [
      makeMarker('m1', { naturalness: 1.0, safety: 0.0, helpfulness: 0.0, openness: 0.0 }, 1),
      makeMarker('m2', { naturalness: 0.0, safety: 0.0, helpfulness: 0.0, openness: 0.0 }, 1),
    ]
    const result = computeSomaticInfluence(markers)
    expect(result.averageOutcome.naturalness).toBeCloseTo(0.5)
  })

  it('weights by count correctly', () => {
    const markers = [
      makeMarker('m1', { naturalness: 1.0, safety: 0.0, helpfulness: 0.0, openness: 0.0 }, 3),
      makeMarker('m2', { naturalness: 0.0, safety: 0.0, helpfulness: 0.0, openness: 0.0 }, 1),
    ]
    const result = computeSomaticInfluence(markers)
    // weighted: (1.0*3 + 0.0*1) / 4 = 0.75
    expect(result.averageOutcome.naturalness).toBeCloseTo(0.75)
  })

  it('clamps influenceStrength to [0, 1]', () => {
    const markers = Array.from({ length: 10 }, (_, i) =>
      makeMarker(`m${i}`, { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 }, 10),
    )
    const result = computeSomaticInfluence(markers)
    expect(result.influenceStrength).toBeLessThanOrEqual(1.0)
    expect(result.influenceStrength).toBeGreaterThanOrEqual(0.0)
  })

  it('includes marker ids in matchedMarkerIds', () => {
    const markers = [
      makeMarker('alpha', { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 }, 1),
    ]
    const result = computeSomaticInfluence(markers)
    expect(result.matchedMarkerIds).toContain('alpha')
  })
})
