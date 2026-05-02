import type { SensoryFeatureVector } from '../sensoryPacketTypes'
import { SENSORY_FEATURE_DIM } from '../sensoryPacketTypes'

/**
 * Extract low-level structural features from a text input.
 *
 * Features (8 dimensions):
 *  [0] charCountNorm   — normalized character count (0-1, saturates at 300 chars)
 *  [1] wordCountNorm   — normalized word count (0-1, saturates at 80 words)
 *  [2] hasQuestion     — contains '?' (1 = yes, 0 = no)
 *  [3] hasExclamation  — contains '!' (1 = yes, 0 = no)
 *  [4] uniqueCharRatio — unique characters / total characters
 *  [5] repetitionScore — repeated word ratio (0 = all unique, 1 = all repeated)
 *  [6] avgCharCodeNorm — average character code / 255
 *  [7] spaceRatio      — space characters / total characters
 *
 * No semantic meaning is assigned — only structural / statistical properties.
 */
export function extractTextFeatures(text: string): SensoryFeatureVector {
  if (text.length === 0) {
    return {
      values: Array(SENSORY_FEATURE_DIM).fill(0) as number[],
      dimension: SENSORY_FEATURE_DIM,
      normalized: true,
      featureNames: TEXT_FEATURE_NAMES,
    }
  }

  const len = text.length
  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // [0] char count norm
  const charCountNorm = Math.min(1, len / 300)

  // [1] word count norm
  const wordCountNorm = Math.min(1, wordCount / 80)

  // [2] question mark
  const hasQuestion = text.includes('?') ? 1 : 0

  // [3] exclamation mark
  const hasExclamation = text.includes('!') ? 1 : 0

  // [4] unique char ratio
  const uniqueChars = new Set(text).size
  const uniqueCharRatio = Math.min(1, uniqueChars / Math.max(len, 1))

  // [5] repetition score (repeated words / total words)
  const wordFreq = new Map<string, number>()
  for (const word of words) {
    const lower = word.toLowerCase()
    wordFreq.set(lower, (wordFreq.get(lower) ?? 0) + 1)
  }
  const repeatedWords = [...wordFreq.values()].filter(count => count > 1).length
  const repetitionScore = wordCount > 1 ? Math.min(1, repeatedWords / wordCount) : 0

  // [6] average char code normalized (cap to ASCII range for universality)
  let charCodeSum = 0
  for (let i = 0; i < Math.min(len, 64); i++) {
    charCodeSum += Math.min(127, text.charCodeAt(i))
  }
  const avgCharCodeNorm = charCodeSum / (Math.min(len, 64) * 127)

  // [7] space ratio
  const spaceCount = (text.match(/ /g) ?? []).length
  const spaceRatio = Math.min(1, spaceCount / Math.max(len, 1))

  return {
    values: [
      charCountNorm,
      wordCountNorm,
      hasQuestion,
      hasExclamation,
      uniqueCharRatio,
      repetitionScore,
      avgCharCodeNorm,
      spaceRatio,
    ],
    dimension: SENSORY_FEATURE_DIM,
    normalized: true,
    featureNames: TEXT_FEATURE_NAMES,
  }
}

export const TEXT_FEATURE_NAMES: string[] = [
  'charCountNorm',
  'wordCountNorm',
  'hasQuestion',
  'hasExclamation',
  'uniqueCharRatio',
  'repetitionScore',
  'avgCharCodeNorm',
  'spaceRatio',
]
