/**
 * L0 Layer: Character Layer Types
 *
 * This layer handles individual character classification and analysis.
 * It provides the foundation for higher-level linguistic processing.
 */

/**
 * Character kind classification for L0 layer
 */
export type CharKind =
  | 'hiragana'
  | 'katakana'
  | 'kanji'
  | 'ascii_letter'
  | 'digit'
  | 'punctuation'
  | 'symbol'
  | 'whitespace'
  | 'newline'
  | 'unknown'

/**
 * Character node representing a single character with metadata
 */
export type CharNode = {
  /** The character itself */
  char: string
  /** Position in the input text */
  index: number
  /** Classification of the character */
  kind: CharKind
  /** Whether this character is a repetition of the previous one */
  isRepeat: boolean
  /** Whether this character is at the end of a line */
  isLineEnd: boolean
}

/**
 * Summary statistics for L0 character analysis
 */
export type L0Summary = {
  /** Total number of characters processed */
  totalChars: number
  /** Distribution of character kinds */
  kindDistribution: Record<CharKind, number>
  /** Number of repeated characters */
  repeatCount: number
  /** Whether the text ends with punctuation */
  endsWithPunctuation: boolean
  /** The last character in the text, or null if empty */
  endChar: string | null
  /** Whether the text contains exclamation marks */
  hasExclamation: boolean
  /** Whether the text contains question marks */
  hasQuestion: boolean
  /** Whether the text contains ellipsis (…) */
  hasEllipsis: boolean
  /** Whether the text contains emoji */
  hasEmoji: boolean
}
