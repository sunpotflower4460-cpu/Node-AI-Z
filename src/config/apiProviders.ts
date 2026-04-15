import type { ApiProviderConfig, ApiProviderId } from '../types/apiProvider'

type ProviderDetails = Omit<ApiProviderConfig, 'available' | 'unavailableReason'>

const API_PROVIDER_DETAILS: Record<ApiProviderId, ProviderDetails> = {
  internal_mock: {
    id: 'internal_mock',
    label: 'Internal Mock',
    description: 'アプリ内ロジックのみで表面化する安全フォールバック',
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    description: '自然な返答を安定して表面化する候補',
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'やわらかく自然な表現を試す候補',
  },
  google: {
    id: 'google',
    label: 'Google',
    description: '軽さと広がりのある表現を試す候補',
  },
}

type ProviderAvailabilityOverride = Partial<Record<ApiProviderId, Pick<ApiProviderConfig, 'available' | 'unavailableReason'>>>

export const createApiProviders = (overrides: ProviderAvailabilityOverride = {}): ApiProviderConfig[] => {
  return (Object.keys(API_PROVIDER_DETAILS) as ApiProviderId[]).map((providerId) => {
    const detail = API_PROVIDER_DETAILS[providerId]
    const availability = overrides[providerId]

    return {
      ...detail,
      available: availability?.available ?? providerId === 'internal_mock',
      unavailableReason: availability?.unavailableReason,
    }
  })
}

export const apiProviders = createApiProviders({
  openai: { available: false, unavailableReason: 'Availability pending from server' },
  anthropic: { available: false, unavailableReason: 'Availability pending from server' },
  google: { available: false, unavailableReason: 'Availability pending from server' },
})

export const getApiProviderConfig = (providerId: ApiProviderId, providers: ApiProviderConfig[] = apiProviders): ApiProviderConfig => {
  return providers.find((provider) => provider.id === providerId) ?? providers[0]
}

export const mergeApiProviderConfigs = (providers: ApiProviderConfig[]): ApiProviderConfig[] => {
  const providerMap = new Map(providers.map((provider) => [provider.id, provider]))

  return (Object.keys(API_PROVIDER_DETAILS) as ApiProviderId[]).map((providerId) => {
    const provider = providerMap.get(providerId)
    if (!provider) {
      return {
        ...API_PROVIDER_DETAILS[providerId],
        available: providerId === 'internal_mock',
        unavailableReason: providerId === 'internal_mock' ? undefined : 'Provider status unavailable',
      }
    }

    return {
      ...API_PROVIDER_DETAILS[providerId],
      available: provider.available,
      unavailableReason: provider.unavailableReason,
    }
  })
}
