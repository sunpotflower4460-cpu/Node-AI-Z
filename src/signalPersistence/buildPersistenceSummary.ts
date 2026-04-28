import type { SignalModeSnapshot, SignalPersistenceSummary } from './signalPersistenceTypes'
import { validateSignalSnapshot } from './validateSignalSnapshot'

export function buildPersistenceSummary(snapshot: SignalModeSnapshot | null): SignalPersistenceSummary {
  if (!snapshot) {
    return { hasSnapshot: false, warnings: [] }
  }
  const validation = validateSignalSnapshot(snapshot)
  return {
    hasSnapshot: true,
    snapshotId: snapshot.id,
    version: snapshot.version,
    updatedAt: snapshot.updatedAt,
    particleCount: snapshot.metadata.particleCount,
    assemblyCount: snapshot.metadata.assemblyCount,
    bridgeCount: snapshot.metadata.bridgeCount,
    protoSeedCount: snapshot.metadata.protoSeedCount,
    developmentStage: snapshot.metadata.developmentStage,
    warnings: validation.warnings,
  }
}
