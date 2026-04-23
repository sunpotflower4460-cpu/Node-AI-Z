import type { BrainState } from '../brainState'
import type { ChunkNode } from '../L2/types'
import type { L3Result, SentenceNode, SentenceType } from '../L3/types'
import type { L4Result, NeedType, SemanticFrame } from './types'

const TRAILING_PARTICLE_PATTERN = /(って|は|が|を|に|へ|ね|よ|な|か|の|も|で|と)$/u
const ENDING_PARTICLE_PATTERN = /[。！？?!]+$/u
const SOFT_ENDING_PATTERN = /(ね|よ|な)$/u
const FEELING_CUES = ['モヤモヤ', 'つらい', '嬉しい', '悲しい', '不安', '怖い', '寂しい', 'イライラ', '疲れた', 'だるい']

/**
 * Interprets sentence-layer output into a semantic frame.
 *
 * @param l3Result - Sentence-layer result.
 * @param brainState - Current brain state.
 * @returns Semantic interpretation result.
 */
export function runL4(l3Result: L3Result, brainState: BrainState): L4Result {
  const sentence = l3Result.sentences[l3Result.sentences.length - 1]
  const sentenceType = sentence?.sentenceType ?? 'unknown'
  const need = determineNeed(sentenceType, brainState)
  const gist = buildGist(sentence, sentenceType, need)
  const currentTopic = extractTopicFromSentence(sentence)
  const relation = determineRelation(brainState.lastSemantic, currentTopic, need, sentenceType)
  const contextModifier = determineContextModifier(brainState, need, sentenceType)

  return {
    frame: {
      gist,
      need,
      contextModifier,
      relation,
    },
  }
}

/**
 * Maps sentence types onto semantic needs.
 *
 * @param sentenceType - Sentence classification.
 * @param brainState - Current brain state.
 * @returns Semantic need.
 */
function determineNeed(sentenceType: SentenceType, brainState: BrainState): NeedType {
  switch (sentenceType) {
    case 'greeting_question':
    case 'greeting':
    case 'reaction':
      return 'connection'
    case 'information_question':
      return 'information'
    case 'feeling_expression':
      return 'expression'
    case 'opinion_question':
      return 'reflection'
    case 'request':
      return 'action'
    case 'statement':
      return 'acknowledgment'
    case 'continuation':
      return brainState.lastSemantic?.need ?? 'unclear'
    case 'unknown':
    default:
      return 'unclear'
  }
}

/**
 * Builds a short rule-based gist for the latest sentence.
 *
 * @param sentence - Latest sentence node.
 * @param sentenceType - Sentence classification.
 * @param need - Interpreted semantic need.
 * @returns Short semantic gist.
 */
function buildGist(sentence: SentenceNode | undefined, sentenceType: SentenceType, need: NeedType): string {
  if (!sentence) {
    return '何を言おうとしているかまだ曖昧'
  }

  const topic = extractTopicFromSentence(sentence)
  const feeling = extractFeelingCue(sentence.surface) ?? topic
  const requestText = normalizeStatement(sentence.surface)
  const statementText = normalizeStatement(sentence.surface)

  switch (sentenceType) {
    case 'greeting_question':
      return `挨拶として${appendQuestionTopic(topic)}を聞いている`
    case 'information_question':
      return `${topic || '何か'}について知りたい`
    case 'feeling_expression':
      return `${feeling || '何か'}という気持ちを出している`
    case 'opinion_question':
      return `${topic || '何か'}について一緒に考えたい`
    case 'request':
      return `${requestText || '何か'}を求めている`
    case 'statement':
      return `${statementText || topic || '何か'}と述べている`
    case 'greeting':
      return '挨拶している'
    case 'continuation':
      return '前の話の続きを言おうとしている'
    case 'reaction':
      return '相槌を打っている'
    case 'unknown':
    default:
      return need === 'unclear' ? '何を言おうとしているかまだ曖昧' : `${topic || '何か'}を伝えようとしている`
  }
}

/**
 * Determines the discourse relation to the previous semantic frame.
 *
 * @param previousFrame - Previous semantic frame.
 * @param currentTopic - Current lightweight topic string.
 * @param need - Current semantic need.
 * @param sentenceType - Current sentence type.
 * @returns Discourse relation label.
 */
function determineRelation(
  previousFrame: SemanticFrame | null,
  currentTopic: string,
  need: NeedType,
  sentenceType: SentenceType,
): SemanticFrame['relation'] {
  if (previousFrame === null) {
    return 'new_topic'
  }

  const previousTopic = extractTopicFromGist(previousFrame.gist)
  const sameTopic = topicsAreSimilar(previousTopic, currentTopic)

  if (sameTopic && isDeepening(previousFrame.need, need)) {
    return 'deepening'
  }

  if (sentenceType === 'continuation' || sameTopic) {
    return 'continuation'
  }

  if (isResponseLike(previousFrame.need, need, sentenceType)) {
    return 'response'
  }

  return 'shift'
}

