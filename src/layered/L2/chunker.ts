import type { L1Summary, TokenNode } from '../L1/types'
import type { ChunkNode, ChunkRole, L2Result } from './types'

type L1Result = {
  nodes: TokenNode[]
  summary: L1Summary
}

type BoundaryRole = Extract<ChunkRole, 'subject' | 'object'>

const SUBJECT_PARTICLES = new Set(['は', 'が', 'って'])
const OBJECT_PARTICLES = new Set(['を', 'に', 'へ', 'の'])
const PREDICATE_CATEGORIES = new Set(['verb', 'adjective', 'copula', 'auxiliary'])
const DOMINANT_ROLE_PRIORITY: ChunkRole[] = [
  'greeting',
  'predicate',
  'subject',
  'object',
  'modifier',
  'standalone',
  'unknown',
]

/**
 * Runs the L2 chunking layer on top of L1 token analysis.
 *
 * @param l1Result - Token-layer analysis result.
 * @returns Chunk-layer result with chunk summary.
 */
export function runL2(l1Result: L1Result): L2Result {
  const initialChunks = buildInitialChunks(l1Result.nodes)
  const chunks = assignChunkRoles(initialChunks, l1Result.summary)
  const summary = summarizeChunks(chunks, l1Result.summary)

  return {
    chunks,
    summary,
  }
}

/**
 * Builds initial chunks by scanning token boundaries and standalone markers.
 *
 * @param tokens - L1 token sequence.
 * @returns Chunks with provisional roles.
 */
function buildInitialChunks(tokens: TokenNode[]): ChunkNode[] {
  const chunks: ChunkNode[] = []
  let buffer: TokenNode[] = []
  let cursor = 0

  const flushBuffer = (): void => {
    if (buffer.length === 0) {
      return
    }

    chunks.push(createChunk(buffer, chunks.length, 'unknown'))
    buffer = []
  }

  while (cursor < tokens.length) {
    const token = tokens[cursor]
    if (!token) {
      cursor += 1
      continue
    }

    if (token.category === 'connector') {
      flushBuffer()
      chunks.push(createChunk([token], chunks.length, 'standalone'))
      cursor += 1
      continue
    }

    if (token.category === 'filler' || token.category === 'interjection') {
      flushBuffer()
      chunks.push(createChunk([token], chunks.length, 'standalone'))
      cursor += 1
      continue
    }

    const greetingSpan = getGreetingSpan(tokens, cursor)
    if (greetingSpan > 0) {
      flushBuffer()
      const greetingTokens = tokens.slice(cursor, cursor + greetingSpan)
      chunks.push(createChunk(greetingTokens, chunks.length, 'greeting'))
      cursor += greetingSpan
      continue
    }

    const boundary = getBoundary(tokens, cursor)
    if (boundary) {
      buffer.push(...tokens.slice(cursor, cursor + boundary.length))
      chunks.push(createChunk(buffer, chunks.length, boundary.role))
      buffer = []
      cursor += boundary.length
      continue
    }

    buffer.push(token)
    cursor += 1
  }

  flushBuffer()
  return chunks
}

/**
 * Creates a chunk node from a token slice.
 *
 * @param tokens - Tokens that belong to the chunk.
 * @param index - Chunk index.
 * @param role - Provisional chunk role.
 * @returns Chunk node.
 */
function createChunk(tokens: TokenNode[], index: number, role: ChunkRole): ChunkNode {
  return {
    tokens,
    surface: tokens.map(token => token.surface).join(''),
    index,
    role,
  }
}

/**
 * Detects subject or object boundary markers starting at a token index.
 *
 * @param tokens - Token sequence.
 * @param startIndex - Current scan position.
 * @returns Boundary metadata when a chunk should close, otherwise null.
 */
function getBoundary(
  tokens: TokenNode[],
  startIndex: number,
): { role: BoundaryRole; length: number } | null {
  const token = tokens[startIndex]
  if (!token) {
    return null
  }

  const nextToken = tokens[startIndex + 1]

  if (token.category === 'particle' && SUBJECT_PARTICLES.has(token.surface) && nextToken) {
    return { role: 'subject', length: 1 }
  }

  if (token.category === 'particle' && OBJECT_PARTICLES.has(token.surface) && nextToken) {
    return { role: 'object', length: 1 }
  }

  if (token.surface === 'って' && nextToken) {
    return { role: 'subject', length: 1 }
  }

  const markerSecond = tokens[startIndex + 1]
  const hasTrailingContent = startIndex + 2 < tokens.length
  if (token.surface === 'っ' && markerSecond?.surface === 'て' && hasTrailingContent) {
    return { role: 'subject', length: 2 }
  }

  return null
}

/**
 * Detects greeting-like spans such as `おはよう` or `元気ですか`.
 *
 * @param tokens - Token sequence.
 * @param startIndex - Scan position.
 * @returns Number of tokens in the greeting chunk.
 */
