import { describe, it, expect } from 'vitest'
import { translateFacadeWriteIntent } from '../translateFacadeWriteIntent'

const writablePolicy = {
  mode: 'crystallized_thinking' as const,
  readableScopes: ['personal_branch'],
  writableScopes: ['personal_branch'],
  allowPromotionRead: true,
  allowPromotionWrite: true,
  allowTrunkApplyRead: true,
  allowTrunkApplyWrite: false,
}

describe('translateFacadeWriteIntent', () => {
  it('blocks observer writes', () => {
    const result = translateFacadeWriteIntent({}, 'observer', {
      ...writablePolicy,
      mode: 'observer',
      writableScopes: [],
    })

    expect(result.blocked).toBe(true)
  })

  it('drops promotion fields for future app', () => {
    const result = translateFacadeWriteIntent(
      { promotionNotes: 'should drop', keepMe: true },
      'future_app',
      {
        ...writablePolicy,
        mode: 'future_app',
      }
    )

    expect(result.blocked).toBe(false)
    expect(result.normalizedPayload.promotionNotes).toBeUndefined()
    expect(result.normalizedPayload.keepMe).toBe(true)
  })

  it('passes through for writable modes', () => {
    const payload = { test: 'value' }
    const result = translateFacadeWriteIntent(payload, 'crystallized_thinking', writablePolicy)

    expect(result.blocked).toBe(false)
    expect(result.normalizedPayload).toEqual(payload)
  })
})
