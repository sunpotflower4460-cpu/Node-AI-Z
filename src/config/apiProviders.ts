import type { ApiProviderConfig, ApiProviderId } from '../types/apiProvider'

const API_PROVIDER_CONFIGS: Record<ApiProviderId, ApiProviderConfig> = {
  internal_mock: {
    id: 'internal_mock',
    label: 'Internal Mock',
    description: 'アプリ内ロジックのみで表面化する簡易モード',
    available: true,
  },
  openai: {
    id: 'openai',
    label: 'OpenAI',
    description: '安定感とバランスのよい表面化',
    available: false,
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic',
    description: 'やわらかく自然な表面表現の比較候補',
    available: false,
  },
  google: {
    id: 'google',
    label: 'Google',
    description: '広がりや軽さのある表面表現の比較候補',
    available: false,
  },
}

export const apiProviders = Object.values(API_PROVIDER_CONFIGS)

export const getApiProviderConfig = (providerId: ApiProviderId): ApiProviderConfig => {
  return API_PROVIDER_CONFIGS[providerId]
}
