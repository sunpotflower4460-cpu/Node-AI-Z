import { describe, expect, it } from 'vitest'
import { analyzeL0 } from '../../L0/charClassifier'
import { analyzeL1 } from '../../L1/tokenizer'
import { runL2 } from '../../L2/chunker'
import { runL3 } from '../../L3/sentenceAnalyzer'
import { createInitialBrainState } from '../../brainState'
import { runL4 } from '../../L4/semanticInterpreter'
import { runL5 } from '../reactionGenerator'

/**
 * Runs the layered pipeline through L5 for assertions.
 *
 * @param input - Input text.
 * @param mood - Optional brain mood.
 * @returns Layered pipeline results.
 */
function runPipeline(
  input: string,
  mood: 'neutral' | 'light' | 'heavy' | 'uncertain' = 'neutral',
) {
  const l0Result = analyzeL0(input)
  const l1Result = analyzeL1(input)
  const l2Result = runL2(l1Result)
  const l3Result = runL3(l2Result, 1)
  const brainState = { ...createInitialBrainState(), mood }
  const l4Result = runL4(l3Result, brainState)
  const l5Result = runL5(l4Result, brainState)

  return {
    l0Result,
    l1Result,
    l2Result,
    l3Result,
    l4Result,
    l5Result,
  }
}

describe('runL5', () => {
  it('reacts warmly to 元気ですか', () => {
    const { l5Result } = runPipeline('元気ですか')

    expect(l5Result.reaction.wantToRespond).toBe(true)
    expect(l5Result.reaction.feelsSafe).toBe(true)
    expect(l5Result.reaction.feelsRelevant).toBe(true)
    expect(l5Result.reaction.feelsUrgent).toBe(false)
    expect(l5Result.reaction.warmth).toBeGreaterThan(0.5)
    expect(l5Result.reaction.reactedTo.length).toBeGreaterThanOrEqual(1)
  })

  it('reacts neutrally to information questions', () => {
    const { l5Result } = runPipeline('ブラックホールって何？')

    expect(l5Result.reaction.wantToRespond).toBe(true)
    expect(l5Result.reaction.feelsRelevant).toBe(true)
    expect(l5Result.reaction.feelsUrgent).toBe(false)
    expect(l5Result.reaction.warmth).toBeGreaterThanOrEqual(-0.2)
    expect(l5Result.reaction.warmth).toBeLessThanOrEqual(0.2)
  })

  it('becomes cautious for expression input under heavy mood', () => {
    const { l5Result } = runPipeline('最近なんかモヤモヤするんだけど', 'heavy')

    expect(l5Result.reaction.wantToRespond).toBe(true)
    expect(l5Result.reaction.feelsSafe).toBe(false)
    expect(l5Result.reaction.warmth).toBeLessThan(0.4)
    expect(l5Result.reaction.reactedTo).toContain('気持ちを打ち明けられている')
  })

  it('marks requests as urgent', () => {
    const { l5Result } = runPipeline('教えてください')

    expect(l5Result.reaction.feelsUrgent).toBe(true)
  })

  it('holds back on unclear trailing input under heavy mood', () => {
    const { l4Result, l5Result } = runPipeline('んーけど', 'heavy')

    expect(l4Result.frame.need).toBe('unclear')
    expect(l5Result.reaction.wantToRespond).toBe(false)
    expect(l5Result.reaction.snag).not.toBeNull()
  })
})
