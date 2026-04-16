import type { SignalRuntimeResult } from './types'
import { createStimulusPacket } from './createStimulusPacket'
import { activateSignals } from './activateSignals'
import { runSelfLoop } from './runSelfLoop'
import { runBoundaryLoop } from './runBoundaryLoop'
import { buildSignalField } from './buildSignalField'
import { bindSignals } from './bindSignals'
import { deriveProtoMeanings } from './deriveProtoMeanings'
import { decideSignalUtterance } from './decideSignalUtterance'
import { lexicalizeProtoMeanings } from './lexicalizeProtoMeanings'
import { bindSignalPhrases } from './bindSignalPhrases'
import { buildSignalSentencePlan } from './buildSignalSentencePlan'
import { renderSignalUtterance } from './renderSignalUtterance'
import { extractPathwayKeys } from '../learning/pathwayKeys'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Signal Runtime v0
 *
 * 外刺激 → 刺激受容 → 反応起動 → 自己ループ → 境界ループ
 * → 同時発火の場形成 → 結びつき → Proto-Meaning → 意思決定
 * → 単語候補化 → 句の結合 → 文骨格生成 → 発話
 */
export const runSignalRuntime = (inputText: string): SignalRuntimeResult => {
  const startedAt = now()
  const debug: string[] = ['Signal Runtime v0 started']

  // 1. 刺激受容
  const stimulus = createStimulusPacket(inputText)
  debug.push(`Stimulus: intensity=${stimulus.intensity.toFixed(2)}, valence=${stimulus.valence.toFixed(2)}, tokens=${stimulus.tokens.length}`)

  // 2. 反応起動 – multi-layer signal activation
  const signals = activateSignals(stimulus)
  debug.push(`Activated ${signals.length} signals: ${signals.map((s) => `${s.label}[${s.layer}](${s.strength.toFixed(2)})`).join(', ')}`)

  // 3. 自己ループ
  const selfLoopState = runSelfLoop(signals)
  debug.push(`Self loop: resonance=${selfLoopState.resonanceScore.toFixed(2)}, dominant=[${selfLoopState.dominantSignals.map((s) => s.label).join(', ')}]`)

  // 4. 境界ループ
  const boundaryLoopState = runBoundaryLoop(signals)
  debug.push(`Boundary loop: tension=${boundaryLoopState.boundaryTension.toFixed(2)}, internal=${boundaryLoopState.internalSignals.length}, external=${boundaryLoopState.externalSignals.length}`)

  // 5. 同時発火の場形成
  const signalField = buildSignalField(signals)
  debug.push(`Field: ${signalField.signals.length} active signals, ${signalField.coFiringGroups.length} co-firing groups, intensity=${signalField.fieldIntensity.toFixed(2)}`)

  // 6. 結びつき
  const bindings = bindSignals(signalField)
  debug.push(`Bindings: ${bindings.length} signal bindings`)

  // 7. Proto-Meaning
  const protoMeanings = deriveProtoMeanings(signalField, stimulus.valence)
  debug.push(`Proto-meanings: ${protoMeanings.map((pm) => `${pm.texture}(${pm.weight.toFixed(2)})`).join(', ')}`)

  // 8. 意思決定
  const decision = decideSignalUtterance(protoMeanings, boundaryLoopState.boundaryTension, selfLoopState.resonanceScore)
  debug.push(`Decision: mode=${decision.utteranceMode}, shouldSpeak=${decision.shouldSpeak}, intent=${decision.replyIntent ?? 'n/a'}`)

  // 9. 単語候補化
  const wordCandidates = lexicalizeProtoMeanings(protoMeanings)
  debug.push(`Word candidates: ${wordCandidates.length}`)

  // 10. 句の結合
  const phrasePlan = bindSignalPhrases(wordCandidates, protoMeanings)
  debug.push(`Phrase plan: ${phrasePlan.length} phrases`)

  // 11. 文骨格生成
  const sentencePlan = buildSignalSentencePlan(phrasePlan, protoMeanings, decision)
  debug.push(`Sentence plan: tone=${sentencePlan.tone}`)

  // 12. 発話
  const utterance = renderSignalUtterance(sentencePlan)

  // 13. パスウェイキー収集 (learning layers で使用)
  const pathwayKeys = [...new Set([
    ...extractPathwayKeys(signals),
    ...(decision.pathwayKeys ?? []),
  ])]

  debug.push(`Signal Runtime v0 completed. Pathway keys: ${pathwayKeys.length}`)

  const elapsedMs = now() - startedAt

  return {
    inputText,
    stimulus,
    signals,
    selfLoopState,
    boundaryLoopState,
    signalField,
    bindings,
    protoMeanings,
    decision,
    wordCandidates,
    phrasePlan,
    sentencePlan,
    utterance,
    debugNotes: debug,
    pathwayKeys,
    meta: { elapsedMs },
  }
}
