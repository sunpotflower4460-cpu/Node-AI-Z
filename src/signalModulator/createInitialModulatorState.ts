import type { SignalModulatorState } from './signalModulatorTypes'

export function createInitialModulatorState(): SignalModulatorState {
  return {
    novelty: 0.5,
    uncertainty: 0.5,
    fatigue: 0.2,
    stability: 0.2,
    overload: 0.1,
    explorationBias: 0.5,
    learningRateMultiplier: 1,
    teacherReliance: 0.5,
    updatedAt: Date.now(),
    notes: ['Initial exploratory modulation state'],
  }
}
