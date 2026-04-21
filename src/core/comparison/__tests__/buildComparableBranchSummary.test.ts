import { describe, expect, it } from 'vitest'
import { createEmptyPersonalBranch, updateBranchMixedNode, updateBranchSchema } from '../../index'
import { buildComparableBranchSummary } from '../buildComparableBranchSummary'

describe('buildComparableBranchSummary', () => {
  it('builds a privacy-safe summary from branch structures', () => {
    let branch = createEmptyPersonalBranch('branch-a')
    branch = updateBranchSchema(branch, {
      id: 'schema-1',
      key: 'calm-bridge',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['calm'],
      optionTendencyKeys: ['bridge'],
      somaticSignatureKeys: ['steady'],
      recurrenceCount: 6,
      strength: 0.8,
      confidence: 0.75,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 6,
    })
    branch = updateBranchMixedNode(branch, {
      id: 'node-1',
      key: 'bridge-between-states',
      label: 'Bridge',
      axes: ['affect', 'relation'],
      salience: 0.8,
      coherence: 0.8,
      novelty: 0.2,
      sessionLocal: false,
      sourceRefs: [],
      tags: ['bridge', 'steady'],
      generatedAtTurn: 6,
    })

    const summary = buildComparableBranchSummary(branch)

    expect(summary.branchId).toBe('branch-a')
    expect(summary.userIdHash).toBeDefined()
    expect(summary.schemaKeys).toContain('calm-bridge')
    expect(summary.optionTendencyKeys).toContain('bridge')
    expect(summary.mixedPatternKeys).toContain('bridge-between-states')
    expect(summary.metaphorKeys).toContain('calm')
  })
})
