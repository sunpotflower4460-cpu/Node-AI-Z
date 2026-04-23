import { describe, expect, it } from 'vitest'
import { createInitialBrainState } from '../brainState'
import { runLayeredThinkingRuntime } from '../runLayeredThinkingRuntime'

describe('runLayeredThinkingRuntime', () => {
  it('runs the full pipeline from greeting input to final utterance', async () => {
    const result = await runLayeredThinkingRuntime({
      text: '元気ですか',
    })

    expect(result.trace.characterNodes).toHaveLength(5)
    expect(result.trace.tokenNodes.map(token => token.surface)).toEqual(['元気', 'です', 'か'])
    expect(result.trace.chunkNodes[0]?.role).toBe('greeting')
    expect(result.trace.l3Result.overallType).toBe('greeting_question')
    expect(result.trace.l4Result.frame.need).toBe('connection')
    expect(result.trace.l6Result.decision.action).toBe('greet_back')
    expect(result.trace.l7Result.templateKey).toBe('greet_back_warm')
    expect(result.utterance.length).toBeGreaterThan(0)
    expect(result.trace.nextBrainState.lastUtterance).toBe(result.utterance)
  })

  it('tracks prediction error across turns and advances brain state', async () => {
    const first = await runLayeredThinkingRuntime({
      text: '最近なんかモヤモヤするんだけど',
    })
    const second = await runLayeredThinkingRuntime({
      text: '元気ですか',
      brainState: first.trace.nextBrainState,
    })

    expect(first.trace.nextBrainState.turnCount).toBe(1)
    expect(second.trace.nextBrainState.turnCount).toBe(2)
    expect(second.trace.predictionError).not.toBeNull()
    expect(second.trace.predictionError?.surprise).toBeGreaterThan(0)
  })

  it('keeps recent topics and next prediction in sync for information questions', async () => {
    const result = await runLayeredThinkingRuntime({
      text: 'ブラックホールって何？',
      brainState: {
        ...createInitialBrainState(),
        recentTopics: ['宇宙'],
      },
    })

    expect(result.trace.l4Result.frame.need).toBe('information')
    expect(result.trace.l6Result.decision.topic.length).toBeGreaterThan(0)
    expect(result.trace.nextPrediction.expectedNeed).toBe('information')
    expect(result.trace.nextPrediction.expectedTopic).toBe(result.trace.l6Result.decision.topic)
    expect(result.trace.nextBrainState.recentTopics[0]).toBe(result.trace.l6Result.decision.topic)
  })

  it('produces an uncertain ask-back for unclear heavy input', async () => {
    const result = await runLayeredThinkingRuntime({
      text: 'んーけど',
      brainState: {
        ...createInitialBrainState(),
        mood: 'heavy',
      },
    })

    expect(['wait', 'ask_back']).toContain(result.trace.l6Result.decision.action)
    expect(result.trace.l7Result.appliedModifiers).toContain('uncertainty_prefix')
    expect(result.utterance.length).toBeGreaterThan(0)
    expect(result.trace.nextBrainState.mood).toBe('uncertain')
  })
})
