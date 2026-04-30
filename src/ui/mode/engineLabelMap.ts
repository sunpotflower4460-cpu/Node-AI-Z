import type { OverviewMode } from './modeUiTypes'

export type EngineLabel = {
  full: string
  short: string
  description: string
}

export const ENGINE_LABEL_MAP: Record<OverviewMode, EngineLabel> = {
  signal_mode: {
    full: 'New Signal',
    short: 'New',
    description: '意味未満の点群から育つ',
  },
  crystallized_thinking_legacy: {
    full: 'Legacy',
    short: 'Legacy',
    description: 'これまでの結晶思考',
  },
  llm_mode: {
    full: 'LLM',
    short: 'LLM',
    description: '比較・補助',
  },
}

export const getEngineLabel = (mode: OverviewMode): EngineLabel =>
  ENGINE_LABEL_MAP[mode]
