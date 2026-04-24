import type { SignalFieldState, ProtoMeaningSeed, MixedLatentSeed } from './signalFieldTypes'

export type SignalFieldSummary = {
  activeParticleCount: number
  activeLinkCount: number
  assemblyCount: number
  protoMeaningSeedCount: number
  mixedLatentSeedCount: number
  bridgeCount: number
  replayTriggered: boolean
}

/**
 * Build a compact Observe-ready summary of the current Signal Field state.
 * Embeds seed counts so downstream (Observe, CrystallizedThinkingResult) can display them.
 */
export function buildSignalFieldSummary(
  state: SignalFieldState,
  protoSeeds: ProtoMeaningSeed[],
  mixedSeeds: MixedLatentSeed[],
  replayTriggered: boolean,
): SignalFieldSummary {
  const activeParticleCount = state.particles.filter(p => p.activation > 0.1).length
  const activeLinkCount = state.links.filter(l => l.weight > 0.1).length

  return {
    activeParticleCount,
    activeLinkCount,
    assemblyCount: state.assemblies.length,
    protoMeaningSeedCount: protoSeeds.length,
    mixedLatentSeedCount: mixedSeeds.length,
    bridgeCount: state.crossModalBridges.length,
    replayTriggered,
  }
}
