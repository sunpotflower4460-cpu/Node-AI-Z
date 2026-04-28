import { describe, expect, it } from 'vitest'
import { createDefaultAblationConfig, getDisabledFeatures } from '../createDefaultAblationConfig'

describe('createDefaultAblationConfig', () => {
  it('has all features enabled by default', () => {
    const config = createDefaultAblationConfig()
    expect(config.teacherEnabled).toBe(true)
    expect(config.inhibitionEnabled).toBe(true)
    expect(config.dreamEnabled).toBe(true)
    expect(config.rewardEnabled).toBe(true)
    expect(config.modulatorEnabled).toBe(true)
    expect(config.sequenceMemoryEnabled).toBe(true)
    expect(config.contrastLearningEnabled).toBe(true)
    expect(config.consolidationEnabled).toBe(true)
  })

  it('returns empty disabled list for default config', () => {
    expect(getDisabledFeatures(createDefaultAblationConfig())).toHaveLength(0)
  })

  it('returns disabled feature names correctly', () => {
    const config = { ...createDefaultAblationConfig(), teacherEnabled: false, dreamEnabled: false }
    const disabled = getDisabledFeatures(config)
    expect(disabled).toContain('teacher')
    expect(disabled).toContain('dream')
    expect(disabled).not.toContain('reward')
  })
})
