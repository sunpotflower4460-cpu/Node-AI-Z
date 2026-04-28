import type { ImplementationMode } from '../../types/experience'

export type OverviewMode = 'signal_mode' | 'crystallized_thinking_legacy' | 'llm_mode'
export type UiDetailMode = 'simple' | 'research'

export const getDefaultOverviewMode = (
  implementationMode?: ImplementationMode,
): OverviewMode => {
  if (implementationMode === 'llm_mode') {
    return 'llm_mode'
  }

  return 'signal_mode'
}
