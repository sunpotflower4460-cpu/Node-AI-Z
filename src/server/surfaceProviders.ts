import type { ApiProviderId } from '../types/apiProvider'
import type { SurfacePrompt, SurfaceReplyResult } from '../types/surface'
import { containsInternalLanguage } from '../surface/buildSurfacePrompt'
import { getProviderConfigFromEnv } from './providerAvailability'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const GOOGLE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const PROVIDER_TIMEOUT_MS = 12000

const createReplyResult = (
  text: string,
  requestedProvider: ApiProviderId,
  usedProvider: ApiProviderId,
  fellBack: boolean,
  fallbackReason?: string,
): SurfaceReplyResult => ({
  text,
  requestedProvider,
  usedProvider,
  fellBack,
  fallbackReason,
})

const createFallbackResult = (
  requestedProvider: ApiProviderId,
  fallbackText: string,
  fallbackReason: string,
) => createReplyResult(fallbackText, requestedProvider, 'internal_mock', true, fallbackReason)

const readOpenAiText = (payload: unknown) => {
  const content = (payload as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]?.message?.content
  return typeof content === 'string' ? content.trim() : ''
}

const readAnthropicText = (payload: unknown) => {
  const content = (payload as { content?: Array<{ type?: string; text?: string }> })?.content
  if (!Array.isArray(content)) {
    return ''
  }

  return content
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text?.trim() ?? '')
    .join('\n')
    .trim()
}

const readGoogleText = (payload: unknown) => {
  const parts = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) {
    return ''
  }

  return parts
    .map((part) => part.text?.trim() ?? '')
    .filter(Boolean)
    .join('\n')
    .trim()
}

const callJsonApi = async (
  url: string,
  init: RequestInit,
  readText: (payload: unknown) => string,
): Promise<string> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Provider HTTP ${response.status}`)
    }

    const payload = await response.json()
    return readText(payload)
  } finally {
    clearTimeout(timeoutId)
  }
}

const buildGooglePrompt = (prompt: SurfacePrompt) => {
  return `${prompt.system}\n\n${prompt.user}`
}

const requestOpenAiReply = async (apiKey: string, prompt: SurfacePrompt) => {
  return callJsonApi(
    OPENAI_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: prompt.system },
          { role: 'user', content: prompt.user },
        ],
      }),
    },
    readOpenAiText,
  )
}

const requestAnthropicReply = async (apiKey: string, prompt: SurfacePrompt) => {
  return callJsonApi(
    ANTHROPIC_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-latest',
        max_tokens: 350,
        temperature: 0.7,
        system: prompt.system,
        messages: [
          { role: 'user', content: prompt.user },
        ],
      }),
    },
    readAnthropicText,
  )
}

const requestGoogleReply = async (apiKey: string, prompt: SurfacePrompt) => {
  return callJsonApi(
    `${GOOGLE_URL}?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildGooglePrompt(prompt) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 350,
        },
      }),
    },
    readGoogleText,
  )
}

const requestProviderReply = async (
  provider: ApiProviderId,
  apiKey: string,
  prompt: SurfacePrompt,
) => {
  switch (provider) {
    case 'openai':
      return requestOpenAiReply(apiKey, prompt)
    case 'anthropic':
      return requestAnthropicReply(apiKey, prompt)
    case 'google':
      return requestGoogleReply(apiKey, prompt)
    case 'internal_mock':
    default:
      return ''
  }
}

export const generateSurfaceReplyFromProvider = async (
  provider: ApiProviderId,
  prompt: SurfacePrompt,
  fallbackText: string,
  env: Record<string, string | undefined>,
): Promise<SurfaceReplyResult> => {
  if (provider === 'internal_mock') {
    return createReplyResult(fallbackText, provider, provider, false)
  }

  const providerConfig = getProviderConfigFromEnv(provider, env)
  if (!providerConfig.available) {
    return createFallbackResult(provider, fallbackText, providerConfig.unavailableReason ?? 'Provider unavailable')
  }

  const apiKey = provider === 'openai'
    ? env.OPENAI_API_KEY
    : provider === 'anthropic'
      ? env.ANTHROPIC_API_KEY
      : env.GOOGLE_API_KEY

  if (!apiKey) {
    return createFallbackResult(provider, fallbackText, 'API key missing')
  }

  try {
    const text = (await requestProviderReply(provider, apiKey, prompt)).trim()
    if (!text) {
      return createFallbackResult(provider, fallbackText, 'Empty provider reply')
    }

    if (containsInternalLanguage(text)) {
      return createFallbackResult(provider, fallbackText, 'Surface guard intercepted internal wording')
    }

    return createReplyResult(text, provider, provider, false)
  } catch (error) {
    const fallbackReason = error instanceof Error && error.name === 'AbortError'
      ? 'Provider timeout'
      : error instanceof Error
        ? error.message
        : 'Provider error'

    return createFallbackResult(provider, fallbackText, fallbackReason)
  }
}
