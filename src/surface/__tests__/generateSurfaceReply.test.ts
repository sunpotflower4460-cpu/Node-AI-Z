import { describe, expect, it } from 'vitest'
import { generateSurfaceReply } from '../generateSurfaceReply'

describe('generateSurfaceReply', () => {
  it('falls back to internal mock when the selected provider is unavailable', async () => {
    const result = await generateSurfaceReply({
      provider: 'openai',
      providerConfig: {
        id: 'openai',
        label: 'OpenAI',
        description: 'test provider',
        available: false,
        unavailableReason: 'API key not configured',
      },
      prompt: {
        system: 'Respond in Japanese.',
        user: 'User input: どうしたらいい？',
        context: {
          userInput: 'どうしたらいい？',
          recentTurns: [],
          detectedField: 'field',
          mainReaction: 'reaction',
          stance: 'stance',
          homeCheckSummary: 'summary',
          mainConflict: 'conflict',
          mainPattern: 'pattern',
          replyIntent: 'judgment_support',
          shouldWithhold: 'withhold certainty',
          toneBiasSummary: 'none',
          promotedMemorySummary: 'none',
          fallbackReply: 'fallback to internal mock',
          explicitQuestion: true,
        },
      },
      fallbackText: 'fallback to internal mock',
    })

    expect(result.usedProvider).toBe('internal_mock')
    expect(result.fellBack).toBe(true)
    expect(result.text).toBe('fallback to internal mock')
    expect(result.fallbackReason).toBe('API key not configured')
  })
})
