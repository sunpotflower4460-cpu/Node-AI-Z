/**
 * L0 Layer: Character Classifier
 *
 * Provides character classification and character-level analysis for Japanese and ASCII text.
 */

import type { CharKind, CharNode, L0Summary } from './types'

/**
 * Classifies a single character into a CharKind category
 *
 * @param char - Single character to classify
 * @returns The character kind classification
 */
export function classifyChar(char: string): CharKind {
  const code = char.charCodeAt(0)

  // Newline
  if (char === '\n') {
    return 'newline'
  }

  // Whitespace (space, tab, etc.)
  if (/\s/.test(char)) {
    return 'whitespace'
  }

  // Symbols (including ellipsis, middle dot, etc.) - check before katakana
  if (/[…・~〜～「」『』（）()[\]{}]/.test(char)) {
    return 'symbol'
  }

  // Hiragana (U+3040-U+309F)
  if (code >= 0x3040 && code <= 0x309f) {
    return 'hiragana'
  }

  // Katakana (U+30A0-U+30FF)
  if (code >= 0x30a0 && code <= 0x30ff) {
    return 'katakana'
  }

  // Kanji (CJK Unified Ideographs)
  // Main block: U+4E00-U+9FFF
  if (code >= 0x4e00 && code <= 0x9fff) {
    return 'kanji'
  }

  // ASCII letters (a-z, A-Z)
  if (/[a-zA-Z]/.test(char)) {
    return 'ascii_letter'
  }

  // Digits (0-9)
  if (/[0-9]/.test(char)) {
    return 'digit'
  }

  // Punctuation (Japanese and ASCII)
  if (/[。、！？,.!?]/.test(char)) {
    return 'punctuation'
  }

  return 'unknown'
}

/**
 * Checks if a character is emoji
 *
 * @param char - Single character to check
 * @returns True if the character is emoji
 */
function isEmoji(char: string): boolean {
  const code = char.charCodeAt(0)
  // Basic emoji ranges (simplified detection)
  // Emoticons: U+1F600-U+1F64F
  // Misc Symbols: U+1F300-U+1F5FF
  // Transport symbols: U+1F680-U+1F6FF
  // Supplemental Symbols: U+1F900-U+1F9FF
  return (
    (code >= 0x1f600 && code <= 0x1f64f) ||
    (code >= 0x1f300 && code <= 0x1f5ff) ||
    (code >= 0x1f680 && code <= 0x1f6ff) ||
    (code >= 0x1f900 && code <= 0x1f9ff)
  )
}

/**
 * Builds character nodes from input text
 *
 * @param text - Input text to analyze
 * @returns Array of character nodes with metadata
 */
export function buildCharNodes(text: string): CharNode[] {
  const nodes: CharNode[] = []
  const chars = Array.from(text)

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]
    if (!char) continue

    const kind = classifyChar(char)
    const prevChar = i > 0 ? chars[i - 1] : null
    const isRepeat = prevChar === char
    const isLineEnd = i === chars.length - 1

    nodes.push({
      char,
      index: i,
      kind,
      isRepeat,
      isLineEnd,
    })
  }

  return nodes
}

/**
 * Summarizes character-level analysis from character nodes
 *
 * @param nodes - Array of character nodes
 * @returns L0 summary statistics
 */
export function summarizeL0(nodes: CharNode[]): L0Summary {
  const kindDistribution: Record<CharKind, number> = {
    hiragana: 0,
    katakana: 0,
    kanji: 0,
    ascii_letter: 0,
    digit: 0,
    punctuation: 0,
    symbol: 0,
    whitespace: 0,
    newline: 0,
    unknown: 0,
  }

  let repeatCount = 0
  let hasExclamation = false
  let hasQuestion = false
  let hasEllipsis = false
  let hasEmoji = false

  for (const node of nodes) {
    kindDistribution[node.kind]++
    if (node.isRepeat) {
      repeatCount++
    }
    if (node.char === '!' || node.char === '！') {
      hasExclamation = true
    }
    if (node.char === '?' || node.char === '？' || node.char === 'か') {
      hasQuestion = true
    }
    if (node.char === '…') {
      hasEllipsis = true
    }
    if (isEmoji(node.char)) {
      hasEmoji = true
    }
  }

  const lastNode = nodes[nodes.length - 1]
  const endChar = lastNode ? lastNode.char : null
  const endsWithPunctuation = lastNode ? lastNode.kind === 'punctuation' : false

  return {
    totalChars: nodes.length,
    kindDistribution,
    repeatCount,
    endsWithPunctuation,
    endChar,
    hasExclamation,
    hasQuestion,
    hasEllipsis,
    hasEmoji,
  }
}

/**
 * Performs complete L0 character analysis
 *
 * @param text - Input text to analyze
 * @returns Object containing character nodes and summary
 */
export function analyzeL0(text: string): { nodes: CharNode[]; summary: L0Summary } {
  const nodes = buildCharNodes(text)
  const summary = summarizeL0(nodes)
  return { nodes, summary }
}
