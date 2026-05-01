import { describe, expect, it } from 'vitest'
import { buildExperienceModeViewModel } from '../buildExperienceModeViewModel'

describe('buildExperienceModeViewModel', () => {
  it('returns screenMode as experience', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: false,
      canSend: true,
    })
    expect(vm.screenMode).toBe('experience')
  })

  it('returns correct engineLabel for signal_mode', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: false,
      canSend: true,
    })
    expect(vm.engineLabel).toBe('New Signal')
  })

  it('returns correct engineLabel for llm_mode', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'llm_mode',
      hasConversation: false,
      canSend: true,
    })
    expect(vm.engineLabel).toBe('LLM')
  })

  it('includes introText', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: false,
      canSend: true,
    })
    expect(vm.introText).toContain('観察')
  })

  it('hasConversation false gives empty helper text', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: false,
      canSend: true,
    })
    expect(vm.helperText).toContain('入力')
  })

  it('hasConversation true gives continue helper text', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: true,
      canSend: true,
    })
    expect(vm.helperText).toContain('観察モード')
  })

  it('includes researchDetails when provided', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: false,
      canSend: true,
      surfaceProviderLabel: 'MockProvider',
      runtimeModeLabel: 'Signal',
    })
    expect(vm.researchDetails?.surfaceProviderLabel).toBe('MockProvider')
    expect(vm.researchDetails?.runtimeModeLabel).toBe('Signal')
  })

  it('Simple View does not expose implementation details at top level', () => {
    const vm = buildExperienceModeViewModel({
      engine: 'signal_mode',
      hasConversation: false,
      canSend: true,
      surfaceProviderLabel: 'MockProvider',
    })
    // implementation details are nested in researchDetails, not at top level
    expect('surfaceProviderLabel' in vm).toBe(false)
  })
})
