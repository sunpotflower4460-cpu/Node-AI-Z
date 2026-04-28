import type { OverviewMode } from './modeUiTypes'

export type ModeDisplayConfig = {
  label: string
  shortLabel: string
  description: string
  badge: string
  accentClass: string
  badgeClass: string
  borderClass: string
}

export const MODE_DISPLAY_CONFIG: Record<OverviewMode, ModeDisplayConfig> = {
  signal_mode: {
    label: 'New Signal Mode',
    shortLabel: 'New',
    description: '意味未満の点群・発火・結合から育つ新ノード',
    badge: '現在の主開発対象',
    accentClass: 'text-cyan-200',
    badgeClass: 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100',
    borderClass: 'border-cyan-400/30 bg-slate-950/90 shadow-cyan-500/10',
  },
  crystallized_thinking_legacy: {
    label: 'Crystallized Legacy',
    shortLabel: 'Legacy',
    description: 'これまでの結晶思考モード',
    badge: '旧系統',
    accentClass: 'text-violet-200',
    badgeClass: 'border-violet-400/40 bg-violet-500/15 text-violet-100',
    borderClass: 'border-violet-400/30 bg-slate-950/90 shadow-violet-500/10',
  },
  llm_mode: {
    label: 'LLM Mode',
    shortLabel: 'LLM',
    description: '外部LLM比較・補助用モード',
    badge: '比較用',
    accentClass: 'text-emerald-200',
    badgeClass: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-100',
    borderClass: 'border-emerald-400/30 bg-slate-950/90 shadow-emerald-500/10',
  },
}

export const OVERVIEW_MODE_ORDER: OverviewMode[] = [
  'signal_mode',
  'crystallized_thinking_legacy',
  'llm_mode',
]
