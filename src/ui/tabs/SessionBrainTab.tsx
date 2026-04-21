/**
 * Session Brain Tab
 * Displays continuity information for the crystallized thinking mode.
 * Shows how the internal state persists and evolves across turns.
 *
 * Phase M6: Added persistence state visualization (snapshots, journal, recovery)
 * Phase M8: Added snapshot catalog, restore preview, device tracking, conflict resolution
 */

import { useEffect, useMemo, useState } from 'react'
import type { ObservationRecord } from '../../types/experience'
import {
  loadPersistenceConfig,
  loadSnapshotMetadataList,
  getSessionJournalEvents,
  getRecoveryOptions,
  // Phase M8
  listSnapshotCatalog,
  getDeviceSessionSummary,
  hasConflict,
  getRetentionSummary,
  DEFAULT_RETENTION_POLICY,
} from '../../brain/persistence'

type SessionBrainTabProps = {
  observation: ObservationRecord
}

export const SessionBrainTab = ({ observation }: SessionBrainTabProps) => {
  const { nextBrainState, chunkedResult, dualStreamResult } = observation
  const aiSenseiMode =
    observation.aiSenseiConfig?.mode ??
    observation.guardianReviewResults?.find(result => result.aiSensei)?.aiSensei?.mode

  const aiSenseiReviews =
    observation.guardianReviewResults?.filter(
      result => result.actor === 'ai_sensei' || result.aiSensei
    ) ?? []

  // Phase M6: Load persistence state
  const [persistenceConfig] = useState(() => loadPersistenceConfig())
  const [recoveryOptions, setRecoveryOptions] = useState<Awaited<ReturnType<typeof getRecoveryOptions>> | null>(null)

  // Phase M8: Extended persistence state
  const [catalogSummary, setCatalogSummary] = useState<{
    total: number
    byGeneration: Record<string, number>
  } | null>(null)
  const [conflictStatus, setConflictStatus] = useState<Awaited<ReturnType<typeof hasConflict>> | null>(null)
  const [retentionSummary, setRetentionSummary] = useState<{
    kept: number
    pruned: number
  } | null>(null)
  const snapshotCount = useMemo(() => {
    if (!nextBrainState) {
      return 0
    }

    return loadSnapshotMetadataList().filter(
      meta => meta.sessionId === nextBrainState.sessionId
    ).length
  }, [nextBrainState])

  const journalCount = useMemo(() => {
    if (!nextBrainState) {
      return 0
    }

    return getSessionJournalEvents(nextBrainState.sessionId).length
  }, [nextBrainState])

  const deviceSummary = useMemo(() => {
    if (!nextBrainState) {
      return null
    }

    return getDeviceSessionSummary(nextBrainState.sessionId)
  }, [nextBrainState])

  useEffect(() => {
    if (nextBrainState) {
      // Fetch recovery options (async in Phase M7)
      getRecoveryOptions(nextBrainState.sessionId).then(options => {
        setRecoveryOptions(options)
      }).catch(error => {
        console.warn('Failed to get recovery options:', error)
      })

      // Phase M8: Load snapshot catalog
      listSnapshotCatalog(nextBrainState.sessionId).then(catalog => {
        const byGeneration: Record<string, number> = {
          turn: 0,
          manual: 0,
          safety: 0,
          restore_checkpoint: 0,
        }

        for (const entry of catalog) {
          byGeneration[entry.generation] = (byGeneration[entry.generation] ?? 0) + 1
        }

        setCatalogSummary({
          total: catalog.length,
          byGeneration,
        })

        // Get retention summary
        const retention = getRetentionSummary(catalog, DEFAULT_RETENTION_POLICY)
        setRetentionSummary({
          kept: retention.summary.kept,
          pruned: retention.summary.pruned,
        })
      }).catch(error => {
        console.warn('Failed to load snapshot catalog:', error)
      })

      // Phase M8: Check for conflicts
      hasConflict(nextBrainState.sessionId).then(conflict => {
        setConflictStatus(conflict)
      }).catch(error => {
        console.warn('Failed to check conflict status:', error)
      })
    }
  }, [nextBrainState])

  if (!nextBrainState) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
        Session brain state not available (only active in crystallized_thinking mode)
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Session Overview */}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="text-sm font-bold text-indigo-900 mb-2">Session Continuity</h3>
        <div className="space-y-1 text-xs text-indigo-700">
          <div>Session ID: <span className="font-mono">{nextBrainState.sessionId.slice(0, 16)}...</span></div>
          <div>Turn Count: <span className="font-bold">{nextBrainState.turnCount}</span></div>
          <div>Afterglow: <span className="font-bold">{(nextBrainState.afterglow * 100).toFixed(1)}%</span> (residual activation from previous turn)</div>
          <div>Recent Activity: <span className="font-bold">{(nextBrainState.recentActivityAverage * 100).toFixed(1)}%</span></div>
          <div>Field Intensity: <span className="font-bold">{(nextBrainState.recentFieldIntensity * 100).toFixed(1)}%</span></div>
        </div>
      </div>

      {/* Temporal States */}
      <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
        <h3 className="text-sm font-bold text-purple-900 mb-2">Temporal Feature States</h3>
        <div className="text-xs text-purple-700 mb-2">
          {nextBrainState.temporalStates.size} features with temporal history
        </div>
        {nextBrainState.temporalStates.size > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {Array.from(nextBrainState.temporalStates.entries()).slice(0, 10).map(([id, state]) => (
              <div key={id} className="text-xs text-purple-600 font-mono">
                {id}: strength={state.strength.toFixed(2)}, lastFired={state.lastFiredTurn}
              </div>
            ))}
            {nextBrainState.temporalStates.size > 10 && (
              <div className="text-xs text-purple-500 italic">
                ... and {nextBrainState.temporalStates.size - 10} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Micro Signal Dimensions */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="text-sm font-bold text-blue-900 mb-2">Micro Signal Dimensions</h3>
        <div className="space-y-1 text-xs text-blue-700">
          <div>Field Tone: <span className="font-bold">{nextBrainState.microSignalDimensions.fieldTone}</span></div>
          <div>Active Cue Count: <span className="font-bold">{nextBrainState.microSignalDimensions.activeCueCount}</span></div>
          <div>Fused Confidence: <span className="font-bold">{(nextBrainState.microSignalDimensions.fusedConfidence * 100).toFixed(1)}%</span></div>
        </div>
        {dualStreamResult && (
          <div className="mt-2 pt-2 border-t border-blue-200">
            <div className="text-xs text-blue-600">
              Current turn: {dualStreamResult.activeCues.length} active cues, tone="{dualStreamResult.microSignalState.fieldTone}"
            </div>
          </div>
        )}
      </div>

      {/* Prediction State */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="text-sm font-bold text-green-900 mb-2">Prediction Prior (carried to next turn)</h3>
        <div className="space-y-1 text-xs text-green-700">
          <div>Confidence: <span className="font-bold">{(nextBrainState.predictionState.confidence * 100).toFixed(1)}%</span></div>
          <div>Expected Features: <span className="font-bold">{nextBrainState.predictionState.expectedFeatureIds.length}</span></div>
          {nextBrainState.predictionState.expectedFeatureIds.length > 0 && (
            <div className="font-mono text-xs text-green-600">
              {nextBrainState.predictionState.expectedFeatureIds.slice(0, 5).join(', ')}
              {nextBrainState.predictionState.expectedFeatureIds.length > 5 && '...'}
            </div>
          )}
        </div>
        {chunkedResult?.predictionModulationResult && (
          <div className="mt-2 pt-2 border-t border-green-200">
            <div className="text-xs text-green-600">
              This turn surprise: <span className="font-bold">{(chunkedResult.predictionModulationResult.overallSurprise * 100).toFixed(1)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Interoceptive State */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="text-sm font-bold text-amber-900 mb-2">Interoceptive State</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-amber-700">
          <div>Energy: <span className="font-bold">{(nextBrainState.interoception.energy * 100).toFixed(0)}%</span></div>
          <div>Arousal: <span className="font-bold">{(nextBrainState.interoception.arousal * 100).toFixed(0)}%</span></div>
          <div>Social Safety: <span className="font-bold">{(nextBrainState.interoception.socialSafety * 100).toFixed(0)}%</span></div>
          <div>Uncertainty Tolerance: <span className="font-bold">{(nextBrainState.interoception.uncertaintyTolerance * 100).toFixed(0)}%</span></div>
          <div>Novelty Hunger: <span className="font-bold">{(nextBrainState.interoception.noveltyHunger * 100).toFixed(0)}%</span></div>
          <div>Overload: <span className="font-bold">{(nextBrainState.interoception.overload * 100).toFixed(0)}%</span></div>
          <div>Recovery Pressure: <span className="font-bold">{(nextBrainState.interoception.recoveryPressure * 100).toFixed(0)}%</span></div>
        </div>
      </div>

      {/* Workspace State */}
      <div className="rounded-lg border border-pink-200 bg-pink-50 p-4">
        <h3 className="text-sm font-bold text-pink-900 mb-2">Workspace State</h3>
        <div className="space-y-1 text-xs text-pink-700">
          <div>Phase: <span className="font-bold">{nextBrainState.workspace.phase}</span></div>
          <div>Stability: <span className="font-bold">{(nextBrainState.workspace.stability * 100).toFixed(0)}%</span></div>
          <div>Held Items: <span className="font-bold">{nextBrainState.workspace.heldItems.length}</span></div>
          <div>Distractor Pressure: <span className="font-bold">{(nextBrainState.workspace.distractorPressure * 100).toFixed(0)}%</span></div>
          <div>Phase Timer: <span className="font-bold">{nextBrainState.workspace.phaseTimer} turns</span></div>
        </div>
        {nextBrainState.workspace.heldItems.length > 0 && (
          <div className="mt-2 space-y-1">
            {nextBrainState.workspace.heldItems.slice(0, 5).map((item, idx) => (
              <div key={idx} className="text-xs text-pink-600">
                • {item.content} (strength: {item.strength.toFixed(2)}, age: {item.age} turns)
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Episodic Buffer */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Episodic Buffer</h3>
        <div className="text-xs text-slate-700 mb-2">
          {nextBrainState.episodicBuffer.length} episodic segments stored
        </div>
        {nextBrainState.episodicBuffer.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {nextBrainState.episodicBuffer.slice(-5).reverse().map((entry, idx) => (
              <div key={idx} className="text-xs border-l-2 border-slate-300 pl-2 text-slate-600">
                <div>Turn {entry.turn} {entry.summary && `- ${entry.summary}`}</div>
                {entry.boundaryScore !== undefined && (
                  <div className="text-slate-500">Boundary: {entry.boundaryScore.toFixed(2)}</div>
                )}
                {entry.surpriseMagnitude !== undefined && (
                  <div className="text-slate-500">Surprise: {(entry.surpriseMagnitude * 100).toFixed(0)}%</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continuity Note */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
        <div className="text-xs text-emerald-800">
          💾 <span className="font-bold">Continuity enabled:</span> This state persists across page reloads and app restarts.
          When you return, the system remembers where it left off - the afterglow, predictions, interoception, and workspace contents all carry forward.
        </div>
      </div>

      {(aiSenseiMode || aiSenseiReviews.length > 0) && (
        <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-4">
          <h3 className="text-sm font-bold text-fuchsia-900 mb-2">AI Sensei Guardian Review</h3>
          <div className="space-y-3 text-xs text-fuchsia-800">
            <div>
              <span className="font-semibold">AI Sensei Mode:</span>{' '}
              <span className="font-mono">{aiSenseiMode ?? 'not_recorded'}</span>
            </div>
            {aiSenseiReviews.length === 0 ? (
              <div>No AI sensei guardian reviews were recorded on this turn.</div>
            ) : (
              aiSenseiReviews.map(review => (
                <div
                  key={`${review.requestId}-${review.createdAt}`}
                  className="rounded border border-fuchsia-200 bg-white/70 p-3"
                >
                  <div className="font-semibold text-fuchsia-900">
                    Request {review.requestId}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="font-semibold">AI Sensei Payload Summary:</span>{' '}
                      {review.aiSensei?.payload.summary.length
                        ? review.aiSensei.payload.summary.join(' / ')
                        : 'none'}
                    </div>
                    <div>
                      <span className="font-semibold">AI Sensei Raw Response Summary:</span>{' '}
                      {review.aiSensei?.rawResponse
                        ? [
                            review.aiSensei.rawResponse.decision,
                            review.aiSensei.rawResponse.confidence !== undefined
                              ? `confidence=${review.aiSensei.rawResponse.confidence.toFixed(2)}`
                              : undefined,
                            review.aiSensei.rawResponse.rawText,
                          ]
                            .filter(Boolean)
                            .join(' | ')
                        : 'none'}
                    </div>
                    <div>
                      <span className="font-semibold">AI Sensei Parsed Review:</span>{' '}
                      {review.aiSensei?.parsedReview
                        ? `success=${review.aiSensei.parsedReview.success}, decision=${review.aiSensei.parsedReview.decision}, confidence=${review.aiSensei.parsedReview.confidence.toFixed(2)}`
                        : 'none'}
                    </div>
                    <div>
                      <span className="font-semibold">Fallback Notes:</span>{' '}
                      {review.aiSensei?.fallbackNotes.length
                        ? review.aiSensei.fallbackNotes.join(' / ')
                        : 'none'}
                    </div>
                    <div>
                      <span className="font-semibold">Final Guardian Decision:</span>{' '}
                      {review.finalDecision
                        ? `${review.finalDecision.guardianDecision} -> ${review.finalDecision.finalStatus}`
                        : review.decision}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Phase M6: Persistence State */}
      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
        <h3 className="text-sm font-bold text-cyan-900 mb-2">Persistence Infrastructure (Phase M6)</h3>

        {/* Persistence Mode */}
        <div className="mb-3 pb-3 border-b border-cyan-200">
          <div className="text-xs text-cyan-700 mb-1">
            <span className="font-bold">Mode:</span> {persistenceConfig.mode}
          </div>
          <div className="text-xs text-cyan-600">
            {persistenceConfig.mode === 'local' && 'Local storage only (browser-based)'}
            {persistenceConfig.mode === 'remote' && 'Remote storage (Mother Core Server)'}
            {persistenceConfig.mode === 'hybrid' && 'Local + Remote (best resilience)'}
          </div>
        </div>

        {/* Snapshot State */}
        <div className="mb-3 pb-3 border-b border-cyan-200">
          <div className="text-xs text-cyan-700 mb-1">
            <span className="font-bold">Snapshots:</span> {snapshotCount} available
            {persistenceConfig.snapshotEnabled && (
              <span className="ml-2 text-cyan-600">
                (interval: every {persistenceConfig.snapshotInterval} turns)
              </span>
            )}
          </div>
          {recoveryOptions?.hasSnapshots && recoveryOptions.latestSnapshotTurn !== undefined && (
            <div className="text-xs text-cyan-600">
              Latest snapshot: Turn {recoveryOptions.latestSnapshotTurn}
              {recoveryOptions.latestSnapshotAge && (
                <span className="ml-2">
                  ({Math.floor(recoveryOptions.latestSnapshotAge / 1000 / 60)} min ago)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Journal State */}
        <div className="mb-3 pb-3 border-b border-cyan-200">
          <div className="text-xs text-cyan-700 mb-1">
            <span className="font-bold">Journal:</span> {journalCount} events recorded
            {persistenceConfig.journalEnabled && (
              <span className="ml-2 text-cyan-600">
                (max: {persistenceConfig.maxJournalEntries} entries)
              </span>
            )}
          </div>
          {recoveryOptions?.hasJournal && recoveryOptions.latestJournalTurn !== undefined && (
            <div className="text-xs text-cyan-600">
              Latest event: Turn {recoveryOptions.latestJournalTurn}
            </div>
          )}
        </div>

        {/* Recovery Capability */}
        <div>
          <div className="text-xs text-cyan-700 mb-1">
            <span className="font-bold">Recovery:</span> {
              recoveryOptions?.hasSnapshots || recoveryOptions?.hasJournal
                ? 'Available'
                : 'Not yet available'
            }
          </div>
          {recoveryOptions && (recoveryOptions.hasSnapshots || recoveryOptions.hasJournal) && (
            <div className="text-xs text-cyan-600">
              Can recover from{' '}
              {recoveryOptions.hasSnapshots && 'snapshots'}
              {recoveryOptions.hasSnapshots && recoveryOptions.hasJournal && ' and '}
              {recoveryOptions.hasJournal && 'journal events'}
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-3 pt-3 border-t border-cyan-200 text-xs text-cyan-600">
          🏗️ Phase M6: Infrastructure ready for Mother Core Server.
          Snapshot/journal/recovery mechanisms are in place, backend integration deferred to future phases.
        </div>
      </div>

      {/* Phase M8: Snapshot Generation Management */}
      {catalogSummary && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-bold text-emerald-900 mb-2">Snapshot Catalog (Phase M8)</h3>

          <div className="mb-3 pb-3 border-b border-emerald-200">
            <div className="text-xs text-emerald-700 mb-1">
              <span className="font-bold">Total Snapshots:</span> {catalogSummary.total}
            </div>
            <div className="text-xs text-emerald-600 space-y-0.5">
              <div>• Turn: {catalogSummary.byGeneration.turn} (automatic, every N turns)</div>
              <div>• Manual: {catalogSummary.byGeneration.manual} (user-created)</div>
              <div>• Safety: {catalogSummary.byGeneration.safety} (pre-restore backups)</div>
              <div>• Restore Checkpoint: {catalogSummary.byGeneration.restore_checkpoint} (post-restore markers)</div>
            </div>
          </div>

          {retentionSummary && (
            <div className="mb-3 pb-3 border-b border-emerald-200">
              <div className="text-xs text-emerald-700 mb-1">
                <span className="font-bold">Retention Policy:</span>
              </div>
              <div className="text-xs text-emerald-600">
                {retentionSummary.kept} snapshots kept, {retentionSummary.pruned} would be pruned
              </div>
            </div>
          )}

          <div className="text-xs text-emerald-600">
            ✨ Snapshot generations allow safe restore operations with preview and rollback
          </div>
        </div>
      )}

      {/* Phase M8: Device Session Tracking */}
      {deviceSummary && (
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
          <h3 className="text-sm font-bold text-teal-900 mb-2">Multi-Device Tracking (Phase M8)</h3>

          <div className="mb-3 pb-3 border-b border-teal-200">
            <div className="text-xs text-teal-700 mb-1">
              <span className="font-bold">Devices:</span> {deviceSummary.totalDevices}
            </div>
            <div className="text-xs text-teal-600">
              {deviceSummary.isThisPrimary ? '✓ This device is primary' : '○ This device is secondary'}
            </div>
          </div>

          {deviceSummary.thisDevice && (
            <div className="mb-3 pb-3 border-b border-teal-200">
              <div className="text-xs text-teal-700 mb-1">
                <span className="font-bold">This Device:</span>
              </div>
              <div className="text-xs text-teal-600 space-y-0.5">
                <div>Label: {deviceSummary.thisDevice.deviceLabel ?? 'Unknown'}</div>
                <div>Turn: {deviceSummary.thisDevice.turnCount}</div>
                <div>Last Saved: {new Date(deviceSummary.thisDevice.lastSavedAt).toLocaleString()}</div>
              </div>
            </div>
          )}

          <div className="text-xs text-teal-600">
            🔄 Device tracking enables seamless multi-device session continuity
          </div>
        </div>
      )}

      {/* Phase M8: Conflict Resolution */}
      {conflictStatus && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-900 mb-2">Conflict Resolution (Phase M8)</h3>

          <div className="mb-3 pb-3 border-b border-amber-200">
            <div className="text-xs text-amber-700 mb-1">
              <span className="font-bold">Status:</span> {conflictStatus.hasConflict ? 'Conflict detected' : 'No conflicts'}
            </div>
            {conflictStatus.hasConflict && (
              <div className="text-xs text-amber-600 space-y-0.5 mt-1">
                <div>Sources: {conflictStatus.sources.join(', ')}</div>
                {conflictStatus.details.map((detail, i) => (
                  <div key={i}>• {detail}</div>
                ))}
              </div>
            )}
          </div>

          <div className="text-xs text-amber-600">
            {conflictStatus.hasConflict
              ? '⚠️ Multiple sources have different states - resolve before continuing'
              : '✓ All sources are synchronized'}
          </div>
        </div>
      )}

      {/* Phase M8: Info Note */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
        <div className="text-xs text-violet-700">
          <div className="font-bold mb-2">🚀 Phase M8: Snapshot Management & Restore</div>
          <div className="space-y-1 text-violet-600">
            <div>• Snapshot catalog tracks generation types (turn, manual, safety, checkpoint)</div>
            <div>• Retention policy prevents unbounded growth</div>
            <div>• Restore preview shows what will change before execution</div>
            <div>• Safety snapshots created automatically before restore</div>
            <div>• Device session registry tracks multi-device access</div>
            <div>• Conflict resolver chooses best source when differences exist</div>
          </div>
        </div>
      </div>
    </div>
  )
}
