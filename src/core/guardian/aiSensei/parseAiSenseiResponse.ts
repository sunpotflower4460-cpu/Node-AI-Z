import type { GuardianDecision } from '../guardianTypes'
import type {
  AiSenseiParsedReview,
  AiSenseiReviewRawResponse,
} from './aiSenseiTypes'

const VALID_DECISIONS: GuardianDecision[] = [
  'approve',
  'reject',
  'quarantine',
  'hold_for_review',
]

const DEFAULT_DECISION: GuardianDecision = 'hold_for_review'
const DEFAULT_CONFIDENCE = 0.5

const isGuardianDecision = (value: unknown): value is GuardianDecision => {
  return typeof value === 'string' && VALID_DECISIONS.includes(value as GuardianDecision)
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((entry): entry is string => typeof entry === 'string')
}

const extractDecisionFromText = (rawText: string): GuardianDecision | undefined => {
  for (const decision of VALID_DECISIONS) {
    if (rawText.includes(decision)) {
      return decision
    }
  }

  return undefined
}

export const coerceAiSenseiRawResponse = (
  response: unknown
): AiSenseiReviewRawResponse | null => {
  if (response == null) {
    return null
  }

  if (typeof response === 'string') {
    const trimmed = response.trim()

    if (!trimmed) {
      return { rawText: response }
    }

    try {
      const parsed = JSON.parse(trimmed)
      const normalized = coerceAiSenseiRawResponse(parsed)

      if (normalized) {
        return {
          ...normalized,
          rawText: normalized.rawText ?? trimmed,
        }
      }
    } catch {
      return {
        rawText: response,
        decision: extractDecisionFromText(response),
      }
    }

    return { rawText: response }
  }

  if (typeof response === 'object') {
    const record = response as Record<string, unknown>
    const rawText =
      typeof record.rawText === 'string'
        ? record.rawText
        : typeof record.text === 'string'
          ? record.text
          : undefined
    const extractedDecision = extractDecisionFromText(rawText ?? '')

    const decision = isGuardianDecision(record.decision)
      ? record.decision
      : isGuardianDecision(record.result)
        ? record.result
        : isGuardianDecision(record.verdict)
          ? record.verdict
          : extractedDecision

    const confidenceCandidate =
      typeof record.confidence === 'number'
        ? record.confidence
        : typeof record.score === 'number'
          ? record.score
          : undefined

    return {
      decision: isGuardianDecision(decision) ? decision : undefined,
      confidence: confidenceCandidate,
      reasons: toStringArray(record.reasons),
      cautionNotes: toStringArray(record.cautionNotes ?? record.cautions),
      rawText,
    }
  }

  return {
    rawText: String(response),
  }
}

export const parseAiSenseiResponse = (
  response: unknown
): AiSenseiParsedReview => {
  const raw = coerceAiSenseiRawResponse(response)
  const parseNotes: string[] = []

  if (!raw) {
    parseNotes.push('AI sensei returned no response')
    return {
      success: false,
      decision: DEFAULT_DECISION,
      confidence: DEFAULT_CONFIDENCE,
      reasons: [],
      cautionNotes: [],
      parseNotes,
    }
  }

  const decision = raw.decision ?? extractDecisionFromText(raw.rawText ?? '')
  if (!isGuardianDecision(decision)) {
    parseNotes.push('Missing or invalid decision in AI sensei response')
  }

  const confidence =
    typeof raw.confidence === 'number' && Number.isFinite(raw.confidence)
      ? Math.max(0, Math.min(1, raw.confidence))
      : DEFAULT_CONFIDENCE

  if (raw.confidence === undefined) {
    parseNotes.push('Confidence missing; applied conservative default')
  }

  return {
    success: isGuardianDecision(decision),
    decision: isGuardianDecision(decision) ? decision : DEFAULT_DECISION,
    confidence,
    reasons: raw.reasons ?? [],
    cautionNotes: raw.cautionNotes ?? [],
    parseNotes,
  }
}
