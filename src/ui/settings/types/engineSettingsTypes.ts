import type { EngineMode } from './settingsUiTypes'

export type EngineCardConfig = {
  id: EngineMode
  label: string
  shortLabel: string
  description: string
  shortDescription: string
  accentClass: string
  borderClass: string
  badgeText: string
  badgeClass: string
  internalId: string
}
