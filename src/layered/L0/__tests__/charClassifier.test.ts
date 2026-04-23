/**
 * L0 Layer: Character Classifier Tests
 */

import { describe, expect, it } from 'vitest'
import { analyzeL0, buildCharNodes, classifyChar, summarizeL0 } from '../charClassifier'

describe('classifyChar', () => {
  it('classifies hiragana characters', () => {
    expect(classifyChar('あ')).toBe('hiragana')
    expect(classifyChar('い')).toBe('hiragana')
    expect(classifyChar('ん')).toBe('hiragana')
  })

  it('classifies katakana characters', () => {
    expect(classifyChar('ア')).toBe('katakana')
    expect(classifyChar('イ')).toBe('katakana')
    expect(classifyChar('ン')).toBe('katakana')
  })

  it('classifies kanji characters', () => {
    expect(classifyChar('日')).toBe('kanji')
    expect(classifyChar('本')).toBe('kanji')
    expect(classifyChar('語')).toBe('kanji')
  })

  it('classifies ASCII letters', () => {
    expect(classifyChar('a')).toBe('ascii_letter')
    expect(classifyChar('Z')).toBe('ascii_letter')
  })

  it('classifies digits', () => {
    expect(classifyChar('0')).toBe('digit')
    expect(classifyChar('9')).toBe('digit')
  })

  it('classifies punctuation', () => {
    expect(classifyChar('。')).toBe('punctuation')
    expect(classifyChar('、')).toBe('punctuation')
    expect(classifyChar('！')).toBe('punctuation')
    expect(classifyChar('？')).toBe('punctuation')
    expect(classifyChar('.')).toBe('punctuation')
    expect(classifyChar(',')).toBe('punctuation')
    expect(classifyChar('!')).toBe('punctuation')
    expect(classifyChar('?')).toBe('punctuation')
  })

  it('classifies symbols', () => {
    expect(classifyChar('…')).toBe('symbol')
    expect(classifyChar('・')).toBe('symbol')
    expect(classifyChar('「')).toBe('symbol')
    expect(classifyChar('」')).toBe('symbol')
  })

  it('classifies whitespace', () => {
    expect(classifyChar(' ')).toBe('whitespace')
    expect(classifyChar('\t')).toBe('whitespace')
  })

  it('classifies newline', () => {
    expect(classifyChar('\n')).toBe('newline')
  })
})

describe('buildCharNodes', () => {
  it('builds char nodes for simple hiragana text', () => {
    const nodes = buildCharNodes('こんにちは')
    expect(nodes).toHaveLength(5)
    expect(nodes[0]).toMatchObject({
      char: 'こ',
      index: 0,
      kind: 'hiragana',
      isRepeat: false,
    })
    expect(nodes[4]).toMatchObject({
      char: 'は',
      index: 4,
      kind: 'hiragana',
      isLineEnd: true,
    })
  })

  it('detects repeated characters', () => {
    const nodes = buildCharNodes('ああ')
    expect(nodes).toHaveLength(2)
    expect(nodes[0]?.isRepeat).toBe(false)
    expect(nodes[1]?.isRepeat).toBe(true)
  })

  it('handles mixed character types', () => {
    const nodes = buildCharNodes('日本語ABC123')
    expect(nodes).toHaveLength(9)
    expect(nodes[0]?.kind).toBe('kanji')
    expect(nodes[1]?.kind).toBe('kanji')
    expect(nodes[2]?.kind).toBe('kanji')
    expect(nodes[3]?.kind).toBe('ascii_letter')
    expect(nodes[6]?.kind).toBe('digit')
  })

  it('marks line end correctly', () => {
    const nodes = buildCharNodes('あ\nい')
    expect(nodes).toHaveLength(3)
    expect(nodes[0]?.isLineEnd).toBe(false)
    expect(nodes[1]?.isLineEnd).toBe(false)
    expect(nodes[2]?.isLineEnd).toBe(true)
  })

  it('handles empty text', () => {
    const nodes = buildCharNodes('')
    expect(nodes).toHaveLength(0)
  })
})

describe('summarizeL0', () => {
  it('summarizes simple hiragana text', () => {
    const nodes = buildCharNodes('こんにちは')
    const summary = summarizeL0(nodes)
    expect(summary.totalChars).toBe(5)
    expect(summary.kindDistribution.hiragana).toBe(5)
    expect(summary.repeatCount).toBe(0)
    expect(summary.endsWithPunctuation).toBe(false)
    expect(summary.endChar).toBe('は')
  })

  it('detects exclamation marks', () => {
    const nodes = buildCharNodes('こんにちは！')
    const summary = summarizeL0(nodes)
    expect(summary.hasExclamation).toBe(true)
    expect(summary.endsWithPunctuation).toBe(true)
  })

  it('detects question marks', () => {
    const nodes = buildCharNodes('元気ですか？')
    const summary = summarizeL0(nodes)
    expect(summary.hasQuestion).toBe(true)
    expect(summary.endsWithPunctuation).toBe(true)
  })

  it('detects ellipsis', () => {
    const nodes = buildCharNodes('そうですね…')
    const summary = summarizeL0(nodes)
    expect(summary.hasEllipsis).toBe(true)
  })

  it('counts repeated characters', () => {
    const nodes = buildCharNodes('ああああ')
    const summary = summarizeL0(nodes)
    expect(summary.repeatCount).toBe(3)
  })

  it('handles mixed distribution', () => {
    const nodes = buildCharNodes('日本語とEnglish')
    const summary = summarizeL0(nodes)
    expect(summary.kindDistribution.kanji).toBe(3)
    expect(summary.kindDistribution.hiragana).toBe(1)
    expect(summary.kindDistribution.ascii_letter).toBe(7)
  })

  it('returns null endChar for empty text', () => {
    const nodes = buildCharNodes('')
    const summary = summarizeL0(nodes)
    expect(summary.endChar).toBe(null)
    expect(summary.totalChars).toBe(0)
  })
})

describe('analyzeL0', () => {
  it('performs complete L0 analysis', () => {
    const result = analyzeL0('こんにちは！')
    expect(result.nodes).toHaveLength(6)
    expect(result.summary.totalChars).toBe(6)
    expect(result.summary.hasExclamation).toBe(true)
  })

  it('analyzes question text', () => {
    const result = analyzeL0('元気ですか')
    expect(result.nodes).toHaveLength(5)
    expect(result.summary.hasQuestion).toBe(true)
    expect(result.summary.kindDistribution.hiragana).toBe(3)
    expect(result.summary.kindDistribution.kanji).toBe(2)
  })

  it('analyzes text with ellipsis', () => {
    const result = analyzeL0('最近なんかモヤモヤするんだけど…')
    expect(result.summary.hasEllipsis).toBe(true)
    expect(result.summary.kindDistribution.kanji).toBeGreaterThan(0)
    expect(result.summary.kindDistribution.hiragana).toBeGreaterThan(0)
    expect(result.summary.kindDistribution.katakana).toBeGreaterThan(0)
  })
})
