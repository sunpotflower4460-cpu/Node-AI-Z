import type { EngineEntry } from './uiCopyTypes'
import type { OverviewMode } from '../mode/modeUiTypes'

export const ENGINE_COPY: Record<OverviewMode, EngineEntry> = {
  signal_mode: {
    simpleLabel: '新しい信号モード',
    researchLabel: 'New Signal Mode',
    internalId: 'signal_mode',
    description: '意味を最初から入れず、点群の発火・結びつき・想起から育つ新しいモードです。',
    researchDescription:
      'id: signal_mode — particle activation, assembly formation, bridge growth from scratch.',
  },
  crystallized_thinking_legacy: {
    simpleLabel: '旧・結晶思考',
    researchLabel: 'Crystallized Thinking Legacy',
    internalId: 'crystallized_thinking_legacy',
    description: 'これまで作ってきた結晶思考の仕組みを使うモードです。',
    researchDescription:
      'id: crystallized_thinking_legacy — comparison baseline for legacy crystallized thinking.',
  },
  llm_mode: {
    simpleLabel: 'LLM比較モード',
    researchLabel: 'LLM Mode',
    internalId: 'llm_mode',
    description: '外部LLMを使って、比較や補助を行うモードです。',
    researchDescription:
      'id: llm_mode — external LLM integration for comparison and assistance.',
  },
}

export const getEngineCopy = (mode: OverviewMode): EngineEntry => ENGINE_COPY[mode]
