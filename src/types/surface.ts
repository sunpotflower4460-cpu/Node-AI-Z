import type { ApiProviderConfig, ApiProviderId } from './apiProvider'

export type ReplyIntent =
  | 'emotional_holding'
  | 'judgment_support'
  | 'practical_advice'
  | 'free_reflection'

export type SurfaceConversationTurn = {
  role: 'user' | 'assistant'
  text: string
}

export type SurfacePromptContext = {
  userInput: string
  recentTurns: SurfaceConversationTurn[]
  detectedField: string
  mainReaction: string
  stance: string
  homeCheckSummary: string
  mainConflict: string
  mainPattern: string
  replyIntent: ReplyIntent
  shouldWithhold: string
  toneBiasSummary: string
  promotedMemorySummary: string
  fallbackReply: string
  explicitQuestion: boolean
}

export type SurfacePrompt = {
  system: string
  user: string
  context: SurfacePromptContext
}

export type SurfaceChatRequest = {
  provider: ApiProviderId
  prompt: SurfacePrompt
  fallbackText: string
}

export type SurfaceReplyResult = {
  text: string
  requestedProvider: ApiProviderId
  usedProvider: ApiProviderId
  fellBack: boolean
  fallbackReason?: string
}

export type ProvidersResponse = {
  providers: ApiProviderConfig[]
}
