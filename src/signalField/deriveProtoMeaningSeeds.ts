import type { SignalFieldState, ProtoMeaningSeed } from './signalFieldTypes'

/**
 * Derive ProtoMeaningSeeds from a SignalFieldState.
 *
 * These seeds are the first step in the Signal Field → crystallized_thinking bridge.
 * They are intentionally pre-semantic: no high-level labels (e.g. "sadness").
 * Only structural / statistical features of the firing pattern are captured.
 */
export function deriveProtoMeaningSeeds(state: SignalFieldState): ProtoMeaningSeed[] {
  const seeds: ProtoMeaningSeed[] = []

  // --- Assembly-cluster seeds ---
  for (const assembly of state.assemblies) {
    if (assembly.recurrenceCount < 1) continue

    const features: string[] = []

    if (assembly.recurrenceCount >= 5) features.push('high_replay_recurrence')
    if (assembly.recurrenceCount >= 3) features.push('repeated_cluster')
    if (assembly.averageCoactivation >= 0.8) features.push('dense_local_binding')
    if (assembly.particleIds.length >= 20) features.push('hub_like_activity')
    if (assembly.averageCoactivation < 0.4) features.push('unstable_scatter')

    seeds.push({
      id: `pmseed_assembly_${assembly.id}`,
      sourceAssemblyIds: [assembly.id],
      strength: assembly.averageCoactivation * Math.min(assembly.recurrenceCount / 5, 1.0),
      seedType: 'assembly_cluster',
      features,
    })
  }

  // --- Bridge-cluster seeds ---
  for (const bridge of state.crossModalBridges) {
    const srcAssembly = state.assemblies.find(a => a.id === bridge.sourceAssemblyId)
    const tgtAssembly = state.assemblies.find(a => a.id === bridge.targetAssemblyId)
    if (!srcAssembly || !tgtAssembly) continue

    const features: string[] = ['cross_modal_same_object']
    if (bridge.stage === 'reinforced' || bridge.stage === 'promoted') {
      features.push('dense_local_binding')
    }

    seeds.push({
      id: `pmseed_bridge_${bridge.id}`,
      sourceAssemblyIds: [bridge.sourceAssemblyId, bridge.targetAssemblyId],
      strength: bridge.confidence,
      seedType: 'bridge_cluster',
      features,
    })
  }

  // --- Replay-cluster seeds (from proto-meanings that carry replay history) ---
  for (const proto of state.protoMeanings) {
    const features: string[] = ['focused_reactivation']
    if (proto.strength >= 2.0) features.push('high_replay_recurrence')
    if (proto.strength >= 3.0) features.push('repeated_cluster')

    seeds.push({
      id: `pmseed_proto_${proto.id}`,
      sourceAssemblyIds: proto.assemblyIds,
      sourceProtoMeaningIds: [proto.id],
      strength: Math.min(proto.strength / 5, 1.0),
      seedType: 'replay_cluster',
      features,
    })
  }

  return seeds
}
