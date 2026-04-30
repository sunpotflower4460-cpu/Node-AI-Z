import { describe, expect, it } from 'vitest'
import { buildTabVisibilityViewModel } from '../buildTabVisibilityViewModel'

describe('buildTabVisibilityViewModel', () => {
  const base = {
    activeTab: 'overview' as const,
    hasObservation: false,
    hasGrowthData: false,
    hasTeacherData: false,
    hasHistoryData: false,
    researchMode: false,
  }

  it('returns the active tab', () => {
    const vm = buildTabVisibilityViewModel(base)
    expect(vm.activeTab).toBe('overview')
  })

  it('returns 8 tabs', () => {
    const vm = buildTabVisibilityViewModel(base)
    expect(vm.availableTabs).toHaveLength(8)
  })

  it('all tabs are enabled', () => {
    const vm = buildTabVisibilityViewModel(base)
    expect(vm.availableTabs.every((tab) => tab.enabled)).toBe(true)
  })

  it('uses Japanese labels in simple mode', () => {
    const vm = buildTabVisibilityViewModel(base)
    const overview = vm.availableTabs.find((t) => t.id === 'overview')
    expect(overview?.label).toBe('概要')
  })

  it('uses English labels in research mode', () => {
    const vm = buildTabVisibilityViewModel({ ...base, researchMode: true })
    const overview = vm.availableTabs.find((t) => t.id === 'overview')
    expect(overview?.label).toBe('Overview')
  })

  it('marks overview as recommended before observation', () => {
    const vm = buildTabVisibilityViewModel(base)
    const overview = vm.availableTabs.find((t) => t.id === 'overview')
    expect(overview?.recommended).toBe(true)
  })

  it('marks overview as hasData when observation exists', () => {
    const vm = buildTabVisibilityViewModel({ ...base, hasObservation: true })
    const overview = vm.availableTabs.find((t) => t.id === 'overview')
    expect(overview?.hasData).toBe(true)
  })
})
