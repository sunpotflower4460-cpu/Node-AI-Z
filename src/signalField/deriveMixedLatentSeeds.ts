import type { ProtoMeaningSeed, MixedLatentSeed } from './signalFieldTypes'

/**
 * Derive MixedLatentSeeds from ProtoMeaningSeeds.
 *
 * This is the second bridge step: converting pre-semantic seeds into the
 * abstract latent-axis form that the crystallized_thinking mixed-node layer expects.
 * Final meaning labels are still NOT assigned here.
 */

let _seedCounter = 0

function nextSeedId(prefix: string, count: number): string {
  return `${prefix}_${++_seedCounter}_n${count}`
}

export function deriveMixedLatentSeeds(seeds: ProtoMeaningSeed[]): MixedLatentSeed[] {
  if (seeds.length === 0) return []

  const mixed: MixedLatentSeed[] = []

  // Group seeds by type for axis derivation
  const assemblySeeds = seeds.filter(s => s.seedType === 'assembly_cluster')
  const bridgeSeeds = seeds.filter(s => s.seedType === 'bridge_cluster')
  const replaySeeds = seeds.filter(s => s.seedType === 'replay_cluster')

  // --- Assembly group → latent axes ---
  if (assemblySeeds.length > 0) {
    const avgStrength = mean(assemblySeeds.map(s => s.strength))
    const hasRepetition = assemblySeeds.some(s => s.features.includes('repeated_cluster'))
    const hasInstability = assemblySeeds.some(s => s.features.includes('unstable_scatter'))
    const hasDense = assemblySeeds.some(s => s.features.includes('dense_local_binding'))
    const hasHub = assemblySeeds.some(s => s.features.includes('hub_like_activity'))
    const hasHighReplay = assemblySeeds.some(s => s.features.includes('high_replay_recurrence'))

    mixed.push({
      id: nextSeedId('mlseed_assembly', assemblySeeds.length),
      sourceSeedIds: assemblySeeds.map(s => s.id),
      weight: avgStrength,
      axes: {
        pull: hasDense || hasHub ? avgStrength * 0.7 : avgStrength * 0.3,
        avoidance: hasInstability ? 0.6 : 0.1,
        openness: hasInstability ? 0.6 : hasDense ? 0.2 : 0.4,
        instability: hasInstability ? 0.7 : 0.1,
        repetition: hasRepetition || hasHighReplay ? avgStrength * 0.8 : 0.1,
        crossModalBinding: 0.0,
      },
    })
  }

  // --- Bridge group → latent axes (cross-modal binding is primary) ---
  if (bridgeSeeds.length > 0) {
    const avgStrength = mean(bridgeSeeds.map(s => s.strength))

    mixed.push({
      id: nextSeedId('mlseed_bridge', bridgeSeeds.length),
      sourceSeedIds: bridgeSeeds.map(s => s.id),
      weight: avgStrength,
      axes: {
        pull: avgStrength * 0.5,
        avoidance: 0.0,
        openness: avgStrength * 0.6,
        instability: 0.0,
        repetition: 0.0,
        crossModalBinding: avgStrength,
      },
    })
  }

  // --- Replay group → latent axes ---
  if (replaySeeds.length > 0) {
    const avgStrength = mean(replaySeeds.map(s => s.strength))
    const hasHighReplay = replaySeeds.some(s => s.features.includes('high_replay_recurrence'))
    const hasRepeated = replaySeeds.some(s => s.features.includes('repeated_cluster'))

    mixed.push({
      id: nextSeedId('mlseed_replay', replaySeeds.length),
      sourceSeedIds: replaySeeds.map(s => s.id),
      weight: avgStrength,
      axes: {
        pull: avgStrength * 0.4,
        avoidance: 0.0,
        openness: avgStrength * 0.3,
        instability: 0.0,
        repetition: hasHighReplay || hasRepeated ? avgStrength * 0.9 : avgStrength * 0.5,
        crossModalBinding: 0.0,
      },
    })
  }

  return mixed
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}
