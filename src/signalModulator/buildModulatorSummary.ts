import type { SignalModulatorState } from './signalModulatorTypes'

export type SignalModulatorSummary = SignalModulatorState & {
  mode: 'explore' | 'stabilize' | 'recover'
}

export function buildModulatorSummary(state: SignalModulatorState): SignalModulatorSummary {
  const mode = state.overload >= 0.65 || state.fatigue >= 0.65
    ? 'recover'
    : state.stability >= 0.55
      ? 'stabilize'
      : 'explore'

  return {
    ...state,
    mode,
  }
}
