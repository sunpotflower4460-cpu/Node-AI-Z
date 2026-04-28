import type { SignalModeSnapshot } from '../../signalPersistence/signalPersistenceTypes'
import type { SignalScenarioResult } from '../../signalScenario/signalScenarioTypes'
import type { TimelineEventType } from '../shared/TimelineBadge'

export type TimelineEvent = {
  id: string
  eventType: TimelineEventType
  timestamp: number
  title: string
  description: string
  score?: number
  scoreDelta?: number
  scoreLabel?: string
  notes?: string[]
  rawId?: string
}

export type HistoryTimelineViewModel = {
  events: TimelineEvent[]
  snapshotHistory: SnapshotHistoryEntry[]
  hasEvents: boolean
}

export type SnapshotHistoryEntry = {
  snapshotId: string
  updatedAt: number
  particleCount?: number
  assemblyCount?: number
  bridgeCount?: number
  developmentStage?: string
}

const formatSnapshotEntry = (snapshot: SignalModeSnapshot): SnapshotHistoryEntry => ({
  snapshotId: snapshot.id,
  updatedAt: snapshot.updatedAt,
  particleCount: snapshot.metadata.particleCount,
  assemblyCount: snapshot.metadata.assemblyCount,
  bridgeCount: snapshot.metadata.bridgeCount,
  developmentStage: snapshot.metadata.developmentStage,
})

const buildSnapshotEvent = (snapshot: SignalModeSnapshot): TimelineEvent => ({
  id: `snapshot_${snapshot.id}`,
  eventType: 'snapshot',
  timestamp: snapshot.updatedAt,
  title: 'Snapshot saved',
  description: `snapshot ${snapshot.id} を保存しました。`,
  rawId: snapshot.id,
})

const buildScenarioEvent = (result: SignalScenarioResult): TimelineEvent => ({
  id: `scenario_${result.scenarioId}_${result.endedAt}`,
  eventType: 'scenario',
  timestamp: result.endedAt,
  title: 'Scenario executed',
  description: `シナリオ ${result.scenarioId} を実行しました。`,
  scoreDelta: result.metrics.assemblyGrowth,
  scoreLabel: 'Assembly Growth',
  notes: result.notes,
  rawId: result.scenarioId,
})

export type BuildHistoryTimelineInput = {
  snapshots?: SignalModeSnapshot[]
  scenarioResults?: SignalScenarioResult[]
  stageChanges?: Array<{ fromStage: number; toStage: number; timestamp: number; unlockedCapability?: string }>
  riskEvents?: Array<{ level: 'low' | 'medium' | 'high'; timestamp: number; warning?: string }>
  bridgeEvents?: Array<{ bridgeId: string; newStage: string; timestamp: number; recallSuccess?: number; teacherDependency?: number }>
  consolidationEvents?: Array<{ timestamp: number; notes?: string[] }>
}

export const buildHistoryTimelineViewModel = (input: BuildHistoryTimelineInput): HistoryTimelineViewModel => {
  const events: TimelineEvent[] = []

  for (const snapshot of input.snapshots ?? []) {
    events.push(buildSnapshotEvent(snapshot))
  }

  for (const result of input.scenarioResults ?? []) {
    events.push(buildScenarioEvent(result))
  }

  for (const stageChange of input.stageChanges ?? []) {
    events.push({
      id: `stage_${stageChange.fromStage}_${stageChange.toStage}_${stageChange.timestamp}`,
      eventType: 'stage_change',
      timestamp: stageChange.timestamp,
      title: `Stage changed`,
      description: `Stage ${stageChange.fromStage} → Stage ${stageChange.toStage}${stageChange.unlockedCapability ? `. ${stageChange.unlockedCapability} unlocked` : ''}`,
    })
  }

  for (const riskEvent of input.riskEvents ?? []) {
    const isHigh = riskEvent.level === 'high'
    events.push({
      id: `risk_${riskEvent.level}_${riskEvent.timestamp}`,
      eventType: isHigh ? 'risk_detected' : 'risk_resolved',
      timestamp: riskEvent.timestamp,
      title: isHigh ? 'High risk detected' : `Risk returned to ${riskEvent.level}`,
      description: riskEvent.warning ?? `Risk level: ${riskEvent.level}`,
    })
  }

  for (const bridgeEvent of input.bridgeEvents ?? []) {
    events.push({
      id: `bridge_${bridgeEvent.bridgeId}_${bridgeEvent.timestamp}`,
      eventType: 'bridge_matured',
      timestamp: bridgeEvent.timestamp,
      title: 'Bridge matured',
      description: `${bridgeEvent.bridgeId} moved to ${bridgeEvent.newStage}`,
      score: bridgeEvent.recallSuccess,
      scoreLabel: bridgeEvent.recallSuccess !== undefined ? 'Recall Success' : undefined,
      notes: bridgeEvent.teacherDependency !== undefined
        ? [`Teacher Dependency: ${bridgeEvent.teacherDependency.toFixed(2)}`]
        : undefined,
      rawId: bridgeEvent.bridgeId,
    })
  }

  for (const consolidation of input.consolidationEvents ?? []) {
    events.push({
      id: `consolidation_${consolidation.timestamp}`,
      eventType: 'consolidation',
      timestamp: consolidation.timestamp,
      title: 'Consolidation ran',
      description: 'Sleep-phase consolidation が実行されました。',
      notes: consolidation.notes,
    })
  }

  events.sort((a, b) => b.timestamp - a.timestamp)

  const snapshotHistory = (input.snapshots ?? [])
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(formatSnapshotEntry)

  return {
    events,
    snapshotHistory,
    hasEvents: events.length > 0,
  }
}
