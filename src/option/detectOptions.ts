import type { ProtoMeaning } from '../meaning/types'
import type { MeaningChunk } from '../signal/ingest/chunkTypes'
import type { CoreNode, StateVector } from '../types/nodeStudio'
import type { OptionNode } from './types'

type DetectOptionsInput = {
  chunks: MeaningChunk[]
  narrativeProtoMeanings: ProtoMeaning[]
  nodes: CoreNode[]
  field: StateVector
}

type OptionCandidate = {
  id: string
  label: string
  triggers: string[]
  narrativeIds: string[]
  nodeIds: string[]
  fieldScore: (field: StateVector) => number
}

const OPTION_CANDIDATES: OptionCandidate[] = [
  {
    id: 'option:change',
    label: '変える',
    triggers: ['転職', '辞め', 'やめ', '離れ', '変え', '新しい方向', '別の道', '環境を変', '移る'],
    narrativeIds: ['narrative:searching_new_direction', 'narrative:threshold_of_change', 'narrative:needs_reorientation'],
    nodeIds: ['wanting_change', 'leaving', 'faint_hope', 'seeking_understanding'],
    fieldScore: (field) => field.change * 0.7 + field.light * 0.3,
  },
  {
    id: 'option:stay',
    label: '続ける',
    triggers: ['このまま', '続け', '留ま', 'とどま', '現状維持', '様子を見る', '踏みとどま'],
    narrativeIds: ['narrative:do_not_push_yet', 'narrative:rushing_answer'],
    nodeIds: ['safety', 'routine', 'self_doubt'],
    fieldScore: (field) => field.stability * 0.55 + field.fragility * 0.25 + (1 - field.change) * 0.2,
  },
  {
    id: 'option:rest',
    label: '休む',
    triggers: ['休む', '休職', '立ち止ま', '少し休', '距離をと', '距離を取', 'ペースを落と'],
    narrativeIds: ['narrative:fraying', 'narrative:losing_meaning', 'narrative:purpose_core_thinning', 'narrative:do_not_push_yet'],
    nodeIds: ['fatigue', 'self_doubt', 'anxiety'],
    fieldScore: (field) => field.heaviness * 0.4 + field.fragility * 0.35 + (1 - field.agency) * 0.25,
  },
  {
    id: 'option:support',
    label: '相談する',
    triggers: ['相談', '話してみ', '頼る', '助けを求め', '聞いてもら', '誰かに'],
    narrativeIds: ['narrative:losing_meaning', 'narrative:rushing_answer'],
    nodeIds: ['loneliness', 'seeking_understanding', 'anxiety'],
    fieldScore: (field) => field.relation * 0.45 + field.care * 0.35 + field.depth * 0.2,
  },
]

const clamp = (value: number) => Math.max(0, Math.min(1, value))
const chunkId = (index: number) => `chunk:${index}`

const scoreCandidate = (
  candidate: OptionCandidate,
  chunks: MeaningChunk[],
  narrativeIds: Set<string>,
  nodeIds: Set<string>,
  field: StateVector,
) => {
  const matchedChunks = chunks.filter((chunk) => candidate.triggers.some((trigger) => chunk.text.includes(trigger)))
  const chunkScore = Math.min(0.75, matchedChunks.length * 0.34)
  const narrativeScore = candidate.narrativeIds.some((id) => narrativeIds.has(id)) ? 0.24 : 0
  const nodeScore = candidate.nodeIds.some((id) => nodeIds.has(id)) ? 0.18 : 0
  const fieldScore = Math.min(0.24, candidate.fieldScore(field) * 0.24)

  return {
    score: clamp(chunkScore + narrativeScore + nodeScore + fieldScore),
    matchedChunkIds: matchedChunks.map((chunk) => chunkId(chunk.index)),
  }
}

export const detectOptions = ({
  chunks,
  narrativeProtoMeanings,
  nodes,
  field,
}: DetectOptionsInput): OptionNode[] => {
  const narrativeIds = new Set(narrativeProtoMeanings.map((meaning) => meaning.id))
  const nodeIds = new Set(nodes.map((node) => node.id))

  const detected = OPTION_CANDIDATES
    .map((candidate) => {
      const { score, matchedChunkIds } = scoreCandidate(candidate, chunks, narrativeIds, nodeIds, field)
      return score >= 0.42
        ? {
            id: candidate.id,
            label: candidate.label,
            sourceChunkIds: matchedChunkIds,
            score,
          }
        : undefined
    })
    .filter((candidate): candidate is OptionNode & { score: number } => Boolean(candidate))

  const detectedIds = new Set(detected.map((candidate) => candidate.id))
  const firstChunkId = chunks[0] ? [chunkId(chunks[0].index)] : []

  if (!detectedIds.has('option:change') && (
    narrativeIds.has('narrative:searching_new_direction')
    || narrativeIds.has('narrative:threshold_of_change')
    || nodeIds.has('wanting_change')
  )) {
    detected.push({ id: 'option:change', label: '変える', sourceChunkIds: firstChunkId, score: 0.46 })
  }

  if (!detectedIds.has('option:stay') && (
    narrativeIds.has('narrative:do_not_push_yet')
    || nodeIds.has('safety')
    || field.fragility > 0.58
  )) {
    detected.push({ id: 'option:stay', label: '続ける', sourceChunkIds: firstChunkId, score: 0.45 })
  }

  if (!detectedIds.has('option:rest') && (
    narrativeIds.has('narrative:fraying')
    || nodeIds.has('fatigue')
    || field.heaviness > 0.64
  )) {
    detected.push({ id: 'option:rest', label: '休む', sourceChunkIds: firstChunkId, score: 0.44 })
  }

  return detected
    .sort((left, right) => right.score - left.score)
    .slice(0, 4)
    .map(({ score: _score, ...node }) => node)
}
