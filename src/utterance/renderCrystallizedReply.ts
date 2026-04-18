import type { CrystallizedSentencePlan, UtteranceIntent, LexicalPulls } from './types'

export type RenderCrystallizedReplyInput = {
  sentencePlan: CrystallizedSentencePlan
  utteranceIntent: UtteranceIntent
  lexicalPulls: LexicalPulls
}

/**
 * Render the final crystallized reply from the sentence plan
 *
 * Assembles the components into a natural utterance, respecting the intent
 * and avoiding patterns flagged in lexicalPulls.
 */
export const renderCrystallizedReply = ({
  sentencePlan,
  utteranceIntent,
  lexicalPulls,
}: RenderCrystallizedReplyInput): string => {
  const parts: string[] = []
  let sentenceCount = 0
  const maxSentences = 5 // Safety limit

  // Add opening
  if (sentencePlan.opening) {
    parts.push(sentencePlan.opening)
    sentenceCount++
  }

  // Add core content
  if (sentencePlan.core && sentenceCount < maxSentences) {
    parts.push(sentencePlan.core)
    sentenceCount++
  }

  // Add option frame
  if (sentencePlan.optionFrame && sentenceCount < maxSentences) {
    parts.push(sentencePlan.optionFrame)
    sentenceCount++
  }

  // Add answer
  if (sentencePlan.answer && sentenceCount < maxSentences) {
    parts.push(sentencePlan.answer)
    sentenceCount++
  }

  // Add bridge
  if (sentencePlan.bridge && sentenceCount < maxSentences) {
    parts.push(sentencePlan.bridge)
    sentenceCount++
  }

  // Add close
  if (sentencePlan.close && sentenceCount < maxSentences) {
    parts.push(sentencePlan.close)
    sentenceCount++
  }

  // Assemble into natural text
  let reply = assembleParts(parts, utteranceIntent, lexicalPulls)

  // Apply final polish
  reply = applyFinalPolish(reply, lexicalPulls)

  return reply || 'そうですね'  // Fallback
}

/**
 * Assemble parts into natural flowing text
 */
function assembleParts(
  parts: string[],
  intent: UtteranceIntent,
  pulls: LexicalPulls,
): string {
  if (parts.length === 0) {
    return ''
  }

  if (parts.length === 1) {
    return parts[0] + '。'
  }

  // For structured answer, use clear connectors
  if (intent.primaryMove === 'structured_answer' && intent.structureNeed > 0.6) {
    return parts.join('。') + '。'
  }

  // For option compare/bridge, connect with option language
  if (intent.primaryMove === 'option_compare' || intent.primaryMove === 'bridge_suggest') {
    return connectWithOptionLanguage(parts, pulls)
  }

  // For hold/reflect, keep it minimal
  if (intent.primaryMove === 'hold' || intent.primaryMove === 'reflect') {
    return parts.slice(0, 2).join('、') + '。'
  }

  // Default: gentle connection
  return connectGently(parts, intent)
}

function connectWithOptionLanguage(parts: string[], pulls: LexicalPulls): string {
  const connectors = ['、そして', '。一方で', '。でも']

  if (parts.length === 2) {
    return `${parts[0]}${connectors[0]}${parts[1]}。`
  }

  const result: string[] = []
  for (let i = 0; i < parts.length; i++) {
    result.push(parts[i])
    if (i < parts.length - 1) {
      result.push(connectors[i % connectors.length])
    }
  }
  return result.join('') + '。'
}

function connectGently(parts: string[], intent: UtteranceIntent): string {
  // Use minimal connectors for gentle flow
  if (intent.warmth > 0.6) {
    return parts.join('、') + '。'
  }

  // Use more neutral connectors
  return parts.join('。') + '。'
}

/**
 * Apply final polish to avoid unwanted patterns
 */
function applyFinalPolish(reply: string, pulls: LexicalPulls): string {
  let polished = reply

  // Avoid over-explaining patterns
  if (pulls.avoidOverexplaining) {
    polished = polished.replace(/のように見えます。のように/g, 'で、')
    polished = polished.replace(/と思います。と思/g, 'で、')
  }

  // Avoid flat summary patterns
  if (pulls.avoidFlatSummary) {
    polished = polished.replace(/要するに/g, '')
    polished = polished.replace(/まとめると/g, '')
  }

  // Avoid therapy tone patterns
  if (pulls.avoidTherapyTone) {
    polished = polished.replace(/いろんな気持ちが/g, '')
    polished = polished.replace(/〜なんですね。/g, '。')
  }

  // Clean up double punctuation
  polished = polished.replace(/。。+/g, '。')
  polished = polished.replace(/、、+/g, '、')

  // Clean up trailing connectors
  polished = polished.replace(/、。/g, '。')
  polished = polished.replace(/。、/g, '。')

  return polished.trim()
}
