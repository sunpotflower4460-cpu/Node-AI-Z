/**
 * Utterance Layer Types
 *
 * These types define the intermediate layers between internal state (FusedState, ProtoMeaning,
 * OptionAwareness, Somatic) and the final crystallized reply.
 *
 * Flow: FusedState → UtteranceIntent → UtteranceShape → LexicalPulls → SentencePlan → Reply
 */

/**
 * UtteranceIntent: What to say
 *
 * Derived from internal state to determine the primary communicative move
 * and the emotional/structural characteristics of the utterance.
 */
export type UtteranceIntent = {
  /** Primary communicative action */
  primaryMove:
    | 'hold'              // Stay with the feeling, don't rush to answer
    | 'reflect'           // Mirror back what's present
    | 'soft_answer'       // Offer answer gently
    | 'structured_answer' // Provide clear, organized response
    | 'option_compare'    // Compare or balance options
    | 'bridge_suggest'    // Suggest a path between options
    | 'gentle_probe'      // Ask back to open space

  /** How close to get emotionally (0.0 = distant, 1.0 = close) */
  emotionalDistance: number

  /** How directly to answer (0.0 = open/indirect, 1.0 = direct) */
  answerForce: number

  /** How much structure is needed (0.0 = free-form, 1.0 = structured) */
  structureNeed: number

  /** Emotional warmth (0.0 = cool, 1.0 = warm) */
  warmth: number

  /** Tolerance for ambiguity (0.0 = resolve, 1.0 = stay open) */
  ambiguityTolerance: number

  /** How direct to be (0.0 = indirect, 1.0 = very direct) */
  directness: number

  /** Whether to stay open and not conclude */
  shouldStayOpen: boolean
}

/**
 * UtteranceShape: How to say it
 *
 * Defines the structural form and flow of the utterance.
 */
export type UtteranceShape = {
  /** How to open the utterance */
  openWith:
    | 'texture'        // Start with felt quality (heaviness, fragility, etc.)
    | 'meaning'        // Start with narrative meaning
    | 'option'         // Start with option comparison
    | 'question'       // Start with a question back
    | 'direct_answer'  // Start with direct answer

  /** Include contrast or tension */
  includeContrast: boolean

  /** Include option balance/comparison */
  includeOptionBalance: boolean

  /** Include bridge suggestion between options */
  includeBridge: boolean

  /** Include a question back to user */
  includeQuestionBack: boolean

  /** Maximum number of sentences */
  maxSentences: number
}

/**
 * LexicalPulls: Which words/phrases to draw toward
 *
 * Specifies vocabulary tendencies and what to avoid.
 */
export type LexicalPulls = {
  /** Texture words to prefer (from dominantTextures, etc.) */
  preferredTextures: string[]

  /** Meaning phrases to prefer (from protoMeanings) */
  preferredMeaningPhrases: string[]

  /** Option-related phrases to prefer */
  preferredOptionPhrases: string[]

  /** Avoid over-explaining */
  avoidOverexplaining: boolean

  /** Avoid flat summary tone */
  avoidFlatSummary: boolean

  /** Avoid overly therapeutic/counselor tone */
  avoidTherapyTone: boolean
}

/**
 * CrystallizedSentencePlan: The scaffold for the reply
 *
 * Not all fields need to be filled. The plan adapts to the shape.
 */
export type CrystallizedSentencePlan = {
  /** Opening (texture, meaning, or direct) */
  opening?: string

  /** Core content */
  core?: string

  /** Option comparison frame */
  optionFrame?: string

  /** Direct answer (if needed) */
  answer?: string

  /** Bridge suggestion */
  bridge?: string

  /** Closing (gentle hold, question, etc.) */
  close?: string
}
