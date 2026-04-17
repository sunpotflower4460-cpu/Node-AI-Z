import type { ProtoMeaning } from '../meaning/types'
import type { MeaningChunk } from '../signal/ingest/chunkTypes'
import type { CoreNode, StateVector } from '../types/nodeStudio'
import type { OptionField, OptionNode } from './types'

type BuildOptionFieldsInput = {
  options: OptionNode[]
  chunks: MeaningChunk[]
  sensoryProtoMeanings: ProtoMeaning[]
  narrativeProtoMeanings: ProtoMeaning[]
  nodes: CoreNode[]
  field: StateVector
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const average = (...values: number[]) => values.reduce((total, value) => total + value, 0) / values.length

const resolveArchetype = (option: OptionNode) => {
  if (option.id.includes('change') || option.label.includes('変')) return 'change'
  if (option.id.includes('stay') || option.label.includes('続')) return 'stay'
  if (option.id.includes('rest') || option.label.includes('休')) return 'rest'
  if (option.id.includes('support') || option.label.includes('相談')) return 'support'
  return 'custom'
}

const countSourceMatches = (option: OptionNode, chunks: MeaningChunk[]) => {
  const chunkIndices = new Set(option.sourceChunkIds
    .map((chunkId) => Number(chunkId.replace('chunk:', '')))
    .filter((value) => Number.isFinite(value)))

  if (chunkIndices.size === 0) return 0

  const matched = chunks.filter((chunk) => chunkIndices.has(chunk.index))
  return Math.min(1, matched.length * 0.45)
}

export const buildOptionFields = ({
  options,
  chunks,
  sensoryProtoMeanings,
  narrativeProtoMeanings,
  nodes,
  field,
}: BuildOptionFieldsInput): OptionField[] => {
  const sensoryMap = new Map(sensoryProtoMeanings.map((meaning) => [meaning.id, meaning.strength]))
  const narrativeMap = new Map(narrativeProtoMeanings.map((meaning) => [meaning.id, meaning.strength]))
  const nodeMap = new Map(nodes.map((node) => [node.id, node.value]))

  const sensory = (id: string) => sensoryMap.get(id) ?? 0
  const narrative = (id: string) => narrativeMap.get(id) ?? 0
  const nodeValue = (id: string) => nodeMap.get(id) ?? 0

  return options.map((option) => {
    const archetype = resolveArchetype(option)
    const sourceMatch = countSourceMatches(option, chunks)

    let reasonWeight = 0
    let sensoryWeight = 0
    let expectationWeight = 0
    let identityFitWeight = 0
    let riskWeight = 0
    let resonanceWeight = 0
    let socialWeight = 0
    let energyCostWeight = 0

    switch (archetype) {
      case 'change':
        reasonWeight = clamp(
          narrative('narrative:searching_new_direction') * 0.3
          + narrative('narrative:threshold_of_change') * 0.24
          + narrative('narrative:needs_reorientation') * 0.18
          + field.change * 0.18
          + sourceMatch * 0.1,
        )
        sensoryWeight = clamp(
          sensory('sensory:open') * 0.34
          + sensory('sensory:bright_hint') * 0.22
          + (1 - sensory('sensory:heavy')) * 0.12
          + field.light * 0.12
          + nodeValue('wanting_change') * 0.2,
        )
        expectationWeight = clamp(
          sensory('sensory:bright_hint') * 0.28
          + narrative('narrative:threshold_of_change') * 0.22
          + nodeValue('faint_hope') * 0.18
          + field.light * 0.16
          + field.agency * 0.16,
        )
        identityFitWeight = clamp(
          nodeValue('wanting_change') * 0.26
          + nodeValue('seeking_understanding') * 0.16
          + field.self * 0.16
          + field.agency * 0.18
          + sourceMatch * 0.12,
        )
        riskWeight = clamp(
          narrative('narrative:do_not_push_yet') * 0.26
          + narrative('narrative:rushing_answer') * 0.18
          + nodeValue('anxiety') * 0.18
          + field.ambiguity * 0.18
          + sensory('sensory:pressed') * 0.2,
        )
        resonanceWeight = clamp(
          sensory('sensory:open') * 0.24
          + sensory('sensory:bright_hint') * 0.18
          + field.self * 0.16
          + field.relation * 0.12
          + sourceMatch * 0.14
          + narrative('narrative:searching_new_direction') * 0.16,
        )
        socialWeight = clamp(
          field.relation * 0.22
          + field.care * 0.18
          + nodeValue('seeking_understanding') * 0.16
          + sourceMatch * 0.1,
        )
        energyCostWeight = clamp(
          field.heaviness * 0.22
          + nodeValue('fatigue') * 0.18
          + nodeValue('ambiguity') * 0.16
          + field.urgency * 0.12
          + (1 - field.light) * 0.16
          + sensory('sensory:heavy') * 0.16,
        )
        break
      case 'stay':
        reasonWeight = clamp(
          narrative('narrative:do_not_push_yet') * 0.32
          + narrative('narrative:rushing_answer') * 0.14
          + nodeValue('safety') * 0.18
          + field.stability * 0.18
          + sourceMatch * 0.1,
        )
        sensoryWeight = clamp(
          sensory('sensory:closed') * 0.28
          + sensory('sensory:heavy') * 0.18
          + field.stability * 0.18
          + (1 - field.change) * 0.16
          + nodeValue('safety') * 0.2,
        )
        expectationWeight = clamp(
          field.stability * 0.28
          + narrative('narrative:do_not_push_yet') * 0.2
          + nodeValue('safety') * 0.2
          + field.relation * 0.12,
        )
        identityFitWeight = clamp(
          field.self * 0.16
          + field.relation * 0.16
          + field.stability * 0.2
          + nodeValue('routine') * 0.14
          + sourceMatch * 0.1,
        )
        riskWeight = clamp(
          narrative('narrative:losing_meaning') * 0.28
          + narrative('narrative:purpose_core_thinning') * 0.22
          + field.heaviness * 0.16
          + nodeValue('fatigue') * 0.14
          + sensory('sensory:stagnant') * 0.2,
        )
        resonanceWeight = clamp(
          nodeValue('safety') * 0.22
          + field.relation * 0.18
          + field.care * 0.16
          + sensory('sensory:closed') * 0.14
          + sourceMatch * 0.1,
        )
        socialWeight = clamp(
          field.relation * 0.2
          + field.care * 0.18
          + nodeValue('safety') * 0.16
          + sourceMatch * 0.08,
        )
        energyCostWeight = clamp(
          field.heaviness * 0.24
          + nodeValue('fatigue') * 0.2
          + nodeValue('routine') * 0.14
          + sensory('sensory:dull') * 0.18
          + sensory('sensory:stagnant') * 0.16,
        )
        break
      case 'rest':
        reasonWeight = clamp(
          narrative('narrative:fraying') * 0.28
          + narrative('narrative:do_not_push_yet') * 0.24
          + nodeValue('fatigue') * 0.2
          + field.fragility * 0.16
          + sourceMatch * 0.1,
        )
        sensoryWeight = clamp(
          sensory('sensory:heavy') * 0.28
          + sensory('sensory:closed') * 0.2
          + sensory('sensory:taut') * 0.16
          + field.heaviness * 0.18
          + (1 - field.agency) * 0.18,
        )
        expectationWeight = clamp(
          narrative('narrative:do_not_push_yet') * 0.18
          + field.care * 0.16
          + field.light * 0.12
          + (1 - field.urgency) * 0.18
          + nodeValue('safety') * 0.12,
        )
        identityFitWeight = clamp(
          field.care * 0.24
          + field.self * 0.16
          + field.fragility * 0.16
          + nodeValue('fatigue') * 0.18
          + sourceMatch * 0.08,
        )
        riskWeight = clamp(
          field.urgency * 0.2
          + narrative('narrative:rushing_answer') * 0.14
          + nodeValue('anxiety') * 0.14
          + sensory('sensory:pressed') * 0.12,
        )
        resonanceWeight = clamp(
          field.care * 0.22
          + field.self * 0.16
          + sensory('sensory:heavy') * 0.14
          + narrative('narrative:fraying') * 0.18
          + sourceMatch * 0.1,
        )
        socialWeight = clamp(
          field.relation * 0.14
          + field.care * 0.2
          + nodeValue('seeking_understanding') * 0.12,
        )
        energyCostWeight = clamp(
          field.urgency * 0.12
          + nodeValue('anxiety') * 0.12
          + sensory('sensory:pressed') * 0.12
          + sourceMatch * 0.08,
        )
        break
      case 'support':
        reasonWeight = clamp(
          field.relation * 0.24
          + field.care * 0.18
          + nodeValue('seeking_understanding') * 0.2
          + sourceMatch * 0.18,
        )
        sensoryWeight = clamp(
          sensory('sensory:swaying') * 0.18
          + sensory('sensory:open') * 0.16
          + field.relation * 0.14
          + field.depth * 0.16,
        )
        expectationWeight = clamp(
          field.relation * 0.24
          + field.light * 0.14
          + nodeValue('seeking_understanding') * 0.18
          + sourceMatch * 0.16,
        )
        identityFitWeight = clamp(
          field.self * 0.12
          + field.relation * 0.22
          + field.care * 0.18
          + sourceMatch * 0.14,
        )
        riskWeight = clamp(
          nodeValue('self_doubt') * 0.14
          + field.fragility * 0.12
          + narrative('narrative:rushing_answer') * 0.12,
        )
        resonanceWeight = clamp(
          field.relation * 0.2
          + field.care * 0.18
          + sourceMatch * 0.16
          + nodeValue('loneliness') * 0.14,
        )
        socialWeight = clamp(
          field.relation * 0.28
          + field.care * 0.18
          + sourceMatch * 0.16,
        )
        energyCostWeight = clamp(
          field.heaviness * 0.12
          + field.ambiguity * 0.14
          + nodeValue('anxiety') * 0.12,
        )
        break
      default:
        reasonWeight = clamp(average(field.change, field.stability, sourceMatch))
        sensoryWeight = clamp(average(sensory('sensory:swaying'), sensory('sensory:open'), sensory('sensory:closed')))
        expectationWeight = clamp(average(field.light, field.agency, sourceMatch))
        identityFitWeight = clamp(average(field.self, field.relation, field.care))
        riskWeight = clamp(average(field.ambiguity, field.fragility, field.urgency))
        resonanceWeight = clamp(average(field.self, field.relation, sourceMatch))
        socialWeight = clamp(average(field.relation, field.care, sourceMatch))
        energyCostWeight = clamp(average(field.heaviness, field.ambiguity, 1 - field.agency))
        break
    }

    const totalSupport = clamp(average(
      reasonWeight,
      sensoryWeight,
      expectationWeight,
      identityFitWeight,
      resonanceWeight,
      socialWeight,
    ))
    const totalResistance = clamp(average(riskWeight, energyCostWeight))
    const netPull = Math.max(-1, Math.min(1, totalSupport - totalResistance))

    return {
      optionId: option.id,
      reasonWeight,
      sensoryWeight,
      expectationWeight,
      identityFitWeight,
      riskWeight,
      resonanceWeight,
      socialWeight,
      energyCostWeight,
      totalSupport,
      totalResistance,
      netPull,
    }
  })
}
