/**
 * Signal Mother Export Types
 *
 * Defines the format for exporting Signal Mode patterns to Node Mother.
 * This PR creates the export format but does NOT actually connect to Mother.
 */

export type SignalMotherExportItem = {
  id: string
  sourceMode: 'signal_mode'
  itemType: 'assembly' | 'bridge' | 'proto_seed'
  sourceId: string
  readinessScore: number
  stabilityScore: number
  teacherDependencyScore?: number
  recallSuccessScore?: number
  recurrenceCount?: number
  labelCandidate?: string
  notes: string[]
}

export type SignalMotherExportPackage = {
  id: string
  createdAt: number
  sourceBranchId: string
  items: SignalMotherExportItem[]
  summary: {
    itemCount: number
    assemblyCount: number
    bridgeCount: number
    protoSeedCount: number
    averageReadiness: number
  }
}
