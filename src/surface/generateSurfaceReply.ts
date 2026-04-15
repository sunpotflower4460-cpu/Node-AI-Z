import type { ApiProviderConfig, ApiProviderId } from '../types/apiProvider'
import type { SurfaceChatRequest, SurfaceReplyResult } from '../types/surface'
import { containsInternalLanguage } from './buildSurfacePrompt'

type GenerateSurfaceReplyParams = {
  provider: ApiProviderId
  providerConfig?: ApiProviderConfig
  prompt: SurfaceChatRequest['prompt']
  fallbackText: string
}

const SURFACE_ROUTE_TIMEOUT_MS = 12000

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

const sanitizeSurfaceReply = (result: SurfaceReplyResult, fallbackText: string): SurfaceReplyResult => {
  const trimmedText = result.text.trim()
  if (!trimmedText) {
    return createFallbackResult(result.requestedProvider, fallbackText, 'Empty surface reply')
  }

  if (containsInternalLanguage(trimmedText)) {
    return createFallbackResult(result.requestedProvider, fallbackText, 'Surface guard intercepted internal wording')
  }

  return {
    ...result,
    text: trimmedText,
  }
}

export const generateSurfaceReply = async ({
  provider,
  providerConfig,
  prompt,
  fallbackText,
}: GenerateSurfaceReplyParams): Promise<SurfaceReplyResult> => {
  if (provider === 'internal_mock') {
    return createReplyResult(fallbackText, provider, provider, false)
  }

  if (!providerConfig?.available) {
    return createFallbackResult(provider, fallbackText, providerConfig?.unavailableReason ?? 'Provider unavailable')
  }

  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), SURFACE_ROUTE_TIMEOUT_MS)

  try {
    const response = await fetch('/api/surface-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        prompt,
        fallbackText,
      } satisfies SurfaceChatRequest),
      signal: controller.signal,
    })

    if (!response.ok) {
      return createFallbackResult(provider, fallbackText, `Route error (${response.status})`)
    }

    const result = await response.json() as SurfaceReplyResult
    return sanitizeSurfaceReply(result, fallbackText)
  } catch (error) {
    const fallbackReason = error instanceof Error && error.name === 'AbortError'
      ? 'Route timeout'
      : 'Route error'

    return createFallbackResult(provider, fallbackText, fallbackReason)
  } finally {
    globalThis.clearTimeout(timeoutId)
  }
}
