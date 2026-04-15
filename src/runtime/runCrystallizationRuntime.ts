import type { ApiProviderId } from '../types/apiProvider'
import type { PlasticityState } from '../revision/types'
import { bindNodes, liftPatterns } from '../core/runNodePipeline'
import { bootSource } from './bootSource'
import { deconditionSource } from './deconditionSource'
import { returnHome } from './returnHome'
import { loadSelfSubstrate } from './loadSelfSubstrate'
import { coActivate } from './coActivate'
import { buildField } from './buildField'
import { bindEmergences } from './bindEmergences'
import { riseMeanings } from './riseMeanings'
import { decideUtterance } from './decideUtterance'
import { renderUtterance } from './renderUtterance'
import type { CrystallizationRuntimeResult } from './types'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

export const runCrystallizationRuntime = (
  inputText: string,
  provider: ApiProviderId,
  plasticity?: PlasticityState,
): CrystallizationRuntimeResult => {
  const startedAt = now()
  const sourceBoot = bootSource(provider, inputText)
  const deconditioning = deconditionSource(sourceBoot)
  const homeReturn = returnHome(deconditioning)
  const selfSubstrate = loadSelfSubstrate(plasticity)
  const coActivationResult = coActivate(inputText, sourceBoot, homeReturn, selfSubstrate, plasticity)
  const otherNodes = coActivationResult.otherActivations.map((node) => ({
    id: node.id,
    label: node.label,
    category: node.category,
    value: node.value,
    reasons: [...node.reasons],
  }))
  const bound = bindNodes(otherNodes, plasticity)
  const lifted = liftPatterns(otherNodes, bound.bindings, plasticity)
  const relationalField = buildField(coActivationResult, homeReturn, plasticity)
  const emergentBindings = bindEmergences(coActivationResult, relationalField)
  const meaningRise = riseMeanings(coActivationResult, relationalField, emergentBindings)
  const selfDecision = decideUtterance(relationalField, meaningRise, coActivationResult.questionSignal)
  const crystallized = renderUtterance(coActivationResult, relationalField, meaningRise, selfDecision, homeReturn)
  const elapsedMs = now() - startedAt

  const pathwayKeysUsed = Array.from(new Set([
    ...selfSubstrate.pathwayBiases.filter((key) => {
      if (key === 'belief:protecting_aliveness->field:fragility') {
        return relationalField.fragility > 0.58
      }
      if (key === 'field:ambiguity->stance:stay_open') {
        return selfDecision.stance === 'stay_open'
      }
      if (key === 'home:overperformance->utterance:soften') {
        return homeReturn.homeCheck.reason === 'overperformance'
      }
      if (key === 'other:fatigue_signal->self:care_response') {
        return emergentBindings.some((binding) => binding.pathwayKey === key)
      }
      return false
    }),
    ...emergentBindings.flatMap((binding) => binding.pathwayKey ? [binding.pathwayKey] : []),
  ]))

  return {
    inputText,
    activatedNodes: otherNodes.sort((left, right) => right.value - left.value),
    suppressedNodes: coActivationResult.suppressedNodes.sort((left, right) => left.value - right.value),
    bindings: bound.bindings.sort((left, right) => right.weight - left.weight),
    liftedPatterns: lifted.liftedPatterns.sort((left, right) => right.score - left.score),
    stateVector: relationalField.stateVector,
    debugNotes: [
      'Crystallization runtime started',
      ...sourceBoot.debugNotes,
      ...deconditioning.debugNotes,
      ...homeReturn.debugNotes,
      'Self substrate loaded',
      ...coActivationResult.debugNotes,
      ...bound.debugNotes,
      ...lifted.debugNotes,
      ...relationalField.debugNotes,
      ...meaningRise.debugNotes,
      ...selfDecision.debugNotes,
      ...crystallized.debugNotes,
      `Crystallization runtime completed in ${elapsedMs.toFixed(2)} ms`,
    ],
    meta: {
      retrievalCount: otherNodes.length,
      bindingCount: bound.bindings.length,
      patternCount: lifted.liftedPatterns.length,
      elapsedMs,
    },
    sourceBoot,
    deconditioning,
    homeReturn,
    selfSubstrate,
    coActivation: coActivationResult,
    relationalField,
    emergentBindings,
    meaningRise,
    selfDecision,
    rawUtterance: crystallized.rawUtterance,
    utterance: crystallized.utterance,
    pathwayKeysUsed,
    legacyBindings: bound.bindings,
  }
}
