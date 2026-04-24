import { describe, it, expect } from 'vitest'
import { resolveBindingTeacher } from '../resolveBindingTeacher'

describe('resolveBindingTeacher', () => {
  it('returns closely_related for multi-modal input', async () => {
    const result = await resolveBindingTeacher({
      textSummary: 'a cat',
      imageSummary: 'orange cat image',
    })
    expect(result.relation).toBe('closely_related')
    expect(result.confidence).toBeGreaterThan(0)
  })

  it('returns unsure for single-modality input', async () => {
    const result = await resolveBindingTeacher({
      textSummary: 'a cat',
    })
    expect(result.relation).toBe('unsure')
  })
})
