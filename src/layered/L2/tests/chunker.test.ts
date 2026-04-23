import { describe, expect, it } from 'vitest'
import { analyzeL0 } from '../../L0/charClassifier'
import { analyzeL1 } from '../../L1/tokenizer'
import { runL2 } from '../chunker'

/**
 * Runs the L0 → L1 → L2 pipeline for a text sample.
 *
 * @param input - Input text.
 * @returns Layer results for assertions.
 */
function runPipeline(input: string) {
  const l0Result = analyzeL0(input)
  const l1Result = analyzeL1(input)
  const l2Result = runL2(l1Result)

  return {
    l0Result,
    l1Result,
    l2Result,
  }
}

describe('runL2', () => {
  it('chunks 元気ですか as one greeting chunk', () => {
    const { l0Result, l1Result, l2Result } = runPipeline('元気ですか')

    expect(l0Result.summary.hasQuestion).toBe(true)
    expect(l1Result.nodes).toHaveLength(3)
    expect(l2Result.chunks).toHaveLength(1)
    expect(l2Result.chunks[0]?.role).toBe('greeting')
    expect(l2Result.summary.dominantRole).toBe('greeting')
  })

  it('chunks ブラックホールって何？ into subject and question-like chunks', () => {
    const { l2Result } = runPipeline('ブラックホールって何？')

    expect(l2Result.chunks).toHaveLength(2)
    expect(l2Result.chunks[0]).toMatchObject({
      surface: 'ブラックホールって',
      role: 'subject',
    })
    expect(l2Result.chunks[1]?.surface).toBe('何？')
    expect(['question', 'predicate']).toContain(l2Result.chunks[1]?.role)
    expect(l2Result.summary.hasQuestion).toBe(true)
  })

  it('chunks 最近なんかモヤモヤするんだけど with standalone filler and trailing connector', () => {
    const { l2Result } = runPipeline('最近なんかモヤモヤするんだけど')

    expect(l2Result.chunks.map(chunk => chunk.surface)).toEqual(['最近', 'なんか', 'モヤモヤするん', 'だけど'])
    expect(l2Result.chunks.map(chunk => chunk.role)).toEqual([
      'modifier',
      'standalone',
      'predicate',
      'standalone',
    ])
    expect(l2Result.summary.isComplete).toBe(false)
    expect(l2Result.summary.hasConnector).toBe(true)
  })

  it('chunks おはよう as greeting', () => {
    const { l2Result } = runPipeline('おはよう')

    expect(l2Result.chunks).toHaveLength(1)
    expect(l2Result.chunks[0]).toMatchObject({
      surface: 'おはよう',
      role: 'greeting',
    })
  })

  it('chunks 人生って何だろう into subject and predicate-like chunks', () => {
    const { l2Result } = runPipeline('人生って何だろう')

    expect(l2Result.chunks).toHaveLength(2)
    expect(l2Result.chunks[0]).toMatchObject({
      surface: '人生って',
      role: 'subject',
    })
    expect(l2Result.chunks[1]).toMatchObject({
      surface: '何だろう',
      role: 'predicate',
    })
  })

  it('chunks 教えてください as one predicate chunk', () => {
    const { l2Result } = runPipeline('教えてください')

    expect(l2Result.chunks).toHaveLength(1)
    expect(l2Result.chunks[0]).toMatchObject({
      surface: '教えてください',
      role: 'predicate',
    })
  })

  it('chunks へえ as standalone reaction-like chunk', () => {
    const { l2Result } = runPipeline('へえ')

    expect(l2Result.chunks).toHaveLength(1)
    expect(l2Result.chunks[0]).toMatchObject({
      surface: 'へえ',
      role: 'standalone',
    })
  })

  it('chunks 今日は暑いね into subject and predicate-like chunks', () => {
    const { l2Result } = runPipeline('今日は暑いね')

    expect(l2Result.chunks).toHaveLength(2)
    expect(l2Result.chunks[0]).toMatchObject({
      surface: '今日は',
      role: 'subject',
    })
    expect(l2Result.chunks[1]?.surface).toBe('暑いね')
    expect(l2Result.chunks[1]?.role).toBe('predicate')
    expect(l2Result.summary.isComplete).toBe(true)
  })
})
