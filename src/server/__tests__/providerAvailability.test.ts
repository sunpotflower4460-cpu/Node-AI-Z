import { describe, expect, it } from 'vitest'
import { getProviderAvailability } from '../providerAvailability'

describe('getProviderAvailability', () => {
  it('keeps internal mock available and marks missing API keys as unavailable', () => {
    const providers = getProviderAvailability({})
    const internalMock = providers.find((provider) => provider.id === 'internal_mock')
    const openAi = providers.find((provider) => provider.id === 'openai')

    expect(internalMock?.available).toBe(true)
    expect(openAi?.available).toBe(false)
    expect(openAi?.unavailableReason).toBe('API key not configured')
  })

  it('marks configured providers as available', () => {
    const providers = getProviderAvailability({
      OPENAI_API_KEY: 'openai-key',
      ANTHROPIC_API_KEY: 'anthropic-key',
      GOOGLE_API_KEY: 'google-key',
    })

    expect(providers.filter((provider) => provider.available).map((provider) => provider.id)).toEqual([
      'internal_mock',
      'openai',
      'anthropic',
      'google',
    ])
  })
})
