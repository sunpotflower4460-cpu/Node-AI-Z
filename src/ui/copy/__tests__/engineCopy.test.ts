import { describe, expect, it } from 'vitest'
import { ENGINE_COPY, getEngineCopy } from '../engineCopy'

describe('ENGINE_COPY', () => {
  it('has all three engine modes', () => {
    expect(ENGINE_COPY.signal_mode).toBeDefined()
    expect(ENGINE_COPY.crystallized_thinking_legacy).toBeDefined()
    expect(ENGINE_COPY.llm_mode).toBeDefined()
  })

  it('signal_mode has Japanese simple label', () => {
    expect(ENGINE_COPY.signal_mode.simpleLabel).toBe('新しい信号モード')
  })

  it('crystallized_thinking_legacy has Japanese simple label', () => {
    expect(ENGINE_COPY.crystallized_thinking_legacy.simpleLabel).toBe('旧・結晶思考')
  })

  it('llm_mode has Japanese simple label', () => {
    expect(ENGINE_COPY.llm_mode.simpleLabel).toBe('LLM比較モード')
  })

  it('each engine has a short description', () => {
    for (const key of Object.keys(ENGINE_COPY) as Array<keyof typeof ENGINE_COPY>) {
      expect(ENGINE_COPY[key].description.length).toBeGreaterThan(10)
    }
  })

  it('each engine has an internal ID', () => {
    expect(ENGINE_COPY.signal_mode.internalId).toBe('signal_mode')
    expect(ENGINE_COPY.crystallized_thinking_legacy.internalId).toBe('crystallized_thinking_legacy')
    expect(ENGINE_COPY.llm_mode.internalId).toBe('llm_mode')
  })

  it('research description mentions internal id for signal_mode', () => {
    expect(ENGINE_COPY.signal_mode.researchDescription).toContain('signal_mode')
  })
})

describe('getEngineCopy', () => {
  it('returns correct entry for signal_mode', () => {
    const entry = getEngineCopy('signal_mode')
    expect(entry.simpleLabel).toBe('新しい信号モード')
  })
})
