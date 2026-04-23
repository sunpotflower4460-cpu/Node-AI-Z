/**
 * L1 Layer: Tokenizer Tests
 */

import { describe, expect, it } from 'vitest'
import { analyzeL1, summarizeL1, tokenize } from '../tokenizer'

describe('tokenize', () => {
  it('tokenizes simple greeting', () => {
    const tokens = tokenize('こんにちは')
    expect(tokens).toHaveLength(1)
    expect(tokens[0]).toMatchObject({
      surface: 'こんにちは',
      index: 0,
      category: 'greeting',
      isFirstToken: true,
      isLastToken: true,
    })
  })

  it('tokenizes greeting with question particle', () => {
    const tokens = tokenize('元気ですか')
    expect(tokens).toHaveLength(3)
    expect(tokens[0]).toMatchObject({
      surface: '元気',
      category: 'noun',
      isFirstToken: true,
    })
    expect(tokens[1]).toMatchObject({
      surface: 'です',
      category: 'copula',
    })
    expect(tokens[2]).toMatchObject({
      surface: 'か',
      category: 'particle',
      isLastToken: true,
    })
  })

  it('handles complex sentence with mixed categories', () => {
    const tokens = tokenize('最近なんかモヤモヤするだけど')
    expect(tokens.length).toBeGreaterThan(0)
    expect(tokens[0]?.surface).toBe('最近')
    expect(tokens[0]?.category).toBe('noun')
  })

  it('handles unknown characters', () => {
    const tokens = tokenize('んだけど')
    expect(tokens.length).toBeGreaterThan(0)
    // First character 'ん' might be unknown if not in dictionary
  })

  it('handles empty text', () => {
    const tokens = tokenize('')
    expect(tokens).toHaveLength(0)
  })

  it('tokenizes text with multiple particles', () => {
    const tokens = tokenize('はがを')
    expect(tokens).toHaveLength(3)
    expect(tokens[0]?.category).toBe('particle')
    expect(tokens[1]?.category).toBe('particle')
    expect(tokens[2]?.category).toBe('particle')
  })

  it('marks first and last tokens correctly', () => {
    const tokens = tokenize('元気です')
    expect(tokens[0]?.isFirstToken).toBe(true)
    expect(tokens[0]?.isLastToken).toBe(false)
    expect(tokens[tokens.length - 1]?.isFirstToken).toBe(false)
    expect(tokens[tokens.length - 1]?.isLastToken).toBe(true)
  })
})

describe('summarizeL1', () => {
  it('summarizes simple greeting', () => {
    const tokens = tokenize('こんにちは')
    const summary = summarizeL1(tokens)
    expect(summary.tokenCount).toBe(1)
    expect(summary.hasGreeting).toBe(true)
    expect(summary.greetingTokens).toContain('こんにちは')
    expect(summary.dominantCategory).toBe('greeting')
  })

  it('detects question particle', () => {
    const tokens = tokenize('元気ですか')
    const summary = summarizeL1(tokens)
    expect(summary.hasQuestion).toBe(true)
    expect(summary.categoryDistribution.noun).toBe(1)
    expect(summary.categoryDistribution.copula).toBe(1)
    expect(summary.categoryDistribution.particle).toBe(1)
  })

  it('detects negation', () => {
    const tokens = tokenize('ない')
    const summary = summarizeL1(tokens)
    expect(summary.hasNegation).toBe(true)
  })

  it('detects filler words', () => {
    const tokens = tokenize('なんか')
    const summary = summarizeL1(tokens)
    expect(summary.hasFiller).toBe(true)
  })

  it('counts category distribution', () => {
    const tokens = tokenize('元気ですか')
    const summary = summarizeL1(tokens)
    expect(summary.categoryDistribution.noun).toBeGreaterThan(0)
    expect(summary.categoryDistribution.copula).toBeGreaterThan(0)
    expect(summary.categoryDistribution.particle).toBeGreaterThan(0)
  })

  it('identifies dominant category', () => {
    const tokens = tokenize('はがをに')
    const summary = summarizeL1(tokens)
    expect(summary.dominantCategory).toBe('particle')
  })

  it('handles empty token list', () => {
    const tokens = tokenize('')
    const summary = summarizeL1(tokens)
    expect(summary.tokenCount).toBe(0)
    expect(summary.hasGreeting).toBe(false)
    expect(summary.greetingTokens).toHaveLength(0)
  })
})

describe('analyzeL1', () => {
  it('performs complete L1 analysis for greeting', () => {
    const result = analyzeL1('こんにちは')
    expect(result.nodes).toHaveLength(1)
    expect(result.summary.hasGreeting).toBe(true)
    expect(result.summary.tokenCount).toBe(1)
  })

  it('analyzes greeting question', () => {
    const result = analyzeL1('元気ですか')
    expect(result.nodes).toHaveLength(3)
    expect(result.summary.hasQuestion).toBe(true)
    expect(result.summary.categoryDistribution.noun).toBe(1)
    expect(result.summary.categoryDistribution.copula).toBe(1)
    expect(result.summary.categoryDistribution.particle).toBe(1)
  })

  it('analyzes complex sentence', () => {
    const result = analyzeL1('最近なんかモヤモヤするだけど')
    expect(result.nodes.length).toBeGreaterThan(0)
    expect(result.summary.tokenCount).toBeGreaterThan(0)
  })

  it('handles empty text', () => {
    const result = analyzeL1('')
    expect(result.nodes).toHaveLength(0)
    expect(result.summary.tokenCount).toBe(0)
  })
})
