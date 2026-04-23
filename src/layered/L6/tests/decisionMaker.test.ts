import { describe, expect, it } from 'vitest'
import { analyzeL0 } from '../../L0/charClassifier'
import { analyzeL1 } from '../../L1/tokenizer'
import { runL2 } from '../../L2/chunker'
import { runL3 } from '../../L3/sentenceAnalyzer'
import { createInitialBrainState, type BrainState } from '../../brainState'
import { runL4 } from '../../L4/semanticInterpreter'
import { runL5 } from '../../L5/reactionGenerator'
import { runL6 } from '../decisionMaker'

/**
 * Runs the layered pipeline through L6 for assertions.
 *
 * @param input - Input text.
 * @param brainState - Optional brain state override.
 * @returns Layered pipeline results.
 */
function runPipeline(input: string, brainState: BrainState = createInitialBrainState()) {
  const l0Result = analyzeL0(input)
  const l1Result = analyzeL1(input)
  const l2Result = runL2(l1Result)
  const l3Result = runL3(l2Result, 1)
  const l4Result = runL4(l3Result, brainState)
  const l5Result = runL5(l4Result, brainState, null)
  const l6Result = runL6(l4Result, l5Result, brainState, null)

  return {
    l0Result,
    l1Result,
    l2Result,
    l3Result,
    l4Result,
    l5Result,
    l6Result,
  }
}

describe('runL6', () => {
  it('greets back for 元気ですか on the first turn', () => {
    const { l6Result } = runPipeline('元気ですか')

    expect(l6Result.decision.action).toBe('greet_back')
    expect(l6Result.decision.askBack).toBe(true)
    expect(l6Result.decision.length).toBe('short')
    expect(l6Result.decision.confidence).toBeGreaterThanOrEqual(0.7)
    expect(l6Result.decision.warmthBand).toBe('warm')
  })

  it('answers information questions', () => {
    const { l6Result } = runPipeline('ブラックホールって何？')

    expect(l6Result.decision.action).toBe('answer')
    expect(l6Result.decision.length).toBe('medium')
    expect(l6Result.decision.askBack).toBe(false)
  })

  it('listens to feeling expressions and shows uncertainty in heavy mood', () => {
    const { l6Result } = runPipeline('最近なんかモヤモヤするんだけど', {
      ...createInitialBrainState(),
      mood: 'heavy',
    })

    expect(l6Result.decision.action).toBe('listen')
    expect(l6Result.decision.length).toBe('short')
    expect(l6Result.decision.showUncertainty).toBe(true)
  })

  it('explores reflection questions', () => {
    const { l6Result } = runPipeline('人生って何だろう')

    expect(l6Result.decision.action).toBe('explore')
    expect(l6Result.decision.askBack).toBe(true)
    expect(l6Result.decision.length).toBe('medium')
  })

  it('keeps request decisions short', () => {
    const { l6Result } = runPipeline('教えてください')

    expect(['answer', 'ask_back']).toContain(l6Result.decision.action)
    expect(l6Result.decision.length).toBe('short')
  })

  it('waits or asks back for unclear heavy input', () => {
    const { l6Result } = runPipeline('んーけど', {
      ...createInitialBrainState(),
      mood: 'heavy',
    })

    expect(['wait', 'ask_back']).toContain(l6Result.decision.action)
    expect(l6Result.decision.showUncertainty).toBe(true)
  })

  it('attaches a context modifier and still greets back after a heavy prior turn', () => {
    const brainState: BrainState = {
      ...createInitialBrainState(),
      mood: 'heavy',
      lastSemantic: {
        gist: 'モヤモヤという気持ちを出している',
        need: 'expression',
        contextModifier: null,
        relation: 'new_topic',
      },
    }
    const { l4Result, l6Result } = runPipeline('元気ですか', brainState)

    expect(l4Result.frame.contextModifier).not.toBeNull()
    expect(l6Result.decision.action).toBe('greet_back')
  })
})
