import type { TokenNode } from '../L1/types'

export type ChunkRole =
  | 'subject'
  | 'object'
  | 'predicate'
  | 'greeting'
  | 'question'
  | 'modifier'
  | 'standalone'
  | 'unknown'

export type ChunkNode = {
  tokens: TokenNode[]
  surface: string
  index: number
  role: ChunkRole
}

export type L2Summary = {
  chunkCount: number
  roles: ChunkRole[]
  isOneChunk: boolean
  hasSubject: boolean
  hasPredicate: boolean
  hasQuestion: boolean
  hasConnector: boolean
  isComplete: boolean
  dominantRole: ChunkRole
}

export type L2Result = {
  chunks: ChunkNode[]
  summary: L2Summary
}
