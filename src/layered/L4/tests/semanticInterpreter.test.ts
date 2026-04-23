import { describe, expect, it } from 'vitest'
import { analyzeL0 } from '../../L0/charClassifier'
import { analyzeL1 } from '../../L1/tokenizer'
import { runL2 } from '../../L2/chunker'
import { runL3 } from '../../L3/sentenceAnalyzer'
import { createInitialBrainState } from '../../brainState'
import { runL4 } from '../semanticInterpreter'

/**
 * Runs the layered pipeline through L4 for assertions.
 *
 * @param input - Input text.
 * @param brainState - Optional brain state override.
 * @returns Layered pipeline results.
 */
function runPipeline(input: string, brainState = createInitialBrainState()) {
  const l0Result = analyzeL0(input)
  const l1Result = analyzeL1(input)
  const l2Result = runL2(l1Result)
  const l3Result = runL3(l2Result, 1)
  const l4Result = runL4(l3Result, brainState)

  return {
    l0Result,
    l1Result,
    l2Result,
    l3Result,
    l4Result,
  }
}

describe('runL4', () => {
  it('interprets 元気ですか as a new connection topic', () => {
    const { l4Result } = runPipeline('元気ですか')

    expect(l4Result.frame.need).toBe('connection')
    expect(l4Result.frame.relation).toBe('new_topic')
    expect(l4Result.frame.gist).not.toBe('')
  })

  it('interprets ブラックホールって何？ as information seeking', () => {
    const { l4Result } = runPipeline('ブラックホールって何？')

    expect(l4Result.frame.need).toBe('information')
    expect(l4Result.frame.gist).toContain('ブラックホール')
  })

  it('interprets 最近なんかモヤモヤするんだけど as expression', () => {
    const { l4Result } = runPipeline('最近なんかモヤモヤするんだけど')

    expect(l4Result.frame.need).toBe('expression')
    expect(l4Result.frame.gist).toContain('モヤモヤ')
  })

  it('interprets 人生って何だろう as reflection', () => {
    const { l4Result } = runPipeline('人生って何だろう')

    expect(l4Result.frame.need).toBe('reflection')
    expect(l4Result.frame.gist).toContain('人生')
  })

  it('interprets 教えてください as action', () => {
    const { l4Result } = runPipeline('教えてください')

    expect(l4Result.frame.need).toBe('action')
  })

  it('interprets 今日は暑いね as acknowledgment', () => {
    const { l4Result } = runPipeline('今日は暑いね')

    expect(l4Result.frame.need).toBe('acknowledgment')
  })
})
