import { describe, expect, it } from 'vitest'
import { analyzeL0 } from '../../L0/charClassifier'
import { analyzeL1 } from '../../L1/tokenizer'
import { runL2 } from '../../L2/chunker'
import { runL3 } from '../sentenceAnalyzer'

/**
 * Runs the L0 → L1 → L2 → L3 pipeline for assertions.
 *
 * @param input - Input text.
 * @returns Layered pipeline results.
 */
function runPipeline(input: string) {
  const l0Result = analyzeL0(input)
  const l1Result = analyzeL1(input)
  const l2Result = runL2(l1Result)
  const l3Result = runL3(l2Result, 1)

  return {
    l0Result,
    l1Result,
    l2Result,
    l3Result,
  }
}

describe('runL3', () => {
  it('classifies 元気ですか as greeting_question', () => {
    const { l0Result, l1Result, l2Result, l3Result } = runPipeline('元気ですか')

    expect(l0Result.summary.hasQuestion).toBe(true)
    expect(l1Result.nodes).toHaveLength(3)
    expect(l2Result.chunks[0]?.role).toBe('greeting')
    expect(l3Result.overallType).toBe('greeting_question')
    expect(l3Result.overallCompleteness).toBe('complete')
    expect(l3Result.sentences[0]?.addressee).toBe('me')
  })

  it('classifies ブラックホールって何？ as information_question', () => {
    const { l3Result } = runPipeline('ブラックホールって何？')

    expect(l3Result.overallType).toBe('information_question')
    expect(l3Result.overallCompleteness).toBe('complete')
    expect(l3Result.sentences[0]?.addressee).toBe('general')
  })

  it('classifies 最近なんかモヤモヤするんだけど as trailing feeling expression', () => {
    const { l3Result } = runPipeline('最近なんかモヤモヤするんだけど')

    expect(l3Result.overallType).toBe('feeling_expression')
    expect(l3Result.overallCompleteness).toBe('trailing')
    expect(l3Result.sentences[0]?.addressee).toBe('self')
  })

  it('classifies おはよう as greeting', () => {
    const { l3Result } = runPipeline('おはよう')

    expect(l3Result.overallType).toBe('greeting')
    expect(l3Result.overallCompleteness).toBe('complete')
    expect(l3Result.sentences[0]?.addressee).toBe('me')
  })

  it('classifies 人生って何だろう as opinion_question', () => {
    const { l3Result } = runPipeline('人生って何だろう')

    expect(l3Result.overallType).toBe('opinion_question')
    expect(l3Result.overallCompleteness).toBe('complete')
    expect(l3Result.sentences[0]?.addressee).toBe('general')
  })

  it('classifies 教えてください as request', () => {
    const { l3Result } = runPipeline('教えてください')

    expect(l3Result.overallType).toBe('request')
    expect(l3Result.overallCompleteness).toBe('complete')
    expect(l3Result.sentences[0]?.addressee).toBe('me')
  })

  it('classifies へえ as reaction fragment', () => {
    const { l3Result } = runPipeline('へえ')

    expect(l3Result.overallType).toBe('reaction')
    expect(l3Result.overallCompleteness).toBe('fragment')
    expect(l3Result.sentences[0]?.addressee).toBe('unknown')
  })

  it('classifies 今日は暑いね as statement', () => {
    const { l3Result } = runPipeline('今日は暑いね')

    expect(l3Result.overallType).toBe('statement')
    expect(l3Result.overallCompleteness).toBe('complete')
    expect(l3Result.sentences[0]?.addressee).toBe('general')
  })
})
