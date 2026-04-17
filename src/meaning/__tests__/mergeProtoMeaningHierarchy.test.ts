import { describe, expect, it } from 'vitest'
import { mergeProtoMeaningHierarchy } from '../mergeProtoMeaningHierarchy'

describe('mergeProtoMeaningHierarchy', () => {
  it('returns sensory, narrative, and combined hierarchy views', () => {
    const hierarchy = mergeProtoMeaningHierarchy(
      [
        { id: 'sensory:heavy', level: 'sensory', glossJa: '重い', strength: 0.7, sourceFeatureIds: [], sourceNodeIds: [] },
      ],
      [
        { id: 'narrative:meaning_loss', level: 'narrative', glossJa: '意味を見失いかけている', strength: 0.8, sourceFeatureIds: [], sourceNodeIds: [], childIds: ['sensory:heavy'] },
      ],
    )

    expect(hierarchy.sensory).toHaveLength(1)
    expect(hierarchy.narrative).toHaveLength(1)
    expect(hierarchy.all.map((meaning) => meaning.id)).toEqual(['narrative:meaning_loss', 'sensory:heavy'])
  })
})
