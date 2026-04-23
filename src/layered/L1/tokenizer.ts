/**
 * L1 Layer: Tokenizer
 *
 * Provides rule-based tokenization for Japanese text using dictionary matching.
 * Uses a simple maximum matching algorithm.
 */

import type { L1Summary, TokenCategory, TokenNode } from './types'
import {
  isGreeting,
  isNegation,
  isQuestionParticle,
  lookupWord,
} from './dictionary'

/**
 * Tokenizes input text using maximum matching algorithm
 *
 * @param text - Input text to tokenize
 * @returns Array of token nodes
 */
export function tokenize(text: string): TokenNode[] {
  const tokens: TokenNode[] = []
  let position = 0
  let index = 0

  while (position < text.length) {
    // Try to match the longest possible word from the current position
    let matched = false
    let maxLength = Math.min(10, text.length - position)

    // Try matching from longest to shortest
    for (let len = maxLength; len > 0; len--) {
      const substring = text.substring(position, position + len)
      const entry = lookupWord(substring)

      if (entry) {
        tokens.push({
          surface: entry.surface,
          index,
          category: entry.category,
          length: entry.surface.length,
          isFirstToken: index === 0,
          isLastToken: false,
        })
        position += len
        index++
        matched = true
        break
      }
    }

    // If no match found, treat single character as unknown token
    if (!matched) {
      const char = text.charAt(position)
      tokens.push({
        surface: char,
        index,
        category: 'unknown',
        length: 1,
        isFirstToken: index === 0,
        isLastToken: false,
      })
      position++
      index++
    }
  }

  // Mark the last token
  if (tokens.length > 0) {
    const lastToken = tokens[tokens.length - 1]
    if (lastToken) {
      lastToken.isLastToken = true
    }
  }

  return tokens
}

/**
 * Summarizes token-level analysis from token nodes
 *
 * @param nodes - Array of token nodes
 * @returns L1 summary statistics
 */
export function summarizeL1(nodes: TokenNode[]): L1Summary {
  const categoryDistribution: Record<TokenCategory, number> = {
    noun: 0,
    verb: 0,
    adjective: 0,
    particle: 0,
    copula: 0,
    auxiliary: 0,
    greeting: 0,
    filler: 0,
    interjection: 0,
    connector: 0,
    unknown: 0,
  }

  let hasGreeting = false
  let hasQuestion = false
  let hasNegation = false
  let hasFiller = false
  const greetingTokens: string[] = []

  for (const node of nodes) {
    categoryDistribution[node.category]++

    if (node.category === 'greeting') {
      hasGreeting = true
      greetingTokens.push(node.surface)
    }

    if (isQuestionParticle(node.surface)) {
      hasQuestion = true
    }

    if (isNegation(node.surface)) {
      hasNegation = true
    }

    if (node.category === 'filler') {
      hasFiller = true
    }
  }

  // Find dominant category (most common)
  let dominantCategory: TokenCategory = 'unknown'
  let maxCount = 0

  for (const [category, count] of Object.entries(categoryDistribution)) {
    if (count > maxCount) {
      maxCount = count
      dominantCategory = category as TokenCategory
    }
  }

  return {
    tokenCount: nodes.length,
    categoryDistribution,
    hasGreeting,
    hasQuestion,
    hasNegation,
    hasFiller,
    dominantCategory,
    greetingTokens,
  }
}

/**
 * Performs complete L1 token analysis
 *
 * @param text - Input text to analyze
 * @returns Object containing token nodes and summary
 */
export function analyzeL1(text: string): { nodes: TokenNode[]; summary: L1Summary } {
  const nodes = tokenize(text)
  const summary = summarizeL1(nodes)
  return { nodes, summary }
}
