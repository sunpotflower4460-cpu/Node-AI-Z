import { describe, expect, it } from 'vitest'
import { recordActivationSequence } from '../recordActivationSequence'
import { updateSequenceMemory } from '../updateSequenceMemory'
import { predictNextAssemblies } from '../predictNextAssemblies'
import { buildSequenceSummary } from '../buildSequenceSummary'

describe('signalSequence', () => {
  it('records transitions and predicts the next assembly', () => {
    const firstObservation = recordActivationSequence({
      previousAssemblyIds: ['assembly_a'],
      currentAssemblyIds: ['assembly_b'],
      observedAt: 1000,
    })
    const records = updateSequenceMemory([], firstObservation)
    const predictions = predictNextAssemblies(records, ['assembly_a'])
    const summary = buildSequenceSummary(records, predictions)

    expect(predictions[0]?.predictedAssemblyId).toBe('assembly_b')
    expect(summary.topSequences[0]?.contextAssemblyIds).toEqual(['assembly_a'])
  })

  it('tracks prediction mismatches', () => {
    const observation = recordActivationSequence({
      previousAssemblyIds: ['assembly_a'],
      currentAssemblyIds: ['assembly_c'],
      observedAt: 2000,
    })
    const records = updateSequenceMemory([], observation, [
      { contextAssemblyIds: ['assembly_a'], predictedAssemblyId: 'assembly_b', confidence: 0.8 },
    ])

    expect(records[0]?.mismatchCount).toBeGreaterThan(0)
  })
})