function getGreetingSpan(tokens: TokenNode[], startIndex: number): number {
  const firstToken = tokens[startIndex]
  if (!firstToken || !isGreetingLikeStart(firstToken)) {
    return 0
  }

  let span = 1
  const secondToken = tokens[startIndex + span]
  if (secondToken && secondToken.category === 'copula') {
    span += 1
  }

  const thirdToken = tokens[startIndex + span]
  if (thirdToken && thirdToken.category === 'particle' && thirdToken.surface === 'か') {
    span += 1
  }

  return span
}

/**
 * Checks whether a token can start a greeting-like chunk.
 *
 * @param token - Token to inspect.
 * @returns True when the token indicates a greeting chunk.
 */
function isGreetingLikeStart(token: TokenNode): boolean {
  return token.category === 'greeting' || token.surface === '元気'
}

/**
 * Assigns final roles to chunks after initial segmentation.
 *
 * @param chunks - Provisional chunks.
 * @param summary - L1 summary used for question detection.
 * @returns Final chunk list.
 */
function assignChunkRoles(chunks: ChunkNode[], summary: L1Summary): ChunkNode[] {
  const assigned = chunks.map(chunk => {
    if (chunk.role !== 'unknown') {
      return chunk
    }

    if (containsPredicateToken(chunk.tokens) || isPredicateLikeSurface(chunk.surface)) {
      return { ...chunk, role: 'predicate' }
    }

    return { ...chunk, role: 'modifier' }
  })

  const lastChunk = assigned[assigned.length - 1]
  if (!lastChunk || lastChunk.role === 'greeting') {
    return assigned
  }

  if (isQuestionChunk(lastChunk, summary)) {
    assigned[assigned.length - 1] = {
      ...lastChunk,
      role: 'question',
    }
  }

  return assigned
}

/**
 * Checks whether chunk tokens contain explicit predicate categories.
 *
 * @param tokens - Tokens inside a chunk.
 * @returns True when the chunk contains a predicate token.
 */
function containsPredicateToken(tokens: TokenNode[]): boolean {
  return tokens.some(token => PREDICATE_CATEGORIES.has(token.category))
}

/**
 * Applies lightweight surface heuristics for predicate-like chunks.
 *
 * @param surface - Chunk surface string.
 * @returns True when the chunk reads like a predicate.
 */
function isPredicateLikeSurface(surface: string): boolean {
  const normalized = surface.replace(/[。！？?!]+$/u, '')
  const core = normalized.replace(/[ねよな]+$/u, '')

  return (
    /(?:する|した|して|です|だ|である|だろう|かな|ください|教えて|やって|して)$/u.test(core) ||
    /[一-龯ァ-ヶー].*い$/u.test(core) ||
    /(つらい|嬉しい|悲しい|不安|怖い|寂しい|イライラ|疲れた|だるい)$/u.test(core)
  )
}

/**
 * Checks whether the last chunk should be treated as a question.
 *
 * @param chunk - Final chunk candidate.
 * @param summary - L1 summary.
 * @returns True when the chunk is question-like.
 */
function isQuestionChunk(chunk: ChunkNode, summary: L1Summary): boolean {
  const lastToken = chunk.tokens[chunk.tokens.length - 1]
  return Boolean(
    lastToken?.surface === 'か' ||
      summary.hasQuestion ||
      /[？?]$/u.test(chunk.surface),
  )
}

/**
 * Builds the L2 summary from finalized chunks.
 *
 * @param chunks - Final chunk list.
 * @param summary - L1 summary.
 * @returns Chunk summary.
 */
function summarizeChunks(chunks: ChunkNode[], summary: L1Summary): L2Result['summary'] {
  const roles = chunks.map(chunk => chunk.role)
  const hasSubject = roles.includes('subject')
  const hasPredicate = roles.includes('predicate')
  const hasQuestion = roles.includes('question') || isQuestionChunk(chunks[chunks.length - 1] ?? createChunk([], 0, 'unknown'), summary)
  const hasConnector = chunks.some(
    chunk => chunk.role === 'standalone' && chunk.tokens.some(token => token.category === 'connector'),
  )
  const endsWithConnector = chunks[chunks.length - 1]?.tokens.some(token => token.category === 'connector') ?? false
  const dominantRole = DOMINANT_ROLE_PRIORITY.find(role => roles.includes(role)) ?? 'unknown'
  const isComplete = !endsWithConnector && (hasPredicate || hasQuestion || roles.includes('greeting'))

  return {
    chunkCount: chunks.length,
    roles,
    isOneChunk: chunks.length === 1,
    hasSubject,
    hasPredicate,
    hasQuestion,
    hasConnector,
    isComplete,
    dominantRole,
  }
}
