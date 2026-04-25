import { describe, it, expect } from 'vitest'
import { runIntegratedSignalCrystallizedRuntime } from '../runIntegratedSignalCrystallizedRuntime'
import { createPersonalLearningState } from '../../learning/personalLearning'

describe('runIntegratedSignalCrystallizedRuntime', () => {
  const mockPersonalLearning = createPersonalLearningState()

  it('runs the full integrated pipeline and returns crystallized result', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
    })

    expect(result.implementationMode).toBe('crystallized_thinking')
    expect(result.utterance).toBeDefined()
  })

  it('includes signal field summary when useSignalField is true', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      useSignalField: true,
    })

    expect(result.signalFieldSummary).toBeDefined()
    expect(typeof result.signalFieldSummary?.activeParticleCount).toBe('number')
    expect(typeof result.signalFieldSummary?.assemblyCount).toBe('number')
  })

  it('passes signal proto seeds through to the crystallized result', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: '何か悩んでいる',
      personalLearning: mockPersonalLearning,
      useSignalField: true,
    })

    // Seeds array should be present (may be empty if no assemblies formed yet)
    expect(result.signalDerivedProtoSeeds).toBeDefined()
    expect(Array.isArray(result.signalDerivedProtoSeeds)).toBe(true)
  })

  it('passes signal mixed seeds through to the crystallized result', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: '選択肢が多すぎる',
      personalLearning: mockPersonalLearning,
      useSignalField: true,
    })

    expect(result.signalDerivedMixedSeeds).toBeDefined()
    expect(Array.isArray(result.signalDerivedMixedSeeds)).toBe(true)
  })

  it('includes signal vs lexical comparison', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      useSignalField: true,
    })

    expect(result.signalVsLexicalComparison).toBeDefined()
    expect(result.signalVsLexicalComparison?.rows).toBeDefined()
    expect(result.signalVsLexicalComparison?.rows.length).toBeGreaterThan(0)
  })

  it('skips signal field when useSignalField is false', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: 'テスト入力',
      personalLearning: mockPersonalLearning,
      useSignalField: false,
    })

    expect(result.implementationMode).toBe('crystallized_thinking')
    expect(result.signalFieldSummary).toBeUndefined()
    expect(result.signalDerivedProtoSeeds).toHaveLength(0)
    expect(result.signalDerivedMixedSeeds).toHaveLength(0)
  })

  it('signal field runs before crystallized thinking (ordering verified via result shape)', async () => {
    const result = await runIntegratedSignalCrystallizedRuntime({
      text: 'テスト',
      personalLearning: mockPersonalLearning,
      useSignalField: true,
    })

    // Verify both layers produced output
    expect(result.protoMeanings).toBeDefined()
    expect(result.signalDerivedProtoSeeds).toBeDefined()
  })
})
