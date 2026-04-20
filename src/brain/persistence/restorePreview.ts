/**
 * Restore Preview
 * Generates preview of what will change if restore is executed
 *
 * Phase M8: Snapshot generation management
 */

import type { SessionBrainState } from '../sessionBrainState'
import type { RestorePreview } from './types'

/**
 * Generate restore preview comparing current state to target state
 * Shows what will change if restore is executed
 */
export const generateRestorePreview = (
  current: SessionBrainState | undefined,
  target: SessionBrainState,
  sourceInfo: {
    source: RestorePreview['source']
    sourceSnapshotId?: string
  }
): RestorePreview => {
  const summary: string[] = []
  const cautionNotes: string[] = []

  // Basic info
  const currentTurnCount = current?.turnCount ?? 0
  const targetTurnCount = target.turnCount
  const currentUpdatedAt = current?.updatedAt ?? 0
  const targetUpdatedAt = target.updatedAt

  // Calculate diffs
  const afterglowChanged = current ? Math.abs(current.afterglow - target.afterglow) > 0.01 : true

  const currentEpisodicCount = current?.episodicTraces?.length ?? 0
  const targetEpisodicCount = target.episodicTraces?.length ?? 0
  const episodicCountDelta = targetEpisodicCount - currentEpisodicCount

  const currentSchemaCount = current?.schemaMemory?.patterns.length ?? 0
  const targetSchemaCount = target.schemaMemory?.patterns.length ?? 0
  const schemaCountDelta = targetSchemaCount - currentSchemaCount

  const currentMixedNodeCount = current?.mixedLatentPool?.length ?? 0
  const targetMixedNodeCount = target.mixedLatentPool?.length ?? 0
  const mixedNodeCountDelta = targetMixedNodeCount - currentMixedNodeCount

  // Interoception changed keys
  const interoceptionChangedKeys: string[] = []
  if (current?.interoception && target.interoception) {
    const currentIntero = current.interoception
    const targetIntero = target.interoception

    // Check each key for changes
    const keys: (keyof typeof currentIntero)[] = [
      'energy',
      'arousal',
      'socialSafety',
      'noveltyHunger',
      'overloadPressure',
    ]

    for (const key of keys) {
      if (Math.abs((currentIntero[key] ?? 0) - (targetIntero[key] ?? 0)) > 0.05) {
        interoceptionChangedKeys.push(key)
      }
    }
  }

  // Build summary
  if (!current) {
    summary.push('初期状態: 現在の脳状態がありません')
    summary.push(`復元先: ターン ${targetTurnCount}`)
  } else if (targetTurnCount > currentTurnCount) {
    summary.push(`ターン ${currentTurnCount} → ${targetTurnCount} (${targetTurnCount - currentTurnCount} ターン進んだ状態へ)`)
    cautionNotes.push('注意: 現在より未来の状態へ戻そうとしています')
  } else if (targetTurnCount < currentTurnCount) {
    summary.push(`ターン ${currentTurnCount} → ${targetTurnCount} (${currentTurnCount - targetTurnCount} ターン前の状態へ)`)
  } else {
    summary.push(`ターン ${currentTurnCount} (同じターン数)`)
  }

  // Time difference
  if (currentUpdatedAt && targetUpdatedAt) {
    const timeDiff = targetUpdatedAt - currentUpdatedAt
    const hoursDiff = Math.round(timeDiff / (1000 * 60 * 60))

    if (hoursDiff > 0) {
      summary.push(`時間: ${hoursDiff} 時間後の状態`)
      cautionNotes.push('注意: 現在より新しいタイムスタンプの状態へ戻そうとしています')
    } else if (hoursDiff < 0) {
      summary.push(`時間: ${Math.abs(hoursDiff)} 時間前の状態`)
    }
  }

  // Afterglow
  if (afterglowChanged && current) {
    summary.push(`残響: ${current.afterglow.toFixed(2)} → ${target.afterglow.toFixed(2)}`)
  }

  // Episodic traces
  if (episodicCountDelta !== 0) {
    summary.push(`エピソード記憶: ${episodicCountDelta > 0 ? '+' : ''}${episodicCountDelta} 件`)
  }

  // Schema patterns
  if (schemaCountDelta !== 0) {
    summary.push(`スキーマパターン: ${schemaCountDelta > 0 ? '+' : ''}${schemaCountDelta} 件`)
  }

  // Mixed nodes
  if (mixedNodeCountDelta !== 0) {
    summary.push(`混合ノード: ${mixedNodeCountDelta > 0 ? '+' : ''}${mixedNodeCountDelta} 件`)
  }

  // Interoception
  if (interoceptionChangedKeys.length > 0) {
    summary.push(`内受容状態: ${interoceptionChangedKeys.join(', ')} が変化`)
  }

  // Determine if recommended
  let recommended = false

  if (!current) {
    // Always recommend if no current state
    recommended = true
  } else if (targetTurnCount <= currentTurnCount && targetUpdatedAt <= currentUpdatedAt) {
    // Recommend if going back in time and turns
    recommended = true
  } else if (targetTurnCount > currentTurnCount || targetUpdatedAt > currentUpdatedAt) {
    // Not recommended if trying to go forward
    recommended = false
    cautionNotes.push('推奨されません: 通常、未来の状態へ戻すことは想定されていません')
  }

  // Additional caution notes
  if (episodicCountDelta < -5) {
    cautionNotes.push(`警告: エピソード記憶が ${Math.abs(episodicCountDelta)} 件減少します`)
  }

  if (schemaCountDelta < -3) {
    cautionNotes.push(`警告: スキーマパターンが ${Math.abs(schemaCountDelta)} 件減少します`)
  }

  return {
    sessionId: target.sessionId,
    sourceSnapshotId: sourceInfo.sourceSnapshotId,
    source: sourceInfo.source,
    currentTurnCount,
    targetTurnCount,
    currentUpdatedAt,
    targetUpdatedAt,
    summary,
    diffs: {
      afterglowChanged,
      episodicCountDelta,
      schemaCountDelta,
      mixedNodeCountDelta,
      interoceptionChangedKeys,
    },
    recommended,
    cautionNotes,
  }
}

