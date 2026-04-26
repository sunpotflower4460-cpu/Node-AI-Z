import type { SignalLoopState } from './signalLoopTypes'

/**
 * Create initial Signal Loop State.
 *
 * At the start, there is no history:
 * - No recent assemblies
 * - No self-echo
 * - No baseline activation
 * - Balanced boundary (no preference for internal vs external)
 */
export function createInitialSignalLoopState(): SignalLoopState {
  const now = Date.now()

  return {
    selfLoop: {
      recentAssemblyIds: [],
      recentActiveParticleIds: [],
      selfEchoStrength: 0.0,
      replayTendency: 0.0,
      baselineActivation: 0.0,
      internalRhythm: 0.0,
      lastUpdatedAt: now,
    },
    boundaryLoop: {
      sourceBalance: {
        external: 1.0,
        internal: 0.0,
        teacher: 0.0,
        future_mother: 0.0,
        future_aeterna: 0.0,
      },
      boundaryTension: 0.0,
      recentExternalStrength: 0.0,
      recentInternalStrength: 0.0,
      recentTeacherStrength: 0.0,
      predictionResidue: 0.0,
      lastUpdatedAt: now,
    },
  }
}
