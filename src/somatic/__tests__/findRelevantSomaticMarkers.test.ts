import { describe, it, expect } from 'vitest'
import { findRelevantSomaticMarkers } from '../findRelevantSomaticMarkers'
import type { SomaticSignature, SomaticMarker } from '../types'

const makeSignature = (
  narrativeIds: string[],
  sensoryIds: string[],
  bands: Partial<SomaticSignature['fieldShape']> = {},
): SomaticSignature => ({
  narrativeIds,
  sensoryIds,
  fieldShape: {
    closenessBand: 'mid',
    fragilityBand: 'low',
    urgencyBand: 'mid',
    answerPressureBand: 'mid',
    ...bands,
  },
})

const makeMarker = (
  id: string,
  narrativeIds: string[],
  sensoryIds: string[],
  count = 1,
  bands: Partial<SomaticSignature['fieldShape']> = {},
): SomaticMarker => ({
  id,
  signature: makeSignature(narrativeIds, sensoryIds, bands),
  decisionShape: { stance: 'answer', shouldAnswerQuestion: false, shouldOfferStep: false, shouldStayOpen: false },
  outcome: { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 },
  count,
  updatedAt: Date.now(),
})

describe('findRelevantSomaticMarkers', () => {
  it('returns markers with score > 0, sorted descending', () => {
    const current = makeSignature(['n1', 'n2'], ['s1'])
    const markers = [
      makeMarker('m1', ['n1'], ['s1']),         // score: 2+1+band bonus
      makeMarker('m2', ['n3'], ['s3']),          // score: 0 (no overlap)
      makeMarker('m3', ['n2'], []),              // score: 2
    ]
    const result = findRelevantSomaticMarkers(current, markers)
    expect(result.map((m) => m.id)).toContain('m1')
    expect(result.map((m) => m.id)).toContain('m3')
    expect(result.map((m) => m.id)).not.toContain('m2')
    // m1 should rank higher than m3 due to sensory overlap
    expect(result[0].id).toBe('m1')
  })

  it('returns max 5 markers', () => {
    const current = makeSignature(['n1'], ['s1'])
    const markers = Array.from({ length: 8 }, (_, i) =>
      makeMarker(`m${i}`, ['n1'], ['s1']),
    )
    const result = findRelevantSomaticMarkers(current, markers)
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('adds count bonus correctly', () => {
    const current = makeSignature(['n1'], [])
    const lowCount = makeMarker('low', ['n1'], [], 1)
    const highCount = makeMarker('high', ['n1'], [], 10)
    const result = findRelevantSomaticMarkers(current, [lowCount, highCount])
    expect(result[0].id).toBe('high')
  })

  it('returns empty when no overlap', () => {
    const current = makeSignature(['n1'], ['s1'])
    const markers = [makeMarker('m1', ['n9'], ['s9'])]
    const result = findRelevantSomaticMarkers(current, markers)
    expect(result).toHaveLength(0)
  })
})
