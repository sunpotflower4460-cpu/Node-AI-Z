import type { SignalPersonalBranch } from '../signalBranch/signalBranchTypes'
import type { ContrastRecord } from './signalContrastTypes'

function buildContrastKey(sourceAssemblyId: string, targetAssemblyId: string): string {
  return [sourceAssemblyId, targetAssemblyId].sort().join('::')
}

export function recordContrastExperience(
  branch: SignalPersonalBranch,
  records: ContrastRecord[],
  timestamp: number,
): SignalPersonalBranch {
  if (records.length === 0) {
    return branch
  }

  const existing = new Map(
    branch.contrastRecords.map(record => [buildContrastKey(record.sourceAssemblyId, record.targetAssemblyId), record]),
  )

  for (const record of records) {
    const key = buildContrastKey(record.sourceAssemblyId, record.targetAssemblyId)
    const previous = existing.get(key)
    if (previous) {
      existing.set(key, {
        ...previous,
        relation: record.confidence >= previous.confidence ? record.relation : previous.relation,
        confidence: Math.max(previous.confidence, record.confidence),
        teacherAssisted: previous.teacherAssisted || record.teacherAssisted,
        selfDiscovered: previous.selfDiscovered || record.selfDiscovered,
        recurrenceCount: previous.recurrenceCount + 1,
        lastUpdatedAt: timestamp,
      })
    } else {
      existing.set(key, {
        ...record,
        recurrenceCount: Math.max(1, record.recurrenceCount),
        lastUpdatedAt: timestamp,
      })
    }
  }

  return {
    ...branch,
    contrastRecords: Array.from(existing.values()).sort((a, b) => b.lastUpdatedAt - a.lastUpdatedAt),
    updatedAt: timestamp,
  }
}
