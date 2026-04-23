/**
 * L1 Layer: Dictionary
 *
 * Provides basic Japanese word dictionary for tokenization.
 * This is a rule-based dictionary with common Japanese words.
 */

import type { TokenCategory } from './types'

/**
 * Dictionary entry with surface form and category
 */
export type DictEntry = {
  surface: string
  category: TokenCategory
}

/**
 * Basic Japanese word dictionary
 * Organized by category for efficient lookup
 */
const dictionary: DictEntry[] = [
  // Greetings
  { surface: 'こんにちは', category: 'greeting' },
  { surface: 'おはよう', category: 'greeting' },
  { surface: 'こんばんは', category: 'greeting' },
  { surface: 'さようなら', category: 'greeting' },
  { surface: 'ありがとう', category: 'greeting' },
  { surface: 'すみません', category: 'greeting' },
  { surface: 'ごめんなさい', category: 'greeting' },
  { surface: 'お疲れ様', category: 'greeting' },
  { surface: 'お疲れさま', category: 'greeting' },

  // Common nouns
  { surface: '元気', category: 'noun' },
  { surface: '最近', category: 'noun' },
  { surface: '今日', category: 'noun' },
  { surface: '明日', category: 'noun' },
  { surface: '昨日', category: 'noun' },
  { surface: '気持ち', category: 'noun' },
  { surface: '時間', category: 'noun' },
  { surface: '場所', category: 'noun' },

  // Copula
  { surface: 'です', category: 'copula' },
  { surface: 'だ', category: 'copula' },
  { surface: 'である', category: 'copula' },

  // Particles
  { surface: 'は', category: 'particle' },
  { surface: 'が', category: 'particle' },
  { surface: 'を', category: 'particle' },
  { surface: 'に', category: 'particle' },
  { surface: 'へ', category: 'particle' },
  { surface: 'で', category: 'particle' },
  { surface: 'と', category: 'particle' },
  { surface: 'か', category: 'particle' },
  { surface: 'の', category: 'particle' },
  { surface: 'や', category: 'particle' },
  { surface: 'も', category: 'particle' },
  { surface: 'ね', category: 'particle' },
  { surface: 'よ', category: 'particle' },
  { surface: 'な', category: 'particle' },

  // Auxiliary verbs
  { surface: 'ます', category: 'auxiliary' },
  { surface: 'ました', category: 'auxiliary' },
  { surface: 'ません', category: 'auxiliary' },
  { surface: 'ない', category: 'auxiliary' },
  { surface: 'た', category: 'auxiliary' },
  { surface: 'て', category: 'auxiliary' },

  // Verbs
  { surface: 'する', category: 'verb' },
  { surface: 'いる', category: 'verb' },
  { surface: 'ある', category: 'verb' },
  { surface: '行く', category: 'verb' },
  { surface: '来る', category: 'verb' },
  { surface: '見る', category: 'verb' },
  { surface: '聞く', category: 'verb' },
  { surface: '言う', category: 'verb' },
  { surface: '思う', category: 'verb' },
  { surface: '感じる', category: 'verb' },

  // Adjectives
  { surface: 'いい', category: 'adjective' },
  { surface: '良い', category: 'adjective' },
  { surface: '悪い', category: 'adjective' },
  { surface: '大きい', category: 'adjective' },
  { surface: '小さい', category: 'adjective' },

  // Fillers
  { surface: 'えー', category: 'filler' },
  { surface: 'あの', category: 'filler' },
  { surface: 'その', category: 'filler' },
  { surface: 'まあ', category: 'filler' },

  // Interjections
  { surface: 'あ', category: 'interjection' },
  { surface: 'ああ', category: 'interjection' },
  { surface: 'うん', category: 'interjection' },
  { surface: 'へえ', category: 'interjection' },

  // Connectors
  { surface: 'そして', category: 'connector' },
  { surface: 'しかし', category: 'connector' },
  { surface: 'でも', category: 'connector' },
  { surface: 'だから', category: 'connector' },
  { surface: 'それで', category: 'connector' },
  { surface: 'けど', category: 'connector' },
  { surface: 'けれど', category: 'connector' },

  // Additional common words for test cases
  { surface: 'なんか', category: 'filler' },
  { surface: 'モヤモヤ', category: 'noun' },
  { surface: 'だけど', category: 'connector' },
]

/**
 * Looks up a word in the dictionary
 *
 * @param surface - Surface form to look up
 * @returns Dictionary entry if found, undefined otherwise
 */
export function lookupWord(surface: string): DictEntry | undefined {
  return dictionary.find(entry => entry.surface === surface)
}

/**
 * Checks if a surface form is in the dictionary
 *
 * @param surface - Surface form to check
 * @returns True if the word is in the dictionary
 */
export function hasWord(surface: string): boolean {
  return dictionary.some(entry => entry.surface === surface)
}

/**
 * Gets all dictionary entries of a specific category
 *
 * @param category - Token category to filter by
 * @returns Array of dictionary entries matching the category
 */
export function getEntriesByCategory(category: TokenCategory): DictEntry[] {
  return dictionary.filter(entry => entry.category === category)
}

/**
 * Checks if a word is a greeting
 *
 * @param surface - Surface form to check
 * @returns True if the word is a greeting
 */
export function isGreeting(surface: string): boolean {
  const entry = lookupWord(surface)
  return entry?.category === 'greeting'
}

/**
 * Checks if a word is a question particle
 *
 * @param surface - Surface form to check
 * @returns True if the word is a question particle
 */
export function isQuestionParticle(surface: string): boolean {
  return surface === 'か'
}

/**
 * Checks if a word indicates negation
 *
 * @param surface - Surface form to check
 * @returns True if the word indicates negation
 */
export function isNegation(surface: string): boolean {
  return surface === 'ない' || surface === 'ません'
}
