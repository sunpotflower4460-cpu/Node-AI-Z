/**
 * surfaceGuard.ts
 *
 * Ray template repetition detector.
 * Prevents abstract template phrases from repeating across consecutive turns.
 * Does NOT ban phrases outright - only detects short-term repetition patterns.
 */

type RepetitionEntry = {
  phrase: string
  turnIndex: number
  count: number
}

const RAY_TEMPLATE_PATTERNS = [
  'かもしれませんね',
  '静かに思いました',
  'と見ることもできるかもしれません',
  '新しい空気が生まれる',
  'そのままの感じ',
  '急いで',
  'よさそうです',
  'ここにいて',
  '大丈夫です',
] as const

const SIMILARITY_THRESHOLD = 0.75 // Jaccard similarity threshold for near-matches
const REPETITION_WINDOW = 5 // Number of recent turns to check
const REPETITION_LIMIT = 3 // Max times a pattern can appear in window

/**
 * Simple Jaccard similarity for phrase comparison
 */
function computeJaccardSimilarity(a: string, b: string): number {
  const tokensA = new Set(a.split(''))
  const tokensB = new Set(b.split(''))
  const intersection = new Set([...tokensA].filter((x) => tokensB.has(x)))
  const union = new Set([...tokensA, ...tokensB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

/**
 * Check if phrase matches any known Ray template patterns (exact or similar)
 */
function matchesTemplatePattern(phrase: string): string | null {
  for (const pattern of RAY_TEMPLATE_PATTERNS) {
    if (phrase.includes(pattern)) {
      return pattern
    }
    if (computeJaccardSimilarity(phrase, pattern) >= SIMILARITY_THRESHOLD) {
      return pattern
    }
  }
  return null
}

/**
 * Surface guard state (stored across turns)
 */
export type SurfaceGuardState = {
  recentPhrases: RepetitionEntry[]
  turnCount: number
  guardRerunCount: number
}

export function createSurfaceGuardState(): SurfaceGuardState {
  return {
    recentPhrases: [],
    turnCount: 0,
    guardRerunCount: 0,
  }
}

/**
 * Check utterance for template repetition.
 * Returns null if no issues, or a warning object if repetition detected.
 */
export function checkTemplateRepetition(
  utterance: string,
  guardState: SurfaceGuardState,
): { shouldRegenerate: boolean; repeatedPattern: string; risk: 'low' | 'medium' | 'high' } | null {
  const matchedPattern = matchesTemplatePattern(utterance)
  if (!matchedPattern) {
    return null
  }

  // Check recent history for this pattern
  const recentOccurrences = guardState.recentPhrases.filter(
    (entry) => entry.phrase === matchedPattern && guardState.turnCount - entry.turnIndex <= REPETITION_WINDOW,
  )

  const occurrenceCount = recentOccurrences.length

  if (occurrenceCount >= REPETITION_LIMIT) {
    return {
      shouldRegenerate: true,
      repeatedPattern: matchedPattern,
      risk: 'high',
    }
  }

  if (occurrenceCount >= 2) {
    return {
      shouldRegenerate: false,
      repeatedPattern: matchedPattern,
      risk: 'medium',
    }
  }

  return {
    shouldRegenerate: false,
    repeatedPattern: matchedPattern,
    risk: 'low',
  }
}

/**
 * Record utterance in guard state history
 */
export function recordUtterance(utterance: string, guardState: SurfaceGuardState): void {
  const matchedPattern = matchesTemplatePattern(utterance)
  if (matchedPattern) {
    guardState.recentPhrases.push({
      phrase: matchedPattern,
      turnIndex: guardState.turnCount,
      count: 1,
    })
  }
  guardState.turnCount += 1

  // Prune old entries outside the window
  const cutoff = guardState.turnCount - REPETITION_WINDOW
  guardState.recentPhrases = guardState.recentPhrases.filter((entry) => entry.turnIndex > cutoff)
}

/**
 * Increment guard rerun counter
 */
export function incrementGuardRerun(guardState: SurfaceGuardState): void {
  guardState.guardRerunCount += 1
}
