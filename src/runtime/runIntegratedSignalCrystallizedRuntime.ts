import type { PersonalLearningState } from '../learning/types'
import type { PlasticityState } from '../types/nodeStudio'
import type { SessionBrainState } from '../brain/sessionBrainState'
import type { Phase2AblationFlags } from '../config/phase2Flags'
import type { Phase3AblationFlags } from '../config/phase3Flags'
import type { CrystallizedThinkingResult } from './runtimeTypes'
import type { SignalVsLexicalComparison } from '../observe/buildSignalVsLexicalComparison'
import { runSignalFieldRuntime } from './runSignalFieldRuntime'
import { deriveProtoMeaningSeeds } from '../signalField/deriveProtoMeaningSeeds'
import { deriveMixedLatentSeeds } from '../signalField/deriveMixedLatentSeeds'
import { buildSignalFieldSummary } from '../signalField/buildSignalFieldSummary'
import { buildSignalVsLexicalComparison } from '../observe/buildSignalVsLexicalComparison'
import { runCrystallizedThinkingRuntime } from './runCrystallizedThinkingRuntime'

export type IntegratedSignalCrystallizedInput = {
  text: string
  plasticity?: PlasticityState
  personalLearning: PersonalLearningState
  personaId?: string
  brainState?: SessionBrainState
  phase2Flags?: Phase2AblationFlags
  phase3Flags?: Phase3AblationFlags
  /** Whether to run the Signal Field layer. Default true. */
  useSignalField?: boolean
}

export type IntegratedSignalCrystallizedResult = CrystallizedThinkingResult & {
  signalVsLexicalComparison?: SignalVsLexicalComparison
}

/**
 * Integrated orchestrator: Signal Field → crystallized_thinking bridge.
 *
 * Pipeline:
 *  1. runSignalFieldRuntime    — fire the particle field
 *  2. deriveProtoMeaningSeeds  — assembly/bridge/replay → pre-semantic seeds
 *  3. deriveMixedLatentSeeds   — seeds → latent axes (pull / instability / …)
 *  4. buildSignalFieldSummary  — compact Observe summary
 *  5. runCrystallizedThinkingRuntime — existing runtime, now with signal-derived input
 *  6. buildSignalVsLexicalComparison — Observe comparison
 *
 * The existing crystallized_thinking runtime is NOT replaced; signal paths are
 * layered in as optional, lightweight upstream inputs.
 */
export async function runIntegratedSignalCrystallizedRuntime(
  input: IntegratedSignalCrystallizedInput,
): Promise<IntegratedSignalCrystallizedResult> {
  const {
    text,
    plasticity,
    personalLearning,
    personaId,
    brainState,
    phase2Flags,
    phase3Flags,
    useSignalField = true,
  } = input

  // ── Step 1-4: Signal Field layer ─────────────────────────────────────────
  let signalFieldSummary: CrystallizedThinkingResult['signalFieldSummary'] | undefined
  let signalDerivedProtoSeeds: import('../signalField/signalFieldTypes').ProtoMeaningSeed[] = []
  let signalDerivedMixedSeeds: import('../signalField/signalFieldTypes').MixedLatentSeed[] = []
  let signalAssemblyIds: string[] = []
  let replayTriggered = false

  if (useSignalField) {
    const timestamp = Date.now()
    const sfResult = await runSignalFieldRuntime({
      stimulus: {
        modality: 'text',
        vector: textToVector(text),
        strength: Math.min(1.0, text.length / 200),
        timestamp,
      },
    })

    replayTriggered = sfResult.observe.newlyDetectedAssemblies.length > 0
    signalDerivedProtoSeeds = deriveProtoMeaningSeeds(sfResult.state)
    signalDerivedMixedSeeds = deriveMixedLatentSeeds(signalDerivedProtoSeeds)
    signalFieldSummary = buildSignalFieldSummary(
      sfResult.state,
      signalDerivedProtoSeeds,
      signalDerivedMixedSeeds,
      replayTriggered,
    )
    signalAssemblyIds = sfResult.state.assemblies.map(a => a.id)
  }

  // ── Step 5: Crystallized Thinking runtime ─────────────────────────────────
  const crystallizedResult = await runCrystallizedThinkingRuntime({
    text,
    plasticity,
    personalLearning,
    personaId,
    brainState,
    phase2Flags,
    phase3Flags,
    signalDerivedProtoSeeds,
    signalDerivedMixedSeeds,
    signalFieldSummary,
  })

  // ── Step 6: Observe comparison ───────────────────────────────────────────
  const signalVsLexicalComparison = buildSignalVsLexicalComparison({
    lexicalChunks: extractLexicalChunks(crystallizedResult),
    signalAssemblyIds,
    lexicalSensoryMeanings: crystallizedResult.protoMeanings?.sensory ?? [],
    lexicalNarrativeMeanings: crystallizedResult.protoMeanings?.narrative ?? [],
    signalProtoSeeds: signalDerivedProtoSeeds,
    signalMixedSeeds: signalDerivedMixedSeeds,
  })

  return {
    ...crystallizedResult,
    signalFieldSummary,
    signalDerivedProtoSeeds,
    signalDerivedMixedSeeds,
    signalVsLexicalComparison,
  }
}

/**
 * Convert text to a simple numeric vector for the particle field stimulus.
 * This is intentionally minimal — the signal field cares about the shape of
 * activity, not precise embeddings.
 */
function textToVector(text: string): number[] {
  const len = text.length
  return [
    Math.min(1, len / 100),
    text.includes('?') ? 1 : 0,
    text.includes('!') ? 0.8 : 0,
    (text.split(' ').length % 10) / 10,
    (text.charCodeAt(0) ?? 0) / 128,
  ]
}

function extractLexicalChunks(result: CrystallizedThinkingResult): string[] {
  const chunks: string[] = []
  const optionLabels = result.optionAwareness?.detectedOptions?.map(o => o.label) ?? []
  chunks.push(...optionLabels)
  const sensoryGloss = result.protoMeanings?.sensory?.map(m => m.glossJa) ?? []
  chunks.push(...sensoryGloss.slice(0, 3))
  return chunks
}
