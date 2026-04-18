import type { ProtoMeaning as HierarchicalProtoMeaning, ProtoMeaningHierarchy } from '../meaning/types'
import type { ProtoMeaning as SignalProtoMeaning, ProtoMeaningInput } from './types'

type NormalizedProtoMeaningInput = {
  narrative: HierarchicalProtoMeaning[]
  sensory: HierarchicalProtoMeaning[]
  all: HierarchicalProtoMeaning[]
}

const clamp = (value: number) => Math.max(0, Math.min(1, value))

const toHierarchicalFromSignal = (protoMeanings: SignalProtoMeaning[]): NormalizedProtoMeaningInput => {
  const narrative: HierarchicalProtoMeaning[] = []
  const sensory: HierarchicalProtoMeaning[] = []

  for (const protoMeaning of protoMeanings) {
    const sourceNodeIds = protoMeaning.cluster.map((label) => label.replace(/\s+/g, '_'))

    switch (protoMeaning.texture) {
      case 'heavy':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '重い',
          strength: clamp(protoMeaning.weight),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['heavy', 'soft'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: '意味を見失いかけている',
          strength: clamp(protoMeaning.weight * 0.92),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['heavy', 'fragile'],
        })
        break
      case 'searching':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '揺れる',
          strength: clamp(protoMeaning.weight * 0.88),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['fragile'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: '新しい方向を探し始めている',
          strength: clamp(protoMeaning.weight),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['open'],
        })
        break
      case 'still':
        sensory.push({
          id: protoMeaning.id,
          level: 'sensory',
          glossJa: '閉じている',
          strength: clamp(protoMeaning.weight * 0.86),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['soft'],
        })
        break
      case 'fragile':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '張っている',
          strength: clamp(protoMeaning.weight * 0.9),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['tense', 'fragile'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: 'まだ押さない方がよい',
          strength: clamp(protoMeaning.weight * 0.94),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['soft', 'fragile'],
        })
        break
      case 'ambiguous':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '揺れる',
          strength: clamp(protoMeaning.weight),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['fragile'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: '意味を見失いかけている',
          strength: clamp(protoMeaning.weight * 0.9),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['fragile'],
        })
        break
      case 'hopeful':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: 'かすかに明るい',
          strength: clamp(protoMeaning.weight),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['bright_hint', 'soft'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: '変化の入り口にいる',
          strength: clamp(protoMeaning.weight * 0.96),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['open', 'bright_hint'],
        })
        break
      case 'conflicted':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '押されている',
          strength: clamp(protoMeaning.weight * 0.82),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['tense'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: '答えを急ぎすぎている',
          strength: clamp(protoMeaning.weight * 0.9),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['tense', 'fragile'],
        })
        break
      case 'open':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '開いている',
          strength: clamp(protoMeaning.weight),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['open', 'bright_hint'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: '新しい方向を探し始めている',
          strength: clamp(protoMeaning.weight * 0.95),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['open'],
        })
        break
      case 'closed':
        sensory.push({
          id: `${protoMeaning.id}:sensory`,
          level: 'sensory',
          glossJa: '閉じている',
          strength: clamp(protoMeaning.weight),
          sourceCueIds: [],
          sourceNodeIds,
          toneTags: ['soft', 'fragile'],
        })
        narrative.push({
          id: protoMeaning.id,
          level: 'narrative',
          glossJa: 'まだ押さない方がよい',
          strength: clamp(protoMeaning.weight * 0.94),
          sourceCueIds: [],
          sourceNodeIds,
          childIds: [`${protoMeaning.id}:sensory`],
          toneTags: ['soft', 'fragile'],
        })
        break
    }
  }

  const all = [...narrative, ...sensory].sort((left, right) => right.strength - left.strength)
  return { narrative, sensory, all }
}

export const normalizeProtoMeaningInput = (
  input: ProtoMeaningInput,
): NormalizedProtoMeaningInput => {
  if (!Array.isArray(input)) {
    const hierarchy = input as ProtoMeaningHierarchy
    return {
      narrative: [...hierarchy.narrative],
      sensory: [...hierarchy.sensory],
      all: [...hierarchy.all],
    }
  }

  if (input.length === 0) {
    return { narrative: [], sensory: [], all: [] }
  }

  const firstMeaning = input[0] as SignalProtoMeaning | HierarchicalProtoMeaning
  if ('level' in firstMeaning && 'glossJa' in firstMeaning) {
    const all = [...(input as HierarchicalProtoMeaning[])].sort((left, right) => right.strength - left.strength)
    return {
      narrative: all.filter((meaning) => meaning.level === 'narrative'),
      sensory: all.filter((meaning) => meaning.level === 'sensory'),
      all,
    }
  }

  return toHierarchicalFromSignal(input as SignalProtoMeaning[])
}
