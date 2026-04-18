import { describe, it, expect } from 'vitest'
import { deriveSomaticSignature } from '../deriveSomaticSignature'
import type { ProtoMeaning } from '../../meaning/types'
import type { StateVector } from '../../types/nodeStudio'

const makeField = (overrides: Partial<StateVector> = {}): StateVector => ({
  fragility: 0.5,
  urgency: 0.5,
  depth: 0.5,
  care: 0.5,
  agency: 0.5,
  ambiguity: 0.5,
  change: 0.5,
  stability: 0.5,
  self: 0.5,
  relation: 0.5,
  light: 0.5,
  heaviness: 0.5,
  ...overrides,
})

const makeProtoMeaning = (id: string, strength: number): ProtoMeaning => ({
  id,
  level: 'sensory',
  glossJa: id,
  strength,
  sourceCueIds: [],
  sourceNodeIds: [],
})

describe('deriveSomaticSignature', () => {
  it('returns top sensory ids by strength (max 4)', () => {
    const sensory: ProtoMeaning[] = [
      makeProtoMeaning('s1', 0.9),
      makeProtoMeaning('s2', 0.7),
      makeProtoMeaning('s3', 0.5),
      makeProtoMeaning('s4', 0.3),
      makeProtoMeaning('s5', 0.1),
    ]
    const result = deriveSomaticSignature(sensory, [], makeField())
    expect(result.sensoryIds).toEqual(['s1', 's2', 's3', 's4'])
  })

  it('returns top narrative ids by strength (max 3)', () => {
    const narrative: ProtoMeaning[] = [
      makeProtoMeaning('n1', 0.8),
      makeProtoMeaning('n2', 0.6),
      makeProtoMeaning('n3', 0.4),
      makeProtoMeaning('n4', 0.2),
    ]
    const result = deriveSomaticSignature([], narrative, makeField())
    expect(result.narrativeIds).toEqual(['n1', 'n2', 'n3'])
  })

  it('correctly band-izes field values', () => {
    const result = deriveSomaticSignature([], [], makeField({
      relation: 0.1,   // low
      fragility: 0.5,  // mid
      urgency: 0.8,    // high
      ambiguity: 0.33, // low
    }))
    expect(result.fieldShape.closenessBand).toBe('low')
    expect(result.fieldShape.fragilityBand).toBe('mid')
    expect(result.fieldShape.urgencyBand).toBe('high')
    expect(result.fieldShape.answerPressureBand).toBe('low')
  })

  it('handles empty inputs gracefully', () => {
    const result = deriveSomaticSignature([], [], makeField())
    expect(result.sensoryIds).toEqual([])
    expect(result.narrativeIds).toEqual([])
  })
})
