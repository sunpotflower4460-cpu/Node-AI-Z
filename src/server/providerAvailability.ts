import { createApiProviders } from '../config/apiProviders'
import type { ApiProviderConfig, ApiProviderId } from '../types/apiProvider'

const PROVIDER_ENV_KEYS: Partial<Record<ApiProviderId, string>> = {
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
}

export const getProviderAvailability = (env: Record<string, string | undefined>): ApiProviderConfig[] => {
  return createApiProviders({
    internal_mock: { available: true },
    openai: {
      available: Boolean(env[PROVIDER_ENV_KEYS.openai ?? '']),
      unavailableReason: env[PROVIDER_ENV_KEYS.openai ?? ''] ? undefined : 'API key not configured',
    },
    anthropic: {
      available: Boolean(env[PROVIDER_ENV_KEYS.anthropic ?? '']),
      unavailableReason: env[PROVIDER_ENV_KEYS.anthropic ?? ''] ? undefined : 'API key not configured',
    },
    google: {
      available: Boolean(env[PROVIDER_ENV_KEYS.google ?? '']),
      unavailableReason: env[PROVIDER_ENV_KEYS.google ?? ''] ? undefined : 'API key not configured',
    },
  })
}

export const getProviderConfigFromEnv = (
  providerId: ApiProviderId,
  env: Record<string, string | undefined>,
): ApiProviderConfig => {
  const providers = getProviderAvailability(env)
  return providers.find((provider) => provider.id === providerId) ?? providers[0]
}
