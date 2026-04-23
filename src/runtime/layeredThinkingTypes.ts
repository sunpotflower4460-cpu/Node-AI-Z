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

export type CharNode = {
  char: string
  index: number
  kind: CharKind
  isRepeat: boolean
  isLineEnd: boolean
}

export type L0Summary = {
  totalChars: number
  kindDistribution: Record<CharKind, number>
  repeatCount: number
  endsWithPunctuation: boolean
  endChar: string | null
  hasExclamation: boolean
  hasQuestion: boolean
  hasEllipsis: boolean
  hasEmoji: boolean
}

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

export type TokenNode = {
  surface: string
  index: number
  category: TokenCategory
  length: number
  isFirstToken: boolean
  isLastToken: boolean
}

export type L1Summary = {
  tokenCount: number
  categoryDistribution: Record<TokenCategory, number>
  hasGreeting: boolean
  hasQuestion: boolean
  hasNegation: boolean
  hasFiller: boolean
  dominantCategory: TokenCategory
  greetingTokens: string[]
}

export type ChunkRole =
  | 'subject'
  | 'object'
  | 'predicate'
  | 'greeting'
  | 'question'
  | 'modifier'
  | 'standalone'
  | 'connector'
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

export type L3Output = {
  sentences: SentenceNode[]
  overallType: SentenceType
  overallCompleteness: 'complete' | 'trailing' | 'fragment'
  isMultiSentence: boolean
  turnCount: number
}

export type NeedType =
  | 'connection'
  | 'information'
  | 'expression'
  | 'reflection'
  | 'action'
  | 'acknowledgment'
  | 'unclear'

export type SemanticFrame = {
  gist: string
  need: NeedType
  contextModifier: string | null
  relation: 'new_topic' | 'continuation' | 'response' | 'shift' | 'deepening'
  topic: string
}

export type ReactionState = {
  wantToRespond: boolean
  feelsSafe: boolean
  feelsRelevant: boolean
  feelsUrgent: boolean
  warmth: number
  reactedTo: string[]
  snag: string | null
}

export type ActionType =
  | 'greet_back'
  | 'answer'
  | 'listen'
  | 'explore'
  | 'ask_back'
  | 'express'
  | 'wait'
  | 'deflect'

export type Decision = {
  action: ActionType
  topic: string
  length: 'minimal' | 'short' | 'medium' | 'long'
  confidence: number
  showUncertainty: boolean
  askBack: boolean
  reasoning: string
}

export type Prediction = {
  expectedNeed: NeedType | null
  expectedTopic: string | null
  expectedSentenceType: SentenceType | null
}

export type PredictionError = {
  needMismatch: boolean
  topicShift: boolean
  surprise: number
}

export type LayeredBrainMood = 'neutral' | 'light' | 'heavy' | 'uncertain'

export type LayeredBrainState = {
  turnCount: number
  lastSemantic: SemanticFrame | null
  lastDecision: Decision | null
  lastUtterance: string | null
  prediction: Prediction
  mood: LayeredBrainMood
  recentTopics: string[]
}

export type LayeredThinkingTrace = {
  characterNodes: CharNode[]
  l0Summary: L0Summary
  tokenNodes: TokenNode[]
  l1Summary: L1Summary
  chunkNodes: ChunkNode[]
  l2Summary: L2Summary
  l3Output: L3Output
  semanticFrame: SemanticFrame
  reactionState: ReactionState
  decision: Decision
  utterance: string
  predictionError: PredictionError | null
  nextPrediction: Prediction
  nextBrainState: LayeredBrainState
}
