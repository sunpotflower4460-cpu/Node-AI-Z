export type UiDetailMode = 'simple' | 'research'

export type BilingualLabel = {
  simple: string
  research: string
}

export type EngineEntry = {
  simpleLabel: string
  researchLabel: string
  internalId: string
  description: string
  researchDescription: string
}

export type TabEntry = {
  title: string
  description: string
}

export type MetricEntry = {
  simpleLabel: string
  researchLabel: string
  description: string
}

export type EmptyStateEntry = {
  title: string
  description: string
  nextAction?: string
}

export type RiskLevelEntry = {
  label: string
  title: string
  body: string
}

export type RiskEntry = {
  simpleLabel: string
  researchLabel: string
  low: RiskLevelEntry
  medium: RiskLevelEntry
  high: RiskLevelEntry
}

export type GlossaryEntry = {
  term: string
  definition: string
  researchNote?: string
}
