import { describe, expect, it } from 'vitest'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import { buildTrunkDiffSummary } from '../buildTrunkDiffSummary'

describe('buildTrunkDiffSummary', () => {
  it('summarizes schema and bias changes', () => {
    const before = createEmptySharedTrunk()
    const after = createEmptySharedTrunk()
    after.schemaPatterns.push({
      id: 'schema-1',
      key: 'calm-bridge',
      dominantProtoMeaningIds: ['meaning-1'],
      dominantTextureTags: ['calm'],
      optionTendencyKeys: ['bridge'],
      somaticSignatureKeys: ['steady'],
      recurrenceCount: 3,
      strength: 0.6,
      confidence: 0.7,
      supportingTraceIds: ['trace-1'],
      firstSeenTurn: 1,
      lastReinforcedTurn: 2,
    })
    after.conceptualBiases.bridge = 0.2

    const summary = buildTrunkDiffSummary({ before, after })

    expect(summary.some((line) => line.includes('schemaPatterns +1'))).toBe(true)
    expect(summary.some((line) => line.includes('conceptualBiases bridge'))).toBe(true)
  })
})
