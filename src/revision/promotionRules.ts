import type { ChangePromotionStats, ChangeStatus, PromotionSummary, PromotionSummaryItem, ProposedChange, RevisionEntry, RevisionState, ThickenedPipeSummaryItem } from './types'

const PROMOTION_STATUSES: ChangeStatus[] = ['ephemeral', 'provisional', 'promoted', 'reverted']
const PROVISIONAL_KEEP_THRESHOLD = 2
const PROMOTED_OCCURRENCE_THRESHOLD = 3
const PROVISIONAL_OCCURRENCE_THRESHOLD = 3
const SOFTENED_KEEP_PENALTY = 1
const PROMOTION_QUEUE_LIMIT = 5
const PROMOTED_RECENT_LIMIT = 5
const THICKENED_PIPE_LIMIT = 5

type ChangeRecord = {
  entry: RevisionEntry
  change: ProposedChange
}

const STATUS_PRIORITY: Record<ChangeStatus, number> = {
  reverted: 0,
  ephemeral: 1,
  provisional: 2,
  promoted: 3,
}

export const buildPromotionKey = (change: Pick<ProposedChange, 'kind' | 'key'>) => `${change.kind}:${change.key}`

export const normalizeChangeStatus = (status?: string | null): ChangeStatus => {
  if (status && PROMOTION_STATUSES.includes(status as ChangeStatus)) {
    return status as ChangeStatus
  }
  return 'ephemeral'
}

const isChangeReverted = (change: ProposedChange, state: RevisionState) => {
  return state.tuning.reverted.has(change.id) || normalizeChangeStatus(change.status) === 'reverted'
}

const getMatchingChanges = (state: RevisionState, target: Pick<ProposedChange, 'kind' | 'key'>): ChangeRecord[] => {
  const targetKey = buildPromotionKey(target)

  return state.memory.entries.flatMap((entry) => {
    return entry.proposedChanges
      .filter((change) => buildPromotionKey(change) === targetKey)
      .map((change) => ({ entry, change }))
  })
}

const getRequiredKeepCount = (state: RevisionState, change: ProposedChange) => {
  return PROVISIONAL_KEEP_THRESHOLD + (state.tuning.softened.has(change.id) ? SOFTENED_KEEP_PENALTY : 0)
}

const deriveAggregateStatus = (statuses: ChangeStatus[]): ChangeStatus => {
  if (statuses.length === 0) return 'ephemeral'
  if (statuses.every((status) => status === 'reverted')) return 'reverted'
  if (statuses.some((status) => status === 'promoted')) return 'promoted'
  if (statuses.some((status) => status === 'provisional')) return 'provisional'
  return 'ephemeral'
}

const summarizeReason = (records: ChangeRecord[], keepCount: number, occurrenceCount: number) => {
  const latestReason = records[0]?.change.reason ?? '昇格候補の記録です。'
  return `${latestReason} / keep ${keepCount} / seen ${occurrenceCount}`
}

const getPromotionGap = (item: PromotionSummaryItem) => {
  const keepGap = Math.max(0, PROVISIONAL_KEEP_THRESHOLD - item.keepCount)
  const occurrenceGap = Math.max(0, PROMOTED_OCCURRENCE_THRESHOLD - item.occurrenceCount)
  return keepGap + occurrenceGap
}

const sortByRecencyThenDelta = (first: PromotionSummaryItem, second: PromotionSummaryItem) => {
  const timeDifference = new Date(second.latestTimestamp).getTime() - new Date(first.latestTimestamp).getTime()
  if (timeDifference !== 0) {
    return timeDifference
  }
  return Math.abs(second.cumulativeDelta) - Math.abs(first.cumulativeDelta)
}

export const deriveEntryStatus = (entry: RevisionEntry): ChangeStatus => {
  if (entry.proposedChanges.length === 0) {
    return normalizeChangeStatus(entry.status)
  }
  return deriveAggregateStatus(entry.proposedChanges.map((change) => normalizeChangeStatus(change.status)))
}

export const getChangePromotionStats = (state: RevisionState, change: ProposedChange): ChangePromotionStats => {
  const matches = getMatchingChanges(state, change)
  const occurrenceSet = new Set(matches.map(({ entry }) => entry.id))
  const keepCount = matches.filter(({ change: currentChange }) => state.tuning.kept.has(currentChange.id)).length
  const softenCount = matches.filter(({ change: currentChange }) => state.tuning.softened.has(currentChange.id)).length
  const revertedCount = matches.filter(({ change: currentChange }) => isChangeReverted(currentChange, state)).length
  const isLocked = matches.some(({ change: currentChange }) => state.tuning.locked.has(currentChange.id))
  const statuses = matches.map(({ change: currentChange }) => normalizeChangeStatus(currentChange.status))

  return {
    sameKeyOccurrences: occurrenceSet.size,
    keepCount,
    softenCount,
    revertedCount,
    isLocked,
    currentlyPromoted: statuses.some((status) => status === 'promoted'),
    currentlyProvisional: statuses.some((status) => status === 'provisional'),
  }
}

