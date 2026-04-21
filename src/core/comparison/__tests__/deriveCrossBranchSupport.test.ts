import { describe, expect, it } from 'vitest'
import type { PromotionCandidate } from '../../coreTypes'
import { deriveCrossBranchSupport } from '../deriveCrossBranchSupport'

describe('deriveCrossBranchSupport', () => {
  it('aggregates support count, compared branches, score, and notes', () => {
    const candidate: PromotionCandidate = {
      id: 'candidate-1',
      type: 'mixed_node',
      sourceData: {
        id: 'node-1',
        key: 'bridge-between-states',
        label: 'Bridge',
        axes: ['affect', 'relation'],
        salience: 0.82,
        coherence: 0.8,
        novelty: 0.2,
        sessionLocal: false,
        sourceRefs: [],
        tags: ['bridge', 'steady'],
        generatedAtTurn: 7,
      },
      score: 0.84,
      reasons: ['stable'],
      firstIdentifiedAt: 1,
      reinforcementCount: 4,
      approved: false,
      rejected: false,
    }

    const support = deriveCrossBranchSupport(candidate, [
      {
        branchId: 'branch-a',
        candidateKey: 'bridge-between-states',
        matchedKeys: ['bridge-between-states', 'tag:bridge'],
        similarityScore: 0.72,
        reasons: ['exact mixed pattern key match', 'mixed pattern overlap (1)'],
      },
    ], 2)

    expect(support.supportCount).toBe(1)
    expect(support.comparedBranchCount).toBe(2)
    expect(support.consistencyScore).toBeGreaterThan(0)
    expect(support.notes.length).toBeGreaterThan(0)
  })
})
