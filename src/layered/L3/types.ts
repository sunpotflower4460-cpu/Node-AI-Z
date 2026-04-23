import type { ChunkNode } from '../L2/types'

export type SentenceType =
  | 'greeting_question'
  | 'information_question'
  | 'feeling_expression'
  | 'opinion_question'
  | 'request'
  | 'statement'
  | 'greeting'
  | 'continuation'
  | 'reaction'
  | 'unknown'

export type SentenceNode = {
  chunks: ChunkNode[]
  surface: string
  sentenceType: SentenceType
  completeness: 'complete' | 'trailing' | 'fragment'
  addressee: 'me' | 'general' | 'self' | 'unknown'
}

export type L3Result = {
  sentences: SentenceNode[]
  overallType: SentenceType
  overallCompleteness: 'complete' | 'trailing' | 'fragment'
  isMultiSentence: boolean
  turnCount: number
}
