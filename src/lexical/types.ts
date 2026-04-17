import type { MeaningChunk } from '../signal/ingest/chunkTypes'

export type LexicalState = {
  chunks: MeaningChunk[]
  explicitQuestion: boolean
  requestType?: 'advice' | 'reflection' | 'comfort' | 'choice'
  optionLabels?: string[]
  explicitEntities?: string[]
  explicitTensions?: string[]
  syntaxHints?: string[]
}
