import type { ChunkNode, L2Result } from '../L2/types'
import type { L3Result, SentenceNode, SentenceType } from './types'

const QUESTION_WORDS = ['何', 'どこ', 'いつ', '誰']
const FEELING_WORDS = [
  'モヤモヤ',
  'つらい',
  '嬉しい',
  '悲しい',
  '不安',
  '怖い',
  '寂しい',
  'イライラ',
  '疲れた',
  'だるい',
]
const REQUEST_WORDS = ['教えて', 'やって', 'して', 'ください', 'お願い']
const SECOND_PERSON_WORDS = ['あなた', '君', 'お前', 'そっち']
const FIRST_PERSON_WORDS = ['自分', '俺', '私', '僕']
const TRAILING_ENDINGS = ['けど', 'だけど', 'んだけど', 'けれど']

/**
 * Runs sentence-level analysis on L2 chunks.
 *
 * @param l2Result - Chunk-layer result.
 * @param turnCount - Conversation turn count.
 * @returns Sentence-layer analysis result.
 */
export function runL3(l2Result: L2Result, turnCount: number): L3Result {
  const sentences = splitSentences(l2Result.chunks).map(chunks => buildSentenceNode(chunks))
  const lastSentence = sentences[sentences.length - 1]

  return {
    sentences,
    overallType: lastSentence?.sentenceType ?? 'unknown',
    overallCompleteness: lastSentence?.completeness ?? 'fragment',
    isMultiSentence: sentences.length > 1,
    turnCount,
  }
}

/**
 * Splits chunk arrays into sentence groups using `。` boundaries.
 *
 * @param chunks - Chunk sequence.
 * @returns Sentence chunk groups.
 */
function splitSentences(chunks: ChunkNode[]): ChunkNode[][] {
  if (chunks.length === 0) {
    return [[]]
  }

  const sentences: ChunkNode[][] = []
  let current: ChunkNode[] = []

  for (const chunk of chunks) {
    current.push(chunk)
    if (chunk.surface.includes('。')) {
      sentences.push(current)
      current = []
    }
  }

  if (current.length > 0) {
    sentences.push(current)
  }

  return sentences
}

/**
 * Builds a sentence node from a chunk group.
 *
 * @param chunks - Chunks that compose one sentence.
 * @returns Sentence node.
 */
function buildSentenceNode(chunks: ChunkNode[]): SentenceNode {
  const surface = chunks.map(chunk => chunk.surface).join('')
  const sentenceType = determineSentenceType(chunks, surface)
  const completeness = determineCompleteness(chunks, sentenceType)
  const addressee = determineAddressee(chunks, surface, sentenceType)

  return {
    chunks,
    surface,
    sentenceType,
    completeness,
    addressee,
  }
}

/**
 * Determines the sentence type from chunk roles and lexical cues.
 *
 * @param chunks - Sentence chunks.
 * @param surface - Joined sentence surface.
 * @returns Sentence type.
 */
function determineSentenceType(chunks: ChunkNode[], surface: string): SentenceType {
  const hasGreeting = chunks.some(chunk => chunk.role === 'greeting')
  const questionLike = isQuestionLikeSentence(chunks, surface)
  const hasQuestionWord = QUESTION_WORDS.some(word => surface.includes(word))
  const hasFeelingWord = FEELING_WORDS.some(word => surface.includes(word))
  const hasRequestWord = REQUEST_WORDS.some(word => surface.includes(word))
  const hasOpinionCue = surface.includes('だろう') || surface.includes('かな')
  const standaloneOnly = chunks.length > 0 && chunks.every(chunk => chunk.role === 'standalone')
  const trailing = isTrailingSurface(surface) || endsWithConnector(chunks)
  const hasTopicStructure = chunks.some(chunk => chunk.role === 'subject' || chunk.role === 'object')

  if (hasGreeting && questionLike) {
    return 'greeting_question'
  }

  if (hasGreeting) {
    return 'greeting'
  }

  if (hasRequestWord) {
    return 'request'
  }

  if (hasFeelingWord) {
    return 'feeling_expression'
  }

  if (questionLike && hasOpinionCue) {
    return 'opinion_question'
  }

  if (questionLike && hasQuestionWord && hasTopicStructure) {
    return 'information_question'
  }

  if (questionLike) {
    return 'opinion_question'
  }

  if (standaloneOnly) {
    return 'reaction'
  }

  if (trailing) {
    return 'continuation'
  }

  if (chunks.length > 0) {
    return 'statement'
  }

  return 'unknown'
}

