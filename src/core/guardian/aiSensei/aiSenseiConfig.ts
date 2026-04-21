import type { AiSenseiMode } from './aiSenseiTypes'

export type AiSenseiConfig = {
  mode: AiSenseiMode
  timeoutMs: number
  endpoint?: string
  apiKeyEnvName?: string
}

const DEFAULT_TIMEOUT_MS = 2500
const DEFAULT_API_KEY_ENV_NAME = 'AI_SENSEI_API_KEY'

const VALID_MODES: AiSenseiMode[] = ['disabled', 'mock', 'remote']

const getEnvironment = (): Record<string, string | undefined> => {
  const processEnv = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process?.env

  if (processEnv) {
    return processEnv
  }

  return {}
}

const normalizeMode = (value: string | undefined): AiSenseiMode => {
  if (value && VALID_MODES.includes(value as AiSenseiMode)) {
    return value as AiSenseiMode
  }

  return 'mock'
}

export const defaultAiSenseiConfig: AiSenseiConfig = {
  mode: 'mock',
  timeoutMs: DEFAULT_TIMEOUT_MS,
  apiKeyEnvName: DEFAULT_API_KEY_ENV_NAME,
}

export const getAiSenseiConfig = (): AiSenseiConfig => {
  const env = getEnvironment()
  const parsedTimeout = Number(env.AI_SENSEI_TIMEOUT_MS)
  const timeoutMs =
    Number.isFinite(parsedTimeout) && parsedTimeout > 0
      ? parsedTimeout
      : DEFAULT_TIMEOUT_MS

  return {
    mode: normalizeMode(env.AI_SENSEI_MODE),
    timeoutMs,
    endpoint: env.AI_SENSEI_ENDPOINT,
    apiKeyEnvName: env.AI_SENSEI_API_KEY_ENV_NAME ?? DEFAULT_API_KEY_ENV_NAME,
  }
}
