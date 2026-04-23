import { describe, expect, it } from 'vitest'
import { createPersonalLearningState } from '../../learning/personalLearning'
import { runLayeredThinkingRuntime } from '../runLayeredThinkingRuntime'

describe('runLayeredThinkingRuntime', () => {
  it('builds additive layered analysis for a greeting question', async () => {
    const result = await runLayeredThinkingRuntime({
      text: '元気ですか',
      personalLearning: createPersonalLearningState(),
    })

    expect(result.implementationMode).toBe('layered_thinking')
    expect(result.trace.characterNodes).toHaveLength(5)
    expect(result.trace.tokenNodes.map(token => token.surface)).toEqual(['元気', 'です', 'か'])
    expect(result.trace.chunkNodes).toHaveLength(1)
    expect(result.trace.chunkNodes[0]?.role).toBe('greeting')
    expect(result.trace.l3Output.overallType).toBe('greeting_question')
    expect(result.trace.semanticFrame.need).toBe('connection')
    expect(result.trace.decision.action).toBe('greet_back')
    expect(result.utterance.length).toBeGreaterThan(0)
  })

  it('tracks prediction error across turns without touching the crystallized brain state', async () => {
    const personalLearning = createPersonalLearningState()

    const first = await runLayeredThinkingRuntime({
      text: '最近なんかモヤモヤするんだけど',
      personalLearning,
    })

    const second = await runLayeredThinkingRuntime({
      text: '元気ですか',
      personalLearning,
      brainState: first.trace.nextBrainState,
    })

    expect(first.trace.nextBrainState.turnCount).toBe(1)
    expect(second.trace.nextBrainState.turnCount).toBe(2)
    expect(second.trace.predictionError).not.toBeNull()
    expect(second.trace.predictionError?.surprise).toBeGreaterThan(0)
  })
})
