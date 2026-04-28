import { describe, expect, it } from 'vitest'
import { MODE_DISPLAY_CONFIG } from '../modeDisplayConfig'

describe('MODE_DISPLAY_CONFIG', () => {
  it('contains all three overview modes', () => {
    expect(MODE_DISPLAY_CONFIG.signal_mode.label).toBe('New Signal Mode')
    expect(MODE_DISPLAY_CONFIG.crystallized_thinking_legacy.label).toBe('Crystallized Legacy')
    expect(MODE_DISPLAY_CONFIG.llm_mode.label).toBe('LLM Mode')
  })

  it('marks New Signal Mode as the primary development target', () => {
    expect(MODE_DISPLAY_CONFIG.signal_mode.badge).toBe('現在の主開発対象')
  })
})
