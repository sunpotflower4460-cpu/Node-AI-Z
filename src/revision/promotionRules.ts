import type { ChangeStatus, ProposedChange, RevisionState } from './types'

export type ChangePromotionStats = {
  sameKeyOccurrences: number
  keepCount: number
  softenCount: number
  revertedCount: number
  isLocked: boolean
  currentStatus: ChangeStatus
}

export type PromotionSummary = {
  totalEntries: number
  ephemeralCount: number
  provisionalCount: number
  promotedCount: number
  revertedCount: number
  recentlyPromoted: Array<{
    kind: ProposedChange['kind']
    key: string
    status: ChangeStatus
    reason: string
  }>
  provisionalQueue: Array<{
    kind: ProposedChange['kind']
    key: string
    keepCount: number
    occurrences: number
    status: ChangeStatus
  }>
}

const PROVISIONAL_KEEP_THRESHOLD = 2
const PROMOTED_KEEP_THRESHOLD = 2
const PROMOTED_OCCURRENCE_THRESHOLD = 3
const SOFTEN_KEEP_PENALTY = 1

/**
 * Gather cross-entry stats for a specific change (same kind + key).
 */
export const getChangePromotionStats = (
  change: ProposedChange,
  state: RevisionState,
): ChangePromotionStats => {
  const { kind, key } = change
  const allSameKeyChanges: ProposedChange[] = []
  const entryHasChange = new Set<string>()

  for (const entry of state.memory.entries) {
    for (const c of entry.proposedChanges) {
      if (c.kind === kind && c.key === key) {
        allSameKeyChanges.push(c)
        entryHasChange.add(entry.id)
      }
    }
  }

  const keepCount = allSameKeyChanges.filter((c) => state.tuning.kept.has(c.id)).length
  const softenCount = allSameKeyChanges.filter((c) => state.tuning.softened.has(c.id)).length
  const revertedCount = allSameKeyChanges.filter((c) => state.tuning.reverted.has(c.id)).length
  const isLocked = state.tuning.locked.has(change.id)

  return {
    sameKeyOccurrences: entryHasChange.size,
    keepCount,
    softenCount,
    revertedCount,
    isLocked,
    currentStatus: change.status,
  }
}

/**
 * Derive new status for a change based on promotion rules.
 *
 * Rule 4: reverted changes stay reverted.
 * Rule 5: locked changes are not auto-changed.
 * Rule 1: keep >= 2 → provisional candidate.
 * Rule 2: occurrences >= 3 → provisional candidate.
 * Rule 3: keep >= 2 AND occurrences >= 3 → promoted.
 * Rule 6: soften raises thresholds by SOFTEN_KEEP_PENALTY.
 */
export const deriveChangeStatus = (
  change: ProposedChange,
  state: RevisionState,
): ChangeStatus => {
  if (state.tuning.reverted.has(change.id)) {
    return 'reverted'
  }
  if (state.tuning.locked.has(change.id)) {
    return change.status
  }

  const stats = getChangePromotionStats(change, state)
  const isSoftened = state.tuning.softened.has(change.id)
  const keepPenalty = isSoftened ? SOFTEN_KEEP_PENALTY : 0

  const provisionalKeepThreshold = PROVISIONAL_KEEP_THRESHOLD + keepPenalty
  const promotedKeepThreshold = PROMOTED_KEEP_THRESHOLD + keepPenalty

  const meetsKeepForPromoted = stats.keepCount >= promotedKeepThreshold
  const meetsOccurrenceForPromoted = stats.sameKeyOccurrences >= PROMOTED_OCCURRENCE_THRESHOLD
  const meetsKeepForProvisional = stats.keepCount >= provisionalKeepThreshold

  if (meetsKeepForPromoted && meetsOccurrenceForPromoted) {
    return 'promoted'
  }
  if (meetsKeepForProvisional || meetsOccurrenceForPromoted) {
    return 'provisional'
  }
  return 'ephemeral'
}

/**
 * Build a promotion summary over all entries for display in Observe.
 */
export const summarizePromotion = (state: RevisionState): PromotionSummary => {
  const entries = state.memory.entries

  const ephemeralCount = entries.filter((e) => e.status === 'ephemeral').length
  const provisionalCount = entries.filter((e) => e.status === 'provisional').length
  const promotedCount = entries.filter((e) => e.status === 'promoted').length
  const revertedCount = entries.filter((e) => e.status === 'reverted').length

  // Collect unique kind+key pairs that are promoted
  const promotedSeen = new Set<string>()
  const recentlyPromoted: PromotionSummary['recentlyPromoted'] = []
  for (const entry of entries) {
    for (const change of entry.proposedChanges) {
      const mapKey = `${change.kind}:${change.key}`
      if (change.status === 'promoted' && !promotedSeen.has(mapKey)) {
        promotedSeen.add(mapKey)
        recentlyPromoted.push({
          kind: change.kind,
          key: change.key,
          status: change.status,
          reason: change.reason,
        })
        if (recentlyPromoted.length >= 5) break
      }
    }
    if (recentlyPromoted.length >= 5) break
  }

  // Collect provisional queue: changes that are provisional but not yet promoted
  const provisionalSeen = new Set<string>()
  const provisionalQueue: PromotionSummary['provisionalQueue'] = []
  for (const entry of entries) {
    for (const change of entry.proposedChanges) {
      const mapKey = `${change.kind}:${change.key}`
      if (change.status === 'provisional' && !provisionalSeen.has(mapKey) && !promotedSeen.has(mapKey)) {
        provisionalSeen.add(mapKey)
        const stats = getChangePromotionStats(change, state)
        provisionalQueue.push({
          kind: change.kind,
          key: change.key,
          keepCount: stats.keepCount,
          occurrences: stats.sameKeyOccurrences,
          status: change.status,
        })
      }
    }
  }

  return {
    totalEntries: entries.length,
    ephemeralCount,
    provisionalCount,
    promotedCount,
    revertedCount,
    recentlyPromoted,
    provisionalQueue,
  }
}
