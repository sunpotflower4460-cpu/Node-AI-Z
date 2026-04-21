import type { AiSenseiConfig } from './aiSenseiConfig'
import type {
  AiSenseiReviewPayload,
  AiSenseiReviewRawResponse,
} from './aiSenseiTypes'

type AiSenseiAdapterResponse = AiSenseiReviewRawResponse | string | null

const getEnvironmentValue = (key: string | undefined): string | undefined => {
  if (!key) {
    return undefined
  }

  const processEnv = (
    globalThis as typeof globalThis & {
      process?: { env?: Record<string, string | undefined> }
    }
  ).process?.env

  if (processEnv) {
    return processEnv[key]
  }

  return undefined
}

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`AI sensei request timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
  }
}

const buildMockResponse = (
  payload: AiSenseiReviewPayload
): AiSenseiReviewRawResponse => {
  if (payload.riskLevel === 'low') {
    return {
      decision: 'approve',
      confidence: Math.max(0.8, payload.confidenceScore),
      reasons: ['Mock AI sensei approved low-risk promotion candidate'],
      cautionNotes: payload.cautionNotes,
    }
  }

  if (payload.riskLevel === 'medium') {
    return {
      decision:
        payload.confidenceScore >= 0.75 ? 'quarantine' : 'hold_for_review',
      confidence: Math.max(0.6, payload.confidenceScore),
      reasons: ['Mock AI sensei requested guarded handling for medium risk'],
      cautionNotes: payload.cautionNotes,
    }
  }

  return {
    decision: 'hold_for_review',
    confidence: Math.min(0.7, payload.confidenceScore),
    reasons: ['Mock AI sensei escalated high-risk candidate for review'],
    cautionNotes: [
      ...payload.cautionNotes,
      'High risk candidate should not be auto-promoted',
    ],
  }
}

const reviewWithRemoteAiSensei = async (
  payload: AiSenseiReviewPayload,
  config: AiSenseiConfig
): Promise<AiSenseiAdapterResponse> => {
  if (!config.endpoint) {
    throw new Error('AI sensei remote mode requires an endpoint')
  }

  const apiKey = getEnvironmentValue(config.apiKeyEnvName)
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  }

  if (apiKey) {
    headers.authorization = `Bearer ${apiKey}`
  }

  const response = await withTimeout(
    fetch(config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }),
    config.timeoutMs
  )

  if (!response.ok) {
    throw new Error(`AI sensei remote review failed with status ${response.status}`)
  }

  const responseText = await response.text()

  try {
    return JSON.parse(responseText) as AiSenseiReviewRawResponse
  } catch {
    return responseText
  }
}

export const reviewWithAiSensei = async (
  payload: AiSenseiReviewPayload,
  config: AiSenseiConfig
): Promise<AiSenseiAdapterResponse> => {
  if (config.mode === 'disabled') {
    return null
  }

  if (config.mode === 'mock') {
    return buildMockResponse(payload)
  }

  return await reviewWithRemoteAiSensei(payload, config)
}