/**
 * Determines sentence completeness.
 *
 * @param chunks - Sentence chunks.
 * @param sentenceType - Chosen sentence type.
 * @returns Completeness label.
 */
function determineCompleteness(
  chunks: ChunkNode[],
  sentenceType: SentenceType,
): SentenceNode['completeness'] {
  const surface = chunks.map(chunk => chunk.surface).join('')
  const hasPredicate = chunks.some(chunk => chunk.role === 'predicate')
  const hasGreeting = chunks.some(chunk => chunk.role === 'greeting')
  const questionLike = isQuestionLikeSentence(chunks, surface)

  if (endsWithConnector(chunks) || isTrailingSurface(surface) || sentenceType === 'continuation') {
    return 'trailing'
  }

  if (hasPredicate || hasGreeting || questionLike || sentenceType === 'request' || sentenceType === 'statement') {
    return 'complete'
  }

  return 'fragment'
}

/**
 * Determines the likely addressee of the sentence.
 *
 * @param chunks - Sentence chunks.
 * @param surface - Joined sentence surface.
 * @param sentenceType - Chosen sentence type.
 * @returns Addressee label.
 */
function determineAddressee(
  chunks: ChunkNode[],
  surface: string,
  sentenceType: SentenceType,
): SentenceNode['addressee'] {
  const hasSecondPerson = SECOND_PERSON_WORDS.some(word => surface.includes(word))
  const hasFirstPerson = FIRST_PERSON_WORDS.some(word => surface.includes(word))
  const hasFeelingWord = FEELING_WORDS.some(word => surface.includes(word))

  if (hasSecondPerson || sentenceType === 'greeting_question' || sentenceType === 'greeting' || sentenceType === 'request') {
    return 'me'
  }

  if (sentenceType === 'feeling_expression' || (hasFirstPerson && hasFeelingWord)) {
    return 'self'
  }

  if (
    sentenceType === 'information_question' ||
    sentenceType === 'opinion_question' ||
    sentenceType === 'statement'
  ) {
    return 'general'
  }

  if (chunks.length === 0) {
    return 'unknown'
  }

  return 'unknown'
}

/**
 * Checks whether a sentence is question-like.
 *
 * @param chunks - Sentence chunks.
 * @param surface - Joined sentence surface.
 * @returns True when the sentence reads as a question.
 */
function isQuestionLikeSentence(chunks: ChunkNode[], surface: string): boolean {
  const lastChunk = chunks[chunks.length - 1]
  return Boolean(
    chunks.some(chunk => chunk.role === 'question') ||
      /[？?]$/u.test(surface) ||
      lastChunk?.surface.endsWith('か') ||
      surface.includes('だろう') ||
      surface.includes('かな'),
  )
}

/**
 * Checks whether the sentence ends in a standalone connector chunk.
 *
 * @param chunks - Sentence chunks.
 * @returns True when the sentence ends with a connector.
 */
function endsWithConnector(chunks: ChunkNode[]): boolean {
  const lastChunk = chunks[chunks.length - 1]
  return Boolean(lastChunk?.tokens.some(token => token.category === 'connector'))
}

/**
 * Checks whether a surface string ends with a trailing expression.
 *
 * @param surface - Sentence surface.
 * @returns True when the sentence has trailing phrasing.
 */
function isTrailingSurface(surface: string): boolean {
  return TRAILING_ENDINGS.some(ending => surface.endsWith(ending))
}