/**
 * Generate preview for restoring from local snapshot
 */
export const previewRestoreFromLocalSnapshot = async (
  sessionId: string,
  snapshotId: string,
  currentState: SessionBrainState | undefined
): Promise<RestorePreview | undefined> => {
  const { loadSnapshotLocal } = await import('./snapshotManager')

  const snapshot = loadSnapshotLocal(snapshotId)
  if (!snapshot) {
    return undefined
  }

  return generateRestorePreview(currentState, snapshot.state, {
    source: 'local_snapshot',
    sourceSnapshotId: snapshotId,
  })
}

/**
 * Generate preview for restoring from remote snapshot
 */
export const previewRestoreFromRemoteSnapshot = async (
  sessionId: string,
  snapshotId: string,
  currentState: SessionBrainState | undefined
): Promise<RestorePreview | undefined> => {
  // TODO: Phase M8: Implement remote snapshot loading
  // For now, return undefined
  return undefined
}

/**
 * Generate preview for restoring from latest local state
 */
export const previewRestoreFromLatestLocal = async (
  sessionId: string,
  currentState: SessionBrainState | undefined
): Promise<RestorePreview | undefined> => {
  const { localBrainPersistence } = await import('./localBrainPersistence')

  const localState = await localBrainPersistence.load(sessionId)
  if (!localState) {
    return undefined
  }

  return generateRestorePreview(currentState, localState, {
    source: 'latest_local',
  })
}

/**
 * Generate preview for restoring from latest remote state
 */
export const previewRestoreFromLatestRemote = async (
  sessionId: string,
  currentState: SessionBrainState | undefined
): Promise<RestorePreview | undefined> => {
  const { remoteBrainPersistence } = await import('./remoteBrainPersistence')
  const { getPersistenceConfig } = await import('../../config/persistenceEnv')

  const config = getPersistenceConfig()
  if (!config.remoteEnabled) {
    return undefined
  }

  const remoteState = await remoteBrainPersistence.load(sessionId)
  if (!remoteState) {
    return undefined
  }

  return generateRestorePreview(currentState, remoteState, {
    source: 'latest_remote',
  })
}
