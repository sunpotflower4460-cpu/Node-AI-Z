import { describe, expect, it } from 'vitest'
import { applyAblationConfig } from '../applyAblationConfig'
import { createDefaultAblationConfig } from '../createDefaultAblationConfig'

const baseInput = {
  stimulus: { modality: 'text' as const, vector: [0.5], strength: 1, timestamp: 1000 },
  enableBindingTeacher: true,
  textSummary: 'test text',
  isUserActive: true,
  recentActivityLevel: 0.5,
}

describe('applyAblationConfig', () => {
  it('returns input unchanged when no config provided', () => {
    const result = applyAblationConfig(baseInput)
    expect(result.enableBindingTeacher).toBe(true)
    expect(result.textSummary).toBe('test text')
  })

  it('disables teacher when teacherEnabled=false', () => {
    const config = { ...createDefaultAblationConfig(), teacherEnabled: false }
    const result = applyAblationConfig(baseInput, config)
    expect(result.enableBindingTeacher).toBe(false)
    expect(result.textSummary).toBeUndefined()
  })

  it('forces user active when dreamEnabled=false', () => {
    const config = { ...createDefaultAblationConfig(), dreamEnabled: false }
    const result = applyAblationConfig({ ...baseInput, isUserActive: false }, config)
    expect(result.isUserActive).toBe(true)
  })
})