export const deriveChangeStatus = (change: ProposedChange, state: RevisionState): ChangeStatus => {
  if (isChangeReverted(change, state)) {
    return 'reverted'
  }

  const stats = getChangePromotionStats(state, change)
  if (stats.isLocked) {
    return normalizeChangeStatus(change.status)
  }

  const requiredKeepCount = getRequiredKeepCount(state, change)
  if (stats.keepCount >= requiredKeepCount && stats.sameKeyOccurrences >= PROMOTED_OCCURRENCE_THRESHOLD) {
    return 'promoted'
  }

  if (stats.keepCount >= requiredKeepCount || stats.sameKeyOccurrences >= PROVISIONAL_OCCURRENCE_THRESHOLD) {
    return 'provisional'
  }

  return 'ephemeral'
}

export const summarizePromotion = (state: RevisionState): PromotionSummary => {
  const grouped = new Map<string, { records: ChangeRecord[]; item: PromotionSummaryItem }>()

  state.memory.entries.forEach((entry) => {
    entry.proposedChanges.forEach((change) => {
      const promotionKey = buildPromotionKey(change)
      const existing = grouped.get(promotionKey)
      const stats = getChangePromotionStats(state, change)
      const item: PromotionSummaryItem = {
        kind: change.kind,
        key: change.key,
        status: normalizeChangeStatus(change.status),
        cumulativeDelta: change.delta,
        keepCount: stats.keepCount,
        occurrenceCount: stats.sameKeyOccurrences,
        reasonSummary: change.reason,
        latestTimestamp: entry.timestamp,
        isLocked: stats.isLocked,
      }

      if (existing) {
        existing.records.push({ entry, change })
        existing.item.cumulativeDelta += change.delta
        existing.item.keepCount = stats.keepCount
        existing.item.occurrenceCount = stats.sameKeyOccurrences
        existing.item.isLocked = stats.isLocked
        existing.item.status = STATUS_PRIORITY[item.status] > STATUS_PRIORITY[existing.item.status] ? item.status : existing.item.status
      } else {
        grouped.set(promotionKey, { records: [{ entry, change }], item })
      }
    })
  })

  const items = Array.from(grouped.values()).map(({ records, item }) => {
    const statuses = records
      .filter(({ change }) => !state.tuning.reverted.has(change.id))
      .map(({ change }) => normalizeChangeStatus(change.status))
    const effectiveStatus = statuses.length > 0 ? deriveAggregateStatus(statuses) : 'reverted'

    return {
      ...item,
      status: effectiveStatus,
      reasonSummary: summarizeReason(records, item.keepCount, item.occurrenceCount),
    }
  })

  const growth = {
    totalEntries: state.memory.entries.length,
    ephemeralCount: state.memory.entries.filter((entry) => entry.status === 'ephemeral').length,
    provisionalCount: state.memory.entries.filter((entry) => entry.status === 'provisional').length,
    promotedCount: state.memory.entries.filter((entry) => entry.status === 'promoted').length,
    revertedCount: state.memory.entries.filter((entry) => entry.status === 'reverted').length,
  }

  const recentlyPromoted = items
    .filter((item) => item.status === 'promoted')
    .sort(sortByRecencyThenDelta)
    .slice(0, PROMOTED_RECENT_LIMIT)

  const provisionalQueue = items
    .filter((item) => item.status !== 'promoted' && item.status !== 'reverted')
    .sort((first, second) => {
      const gapDifference = getPromotionGap(first) - getPromotionGap(second)
      if (gapDifference !== 0) return gapDifference
      return STATUS_PRIORITY[second.status] - STATUS_PRIORITY[first.status] || new Date(second.latestTimestamp).getTime() - new Date(first.latestTimestamp).getTime()
    })
    .slice(0, PROMOTION_QUEUE_LIMIT)

  const topThickenedPipes: ThickenedPipeSummaryItem[] = [
    ...Object.entries(state.plasticity.relationBoosts).map(([key, delta]) => ({ kind: 'relation_weight' as const, key, delta })),
    ...Object.entries(state.plasticity.nodeBoosts).map(([key, delta]) => ({ kind: 'node_weight' as const, key, delta })),
    ...Object.entries(state.plasticity.homeTriggerBoosts).map(([key, delta]) => ({ kind: 'home_trigger' as const, key, delta })),
  ]
    .filter((item) => Math.abs(item.delta) > 0.001)
    .sort((first, second) => Math.abs(second.delta) - Math.abs(first.delta))
    .slice(0, THICKENED_PIPE_LIMIT)

  return {
    recentlyPromoted,
    provisionalQueue,
    growth,
    topThickenedPipes,
  }
}