/**
 * Determines whether a special context modifier should be attached.
 *
 * @param brainState - Current brain state.
 * @param need - Current semantic need.
 * @param sentenceType - Current sentence type.
 * @returns Context modifier string when applicable.
 */
function determineContextModifier(
  brainState: BrainState,
  need: NeedType,
  sentenceType: SentenceType,
): string | null {
  if (
    brainState.mood === 'heavy' &&
    need === 'connection' &&
    (sentenceType === 'greeting' || sentenceType === 'greeting_question')
  ) {
    return '前のターンが重かったので、気遣いの可能性'
  }

  return null
}

/**
 * Extracts a lightweight topic from a sentence.
 *
 * @param sentence - Sentence node.
 * @returns Normalized topic string.
 */
function extractTopicFromSentence(sentence: SentenceNode | undefined): string {
  if (!sentence) {
    return ''
  }

  const prioritizedChunk =
    sentence.chunks.find(chunk => chunk.role === 'subject') ??
    sentence.chunks.find(chunk => chunk.role === 'object') ??
    sentence.chunks.find(chunk => chunk.role === 'modifier')

  const candidate = prioritizedChunk?.surface ?? sentence.surface
  return normalizeTopic(candidate)
}

/**
 * Extracts a coarse topic from a gist string.
 *
 * @param gist - Semantic gist.
 * @returns Topic-like phrase.
 */
function extractTopicFromGist(gist: string): string {
  const patterns = [
    'について知りたい',
    'について一緒に考えたい',
    'という気持ちを出している',
    'を求めている',
    'と述べている',
    'として',
  ]

  for (const pattern of patterns) {
    const index = gist.indexOf(pattern)
    if (index > 0) {
      return normalizeTopic(gist.slice(0, index))
    }
  }

  return normalizeTopic(gist)
}

/**
 * Normalizes a topic phrase for comparison and reuse.
 *
 * @param value - Topic candidate.
 * @returns Normalized topic string.
 */
function normalizeTopic(value: string): string {
  const compact = value.replace(/[。！？?!]/gu, '')
  const trimmed = compact.replace(TRAILING_PARTICLE_PATTERN, '')
  return trimmed.trim()
}

/**
 * Normalizes a sentence surface for gist phrasing.
 *
 * @param surface - Raw sentence surface.
 * @returns Cleaned sentence text.
 */
function normalizeStatement(surface: string): string {
  return surface.replace(ENDING_PARTICLE_PATTERN, '').replace(SOFT_ENDING_PATTERN, '').trim()
}

/**
 * Builds a topic phrase for greeting questions.
 *
 * @param topic - Normalized topic.
 * @returns Topic phrase that reads as a question target.
 */
function appendQuestionTopic(topic: string): string {
  if (!topic) {
    return '様子'
  }

  return topic.endsWith('か') ? topic : `${topic}か`
}

/**
 * Finds a feeling cue from surface text.
 *
 * @param surface - Raw sentence surface.
 * @returns Feeling cue when found.
 */
function extractFeelingCue(surface: string): string | null {
  return FEELING_CUES.find(cue => surface.includes(cue)) ?? null
}

/**
 * Checks whether two lightweight topics are similar enough.
 *
 * @param previousTopic - Previous topic.
 * @param currentTopic - Current topic.
 * @returns True when the topics overlap.
 */
function topicsAreSimilar(previousTopic: string, currentTopic: string): boolean {
  if (!previousTopic || !currentTopic) {
    return false
  }

  return previousTopic === currentTopic || previousTopic.includes(currentTopic) || currentTopic.includes(previousTopic)
}

/**
 * Checks whether the conversation is moving into a deeper mode on the same topic.
 *
 * @param previousNeed - Previous semantic need.
 * @param currentNeed - Current semantic need.
 * @returns True when the newer turn feels deeper.
 */
function isDeepening(previousNeed: NeedType, currentNeed: NeedType): boolean {
  if (currentNeed === 'reflection' && previousNeed !== 'reflection') {
    return true
  }

  return currentNeed === 'expression' && previousNeed !== 'expression'
}

/**
 * Checks whether the latest turn looks like a response to the previous one.
 *
 * @param previousNeed - Previous semantic need.
 * @param currentNeed - Current semantic need.
 * @param sentenceType - Current sentence type.
 * @returns True when the turn feels responsive.
 */
function isResponseLike(previousNeed: NeedType, currentNeed: NeedType, sentenceType: SentenceType): boolean {
  if (!['connection', 'information', 'reflection', 'action'].includes(previousNeed)) {
    return false
  }

  return ['acknowledgment', 'expression', 'connection'].includes(currentNeed) || sentenceType === 'statement'
}
