import type { PrimaryTabId, TabVisibilityViewModel } from '../navigation/tabUiTypes'
import { PRIMARY_TABS } from '../navigation/tabDisplayConfig'

type BuildTabVisibilityViewModelInput = {
  activeTab: PrimaryTabId
  hasObservation: boolean
  hasGrowthData: boolean
  hasTeacherData: boolean
  hasHistoryData: boolean
  researchMode: boolean
}

export const buildTabVisibilityViewModel = ({
  activeTab,
  hasObservation,
  hasGrowthData,
  hasTeacherData,
  hasHistoryData,
  researchMode,
}: BuildTabVisibilityViewModelInput): TabVisibilityViewModel => ({
  activeTab,
  availableTabs: PRIMARY_TABS.map((tab) => {
    const label = researchMode ? tab.researchLabel : tab.label
    switch (tab.id) {
      case 'overview':
        return { id: tab.id, label, enabled: true, hasData: hasObservation, recommended: !hasObservation }
      case 'field':
        return { id: tab.id, label, enabled: true, hasData: hasObservation }
      case 'growth':
        return { id: tab.id, label, enabled: true, hasData: hasGrowthData }
      case 'teacher':
        return { id: tab.id, label, enabled: true, hasData: hasTeacherData }
      case 'evaluate':
        return { id: tab.id, label, enabled: true, hasData: false }
      case 'risk':
        return { id: tab.id, label, enabled: true, hasData: hasObservation }
      case 'history':
        return { id: tab.id, label, enabled: true, hasData: hasHistoryData }
      case 'mother':
        return { id: tab.id, label, enabled: true, hasData: false }
      default:
        return { id: tab.id, label, enabled: true, hasData: false }
    }
  }),
})
