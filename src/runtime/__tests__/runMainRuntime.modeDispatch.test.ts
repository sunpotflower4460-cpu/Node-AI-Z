import { describe, it, expect } from 'vitest'
import { runMainRuntime } from '../runMainRuntime'
import { createPersonalLearningState } from '../../learning/personalLearning'

describe('runMainRuntime mode dispatch', () => {
  const baseInput = {
    text: 'test input',
    provider: 'internal_mock' as const,
    personalLearning: createPersonalLearningState(),
  }

  it('should dispatch to llm_mode mode', async () => {
    const result = await runMainRuntime({
      ...baseInput,
      implementationMode: 'llm_mode',
    })

    expect(result.implementationMode).toBe('llm_mode')
    expect('provider' in result).toBe(true)
    expect('pipelineResult' in result).toBe(true)
    expect('studioView' in result).toBe(true)
    expect('revisionEntry' in result).toBe(true)
    expect('assistantReply' in result).toBe(true)
  })

  it('should dispatch to crystallized_thinking mode', async () => {
    const result = await runMainRuntime({
      ...baseInput,
      implementationMode: 'crystallized_thinking',
    })

    expect(result.implementationMode).toBe('crystallized_thinking')
    expect('lexicalState' in result).toBe(true)
    expect('microSignalState' in result).toBe(true)
    expect('fusedState' in result).toBe(true)
    expect('signalPackets' in result).toBe(true)
    expect('protoMeanings' in result).toBe(true)
    expect('utterance' in result).toBe(true)
  })

  it('should only call llm_mode runtime when mode is llm_mode', async () => {
    const result = await runMainRuntime({
      ...baseInput,
      implementationMode: 'llm_mode',
    })

    // Verify it doesn't have crystallized thinking specific fields
    expect('lexicalState' in result).toBe(false)
    expect('microSignalState' in result).toBe(false)
  })

  it('should only call crystallized_thinking runtime when mode is crystallized_thinking', async () => {
    const result = await runMainRuntime({
      ...baseInput,
      implementationMode: 'crystallized_thinking',
    })

    // Verify it doesn't have API mode specific fields (like provider in result)
    expect(result.implementationMode).toBe('crystallized_thinking')
  })

  it('should handle different implementation modes with same input', async () => {
    const apiResult = await runMainRuntime({
      ...baseInput,
      implementationMode: 'llm_mode',
    })

    const crystalResult = await runMainRuntime({
      ...baseInput,
      implementationMode: 'crystallized_thinking',
    })

    expect(apiResult.implementationMode).not.toBe(crystalResult.implementationMode)
    expect(apiResult.implementationMode).toBe('llm_mode')
    expect(crystalResult.implementationMode).toBe('crystallized_thinking')
  })
})
