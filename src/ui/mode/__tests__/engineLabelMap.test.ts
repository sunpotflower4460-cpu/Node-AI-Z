import { describe, expect, it } from 'vitest'
import { ENGINE_LABEL_MAP, getEngineLabel } from '../engineLabelMap'

describe('engineLabelMap', () => {
  it('contains all three engine modes', () => {
    expect(ENGINE_LABEL_MAP.signal_mode.full).toBe('New Signal')
    expect(ENGINE_LABEL_MAP.crystallized_thinking_legacy.full).toBe('Legacy')
    expect(ENGINE_LABEL_MAP.llm_mode.full).toBe('LLM')
  })

  it('getEngineLabel returns the correct label for signal_mode', () => {
    const label = getEngineLabel('signal_mode')
    expect(label.short).toBe('New')
    expect(label.description).toContain('意味未満')
  })

  it('getEngineLabel returns the correct label for llm_mode', () => {
    const label = getEngineLabel('llm_mode')
    expect(label.full).toBe('LLM')
  })
})
