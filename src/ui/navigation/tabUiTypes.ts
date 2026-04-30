export type PrimaryTabId =
  | 'overview'
  | 'field'
  | 'growth'
  | 'teacher'
  | 'evaluate'
  | 'risk'
  | 'history'
  | 'mother'

export type PrimaryTab = {
  id: PrimaryTabId
  label: string
  researchLabel: string
}

export type TabVisibilityItem = {
  id: PrimaryTabId
  label: string
  enabled: boolean
  badge?: string
  hasData: boolean
  recommended?: boolean
}

export type TabVisibilityViewModel = {
  activeTab: PrimaryTabId
  availableTabs: TabVisibilityItem[]
}
