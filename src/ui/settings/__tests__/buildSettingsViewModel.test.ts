import { describe, expect, it } from 'vitest'
import { buildSettingsViewModel } from '../buildSettingsViewModel'

describe('buildSettingsViewModel', () => {
  it('maps observe screenMode to 観察 label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
    })
    expect(vm.labels.screenModeLabel).toBe('観察')
  })

  it('maps experience screenMode to 体験 label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'experience',
      engine: 'signal_mode',
      detailMode: 'simple',
    })
    expect(vm.labels.screenModeLabel).toBe('体験')
  })

  it('maps signal_mode engine to New Signal label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
    })
    expect(vm.labels.engineLabel).toBe('New Signal')
  })

  it('maps crystallized_legacy engine to Legacy label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'crystallized_legacy',
      detailMode: 'simple',
    })
    expect(vm.labels.engineLabel).toBe('Legacy')
  })

  it('maps llm_mode engine to LLM label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'llm_mode',
      detailMode: 'simple',
    })
    expect(vm.labels.engineLabel).toBe('LLM')
  })

  it('maps simple detailMode to Simple label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
    })
    expect(vm.labels.detailModeLabel).toBe('Simple')
  })

  it('maps research detailMode to Research label', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'research',
    })
    expect(vm.labels.detailModeLabel).toBe('Research')
  })

  it('returns なし when lastSavedAt is null', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
      lastSavedAt: null,
    })
    expect(vm.storage.lastSavedLabel).toBe('なし')
  })

  it('returns なし when lastSavedAt is undefined', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
    })
    expect(vm.storage.lastSavedLabel).toBe('なし')
  })

  it('formats lastSavedAt as a non-empty string when provided', () => {
    const ts = new Date('2024-01-15T10:30:00').getTime()
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
      lastSavedAt: ts,
    })
    expect(vm.storage.lastSavedLabel).not.toBe('なし')
    expect(vm.storage.lastSavedLabel.length).toBeGreaterThan(0)
  })

  it('defaults storage fields to false/false', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'simple',
    })
    expect(vm.storage.hasSnapshot).toBe(false)
    expect(vm.storage.autosaveEnabled).toBe(false)
  })

  it('passes through research flags', () => {
    const vm = buildSettingsViewModel({
      screenMode: 'observe',
      engine: 'signal_mode',
      detailMode: 'research',
      debugTraceEnabled: true,
      rawMetricsVisible: true,
      ablationVisible: false,
    })
    expect(vm.research.debugTraceEnabled).toBe(true)
    expect(vm.research.rawMetricsVisible).toBe(true)
    expect(vm.research.ablationVisible).toBe(false)
  })
})
