import { describe, it, expect } from 'vitest'
import { updateSomaticMarkers, somaticOutcomeFromTuningAction } from '../updateSomaticMarkers'
import type { SomaticMarker, SomaticSignature, SomaticMarkerOutcome } from '../types'

const makeSignature = (narrativeIds: string[], sensoryIds: string[]): SomaticSignature => ({
  narrativeIds,
  sensoryIds,
  fieldShape: { closenessBand: 'mid', fragilityBand: 'mid', urgencyBand: 'mid', answerPressureBand: 'mid' },
})

const makeDecisionShape = (stance: SomaticMarker['decisionShape']['stance'] = 'answer'): SomaticMarker['decisionShape'] => ({
  stance,
  shouldAnswerQuestion: false,
  shouldOfferStep: false,
  shouldStayOpen: false,
})

const neutralOutcome: SomaticMarkerOutcome = { naturalness: 0, safety: 0, helpfulness: 0, openness: 0 }
const positiveOutcome: SomaticMarkerOutcome = { naturalness: 0.5, safety: 0.5, helpfulness: 0.5, openness: 0.5 }

describe('updateSomaticMarkers', () => {
  it('creates a new marker when none exist', () => {
    const result = updateSomaticMarkers([], makeSignature(['n1'], ['s1']), makeDecisionShape(), neutralOutcome, 1000)
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(1)
    expect(result[0].id).toMatch(/^somatic_/)
  })

  it('increments count for matching marker', () => {
    const existing: SomaticMarker = {
      id: 'test_marker',
      signature: makeSignature(['n1'], ['s1']),
      decisionShape: makeDecisionShape('answer'),
      outcome: neutralOutcome,
      count: 2,
      updatedAt: 0,
    }
    const result = updateSomaticMarkers(
      [existing],
      makeSignature(['n1', 'n2'], ['s1']),
      makeDecisionShape('answer'),
      positiveOutcome,
      2000,
    )
    expect(result).toHaveLength(1)
    expect(result[0].count).toBe(3)
    expect(result[0].updatedAt).toBe(2000)
  })

  it('does moving average of outcome', () => {
    const existing: SomaticMarker = {
      id: 'test_marker',
      signature: makeSignature(['n1'], ['s1']),
      decisionShape: makeDecisionShape('answer'),
      outcome: { naturalness: 1.0, safety: 0, helpfulness: 0, openness: 0 },
      count: 1,
      updatedAt: 0,
    }
    const result = updateSomaticMarkers(
      [existing],
      makeSignature(['n1'], ['s1']),
      makeDecisionShape('answer'),
      { naturalness: 0.0, safety: 0, helpfulness: 0, openness: 0 },
      1000,
    )
    // moving average: (1.0*1 + 0.0) / 2 = 0.5
    expect(result[0].outcome.naturalness).toBeCloseTo(0.5)
  })

  it('does NOT match when stance differs', () => {
    const existing: SomaticMarker = {
      id: 'test_marker',
      signature: makeSignature(['n1'], ['s1']),
      decisionShape: makeDecisionShape('hold'),
      outcome: neutralOutcome,
      count: 1,
      updatedAt: 0,
    }
    const result = updateSomaticMarkers(
      [existing],
      makeSignature(['n1'], ['s1']),
      makeDecisionShape('answer'),
      neutralOutcome,
      1000,
    )
    expect(result).toHaveLength(2)
  })

  it('does NOT match when no narrative overlap', () => {
    const existing: SomaticMarker = {
      id: 'test_marker',
      signature: makeSignature(['n1'], ['s1']),
      decisionShape: makeDecisionShape('answer'),
      outcome: neutralOutcome,
      count: 1,
      updatedAt: 0,
    }
    const result = updateSomaticMarkers(
      [existing],
      makeSignature(['n9'], ['s1']),
      makeDecisionShape('answer'),
      neutralOutcome,
      1000,
    )
    expect(result).toHaveLength(2)
  })
})

describe('somaticOutcomeFromTuningAction', () => {
  it('returns correct outcome for keep', () => {
    const outcome = somaticOutcomeFromTuningAction('keep')
    expect(outcome.naturalness).toBe(0.3)
    expect(outcome.helpfulness).toBe(0.3)
  })

  it('returns correct outcome for revert', () => {
    const outcome = somaticOutcomeFromTuningAction('revert')
    expect(outcome.naturalness).toBe(-0.4)
    expect(outcome.safety).toBe(-0.2)
  })
})
