import { describe, it, expect } from 'vitest'
import { runCrystallizedThinkingRuntime } from '../runCrystallizedThinkingRuntime'
import { createPersonalLearningState } from '../../learning/personalLearning'

describe('runCrystallizedThinkingRuntime - precondition and persona (Pass 3)', () => {
  const mockPersonalLearning = createPersonalLearningState()

  it('includes precondition filter in result', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '迷っている',
      personalLearning: mockPersonalLearning,
    })

    expect(result.preconditionFilter).toBeDefined()
    expect(result.preconditionFilter?.home).toBeDefined()
    expect(result.preconditionFilter?.existence).toBeDefined()
    expect(result.preconditionFilter?.belief).toBeDefined()
  })

  it('includes persona weight vector in result', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '決めたい',
      personalLearning: mockPersonalLearning,
    })

    expect(result.personaWeightVector).toBeDefined()
    expect(result.personaWeightVector?.id).toBe('default')
    expect(result.personaWeightVector?.signalBias).toBeDefined()
    expect(result.personaWeightVector?.meaningBias).toBeDefined()
  })

  it('allows selecting a different persona', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '重い気持ち',
      personalLearning: mockPersonalLearning,
      personaId: 'gentle',
    })

    expect(result.personaWeightVector?.id).toBe('gentle')
    expect(result.personaWeightVector?.label).toBe('Gentle Holder')
  })

  it('applies precondition to fused state', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'もろくて不安',
      personalLearning: mockPersonalLearning,
    })

    // Fused state should include precondition markers
    expect(result.fusedState.integratedTensions).toBeDefined()
    const hasPreconditionMarkers = result.fusedState.integratedTensions.some(
      (t) => t.includes('precondition:'),
    )
    expect(hasPreconditionMarkers).toBe(true)
  })

  it('applies persona to proto meanings', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '迷って探している',
      personalLearning: mockPersonalLearning,
      personaId: 'explorer',
    })

    // Proto meanings should be present (persona modulation is subtle)
    expect(result.protoMeanings.sensory).toBeDefined()
    expect(result.protoMeanings.narrative).toBeDefined()
    expect(result.protoMeanings.sensory.length).toBeGreaterThan(0)
  })

  it('precondition affects utterance intent', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: '決めないと',
      personalLearning: mockPersonalLearning,
    })

    // Utterance intent should be affected by precondition
    expect(result.utteranceIntent).toBeDefined()
    expect(result.utteranceIntent?.emotionalDistance).toBeGreaterThanOrEqual(0)
    expect(result.utteranceIntent?.emotionalDistance).toBeLessThanOrEqual(1)
    expect(result.utteranceIntent?.ambiguityTolerance).toBeGreaterThanOrEqual(0)
    expect(result.utteranceIntent?.ambiguityTolerance).toBeLessThanOrEqual(1)
  })

  it('complete flow with precondition and persona', async () => {
    const result = await runCrystallizedThinkingRuntime({
      text: 'AかBか迷っている',
      personalLearning: mockPersonalLearning,
      personaId: 'gentle',
    })

    // Verify complete pipeline with precondition and persona
    expect(result.preconditionFilter).toBeDefined()
    expect(result.personaWeightVector?.id).toBe('gentle')
    expect(result.fusedState).toBeDefined()
    expect(result.protoMeanings.sensory).toBeDefined()
    expect(result.protoMeanings.narrative).toBeDefined()
    expect(result.utteranceIntent).toBeDefined()
    expect(result.utteranceShape).toBeDefined()
    expect(result.finalCrystallizedReply).toBeDefined()
    expect(result.finalCrystallizedReply).toBeTruthy()
  })
})
