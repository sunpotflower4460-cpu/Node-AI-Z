/**
 * L1 Layer: Token Layer Types
 *
 * This layer handles tokenization and word-level classification.
 * It builds on L0 character analysis to identify meaningful word units.
 */

/**
 * Token category classification for L1 layer
 */
export type TokenCategory =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'particle'
  | 'copula'
  | 'auxiliary'
  | 'greeting'
  | 'filler'
  | 'interjection'
  | 'connector'
  | 'unknown'

/**
 * Token node representing a word or morpheme with metadata
 */
export type TokenNode = {
  /** The surface form of the token */
  surface: string
  /** Position in the token sequence */
  index: number
  /** Grammatical category of the token */
  category: TokenCategory
  /** Length in characters */
  length: number
  /** Whether this is the first token in the sequence */
  isFirstToken: boolean
  /** Whether this is the last token in the sequence */
  isLastToken: boolean
}

/**
 * Summary statistics for L1 token analysis
 */
export type L1Summary = {
  /** Total number of tokens */
  tokenCount: number
  /** Distribution of token categories */
  categoryDistribution: Record<TokenCategory, number>
  /** Whether the text contains greeting words */
  hasGreeting: boolean
  /** Whether the text contains question particles */
  hasQuestion: boolean
  /** Whether the text contains negation */
  hasNegation: boolean
  /** Whether the text contains filler words */
  hasFiller: boolean
  /** The most common token category */
  dominantCategory: TokenCategory
  /** List of greeting tokens found */
  greetingTokens: string[]
}
