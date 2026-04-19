/**
 * Session Brain Tab
 * Displays continuity information for the crystallized thinking mode.
 * Shows how the internal state persists and evolves across turns.
 */

import type { ObservationRecord } from '../../types/experience'

type SessionBrainTabProps = {
  observation: ObservationRecord
}

export const SessionBrainTab = ({ observation }: SessionBrainTabProps) => {
  const { nextBrainState, chunkedResult, dualStreamResult } = observation

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
          <div>Uncertainty Load: <span className="font-bold">{(nextBrainState.interoception.uncertaintyLoad * 100).toFixed(0)}%</span></div>
          <div>Novelty Hunger: <span className="font-bold">{(nextBrainState.interoception.noveltyHunger * 100).toFixed(0)}%</span></div>
          <div>Overload: <span className="font-bold">{(nextBrainState.interoception.overload * 100).toFixed(0)}%</span></div>
        </div>
      </div>

      {/* Workspace State */}
      <div className="rounded-lg border border-pink-200 bg-pink-50 p-4">
        <h3 className="text-sm font-bold text-pink-900 mb-2">Workspace State</h3>
        <div className="space-y-1 text-xs text-pink-700">
          <div>Phase: <span className="font-bold">{nextBrainState.workspace.currentPhase}</span></div>
          <div>Stability: <span className="font-bold">{(nextBrainState.workspace.stability * 100).toFixed(0)}%</span></div>
          <div>Held Items: <span className="font-bold">{nextBrainState.workspace.heldItems.length}</span></div>
        </div>
        {nextBrainState.workspace.heldItems.length > 0 && (
          <div className="mt-2 space-y-1">
            {nextBrainState.workspace.heldItems.slice(0, 5).map((item, idx) => (
              <div key={idx} className="text-xs text-pink-600">
                • {item.label} (salience: {item.salience.toFixed(2)}, source: {item.source})
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
    </div>
  )
}
