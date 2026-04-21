import { describe, expect, it } from 'vitest'
import { createEmptySharedTrunk } from '../../sharedTrunk'
import { runTrunkConsistencyCheck } from '../runTrunkConsistencyCheck'

describe('runTrunkConsistencyCheck', () => {
  it('flags duplicate schema keys and invalid bias values', () => {
    const trunk = createEmptySharedTrunk()
    trunk.schemaPatterns.push(
      {
        id: 'schema-1',
        key: 'duplicate',
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
      },
      {
        id: 'schema-2',
        key: 'duplicate',
        dominantProtoMeaningIds: ['meaning-2'],
        dominantTextureTags: ['warm'],
        optionTendencyKeys: ['hold'],
        somaticSignatureKeys: ['steady'],
        recurrenceCount: 4,
        strength: 0.5,
        confidence: 0.6,
        supportingTraceIds: ['trace-2'],
        firstSeenTurn: 1,
        lastReinforcedTurn: 3,
      }
    )
    trunk.conceptualBiases.bridge = 1.5

    const result = runTrunkConsistencyCheck(trunk)

    expect(result.ok).toBe(false)
    expect(result.warningKeys).toContain('schemaPatterns:duplicates')
    expect(result.warningKeys).toContain('conceptualBiases:bridge')
  })
})
