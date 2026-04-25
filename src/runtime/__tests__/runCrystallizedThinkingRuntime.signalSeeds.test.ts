import { describe, it, expect } from 'vitest'
import { runCrystallizedThinkingRuntime } from '../runCrystallizedThinkingRuntime'
import { createPersonalLearningState } from '../../learning/personalLearning'
import type { ProtoMeaningSeed, MixedLatentSeed } from '../../signalField/signalFieldTypes'

describe('runCrystallizedThinkingRuntime - signal-derived seeds', () => {
  const mockPersonalLearning = createPersonalLearningState()

  const mockProtoSeeds: ProtoMeaningSeed[] = [
    {
      id: 'pmseed_test1',
      sourceAssemblyIds: ['asm1'],
      strength: 0.6,
      seedType: 'assembly_cluster',
      features: ['repeated_cluster', 'dense_local_binding'],
    },
  ]

  const mockMixedSeeds: MixedLatentSeed[] = [
    {
      id: 'mlseed_test1',
      sourceSeedIds: ['pmseed_test1'],
      weight: 0.6,
      axes: { repetition: 0.5, instability: 0.1, crossModalBinding: 0.2 },
    },
  ]

  const mockSignalSummary = {
    activeParticleCount: 8,
    assemblyCount: 1,
    protoMeaningSeedCount: 1,
    mixedLatentSeedCount: 1,
    bridgeCount: 0,
    replayTriggered: false,
  }

  it('accepts and passes through signal-derived proto seeds', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      signalDerivedProtoSeeds: mockProtoSeeds,
      signalDerivedMixedSeeds: mockMixedSeeds,
      signalFieldSummary: mockSignalSummary,
    })

    expect(result.signalDerivedProtoSeeds).toBeDefined()
    expect(result.signalDerivedProtoSeeds).toHaveLength(1)
    expect(result.signalDerivedProtoSeeds![0]!.seedType).toBe('assembly_cluster')
  })

  it('passes through signal-derived mixed seeds', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      signalDerivedProtoSeeds: mockProtoSeeds,
      signalDerivedMixedSeeds: mockMixedSeeds,
      signalFieldSummary: mockSignalSummary,
    })

    expect(result.signalDerivedMixedSeeds).toBeDefined()
    expect(result.signalDerivedMixedSeeds).toHaveLength(1)
  })

  it('passes through signal field summary', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      signalFieldSummary: mockSignalSummary,
    })

    expect(result.signalFieldSummary).toBeDefined()
    expect(result.signalFieldSummary?.assemblyCount).toBe(1)
    expect(result.signalFieldSummary?.activeParticleCount).toBe(8)
  })

  it('derives signal cues from proto seeds', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      signalDerivedProtoSeeds: mockProtoSeeds,
    })

    expect(result.signalDerivedCues).toBeDefined()
    expect(result.signalDerivedCues).toContain('repeated_cluster')
    expect(result.signalDerivedCues).toContain('dense_local_binding')
  })

  it('runs normally without signal seeds (backwards compatible)', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
    })

    // Core result fields should still be present
    expect(result.implementationMode).toBe('crystallized_thinking')
    expect(result.utterance).toBeDefined()
    // Signal fields should be undefined / empty when not provided
    expect(result.signalDerivedCues).toEqual([])
  })
})
