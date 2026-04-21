import type { AppFacadeMode } from '../coreTypes'
import type { FacadeCapabilityPolicy } from '../facadeRuntime/facadeRuntimeTypes'

export type FacadeWriteNormalizationResult = {
  normalizedPayload: Record<string, unknown>
  blocked: boolean
  notes: string[]
}

export const translateFacadeWriteIntent = (
  payload: Record<string, unknown>,
  mode: AppFacadeMode,
  policy: FacadeCapabilityPolicy
): FacadeWriteNormalizationResult => {
  const notes: string[] = [`Write intent translation for ${mode}`]

  if (mode === 'observer' || policy.writableScopes.length === 0) {
    notes.push('Observer mode is read-only; write suppressed')
    return {
      normalizedPayload: {},
      blocked: true,
      notes,
    }
  }

  const normalizedPayload = { ...payload }

  if (mode === 'future_app') {
    for (const key of Object.keys(normalizedPayload)) {
      if (key.includes('promotion') || key.includes('guardian') || key.includes('review')) {
        delete normalizedPayload[key]
      }
    }
    notes.push('Future app: removed review/promotion related fields')
  }

  if (!policy.writableScopes.includes('personal_branch')) {
    notes.push('Write scope limited; dropping payload')
    return {
      normalizedPayload: {},
      blocked: true,
      notes,
    }
  }

  notes.push('Payload normalized for branch update')

  return {
    normalizedPayload,
    blocked: false,
    notes,
  }
}
