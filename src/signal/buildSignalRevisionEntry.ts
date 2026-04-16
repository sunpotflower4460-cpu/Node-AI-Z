import type { SignalRuntimeResult } from './types'
import type { RevisionEntry } from '../revision/revisionTypes'

const generateId = () => `sigrev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

/**
 * Build a RevisionEntry from a SignalRuntimeResult.
 * Pathway-based learning hooks: the revision entry records which signal
 * pathways fired so future sessions can reinforce those routes.
 */
export const buildSignalRevisionEntry = (result: SignalRuntimeResult): RevisionEntry => {
  const topSignals = result.signals.slice(0, 3).map((s) => s.label)
  const textures = result.protoMeanings.map((pm) => pm.texture)
  const issueTags: string[] = []

  // Flag high boundary tension as a potential revision signal
  if (result.boundaryLoopState.boundaryTension > 0.7) {
    issueTags.push('high_boundary_tension')
  }

  // Flag ambiguous or still proto-meanings as pre-verbal signal
  if (textures.includes('ambiguous') || textures.includes('still')) {
    issueTags.push('pre_verbal_signal')
  }

  // Flag conflicted proto-meanings
  if (textures.includes('conflicted')) {
    issueTags.push('conflicted_signal')
  }

  const note = [
    `Signal mode: ${result.decision.utteranceMode}`,
    `Proto-meanings: ${textures.join(', ')}`,
    `Top signals: ${topSignals.join(', ')}`,
    'Pathway weights are candidates for reinforcement on next interaction.',
  ].join(' / ')

  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    inputText: result.inputText,
    rawReply: result.utterance,
    adjustedReply: result.utterance,
    issueTags,
    note,
    proposedChanges: [],
    status: 'ephemeral',
  }
}
