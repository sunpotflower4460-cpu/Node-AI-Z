import type { MeaningChunk, ChunkFeature } from './chunkTypes'

/**
 * Feature definitions: each feature has a set of trigger patterns (substrings).
 * Strength contribution per match is additive up to a cap.
 */
const FEATURE_DEFS: Array<{ id: string; triggers: string[]; perMatchStrength: number; cap: number }> = [
  {
    id: 'motivation_drop',
    triggers: ['意欲が湧かない', '意欲がわかない', 'やる気が出ない', 'やる気がない', '気力がない', 'する気になれない', 'やる気が湧かない', '意欲が出ない'],
    perMatchStrength: 0.55,
    cap: 0.9,
  },
  {
    id: 'monotony',
    triggers: ['ルーチンワーク', '毎日同じ', '繰り返し', '単調', '退屈', '代わり映えしない', '変わらない日々', '同じことの繰り返し'],
    perMatchStrength: 0.5,
    cap: 0.85,
  },
  {
    id: 'purpose_confusion',
    triggers: ['何のために', 'なぜ働いている', '意味が分からなくなる', '目的が', '働く意味', '分からなくなる', '何のために働いている', '何のために仕事'],
    perMatchStrength: 0.5,
    cap: 0.9,
  },
  {
    id: 'temporal_contrast',
    triggers: ['最近ずっと', 'ずっと', '長年', '以前は', 'このところ', '最近', '長い間'],
    perMatchStrength: 0.3,
    cap: 0.75,
  },
  {
    id: 'explicit_guidance_request',
    triggers: ['すべきか', 'どうすべき', 'どうしたら', '転職を考えるべきか', '新しい刺激を探すべきか', 'すべきでしょうか', 'どうすればいい', '転職すべき'],
    perMatchStrength: 0.5,
    cap: 0.9,
  },
  {
    id: 'distress_signal',
    triggers: ['困っています', '困っている', '悩んでいます', '悩んでいる', 'つらい', 'しんどい', '苦しい', '辛い', '苦しくなる'],
    perMatchStrength: 0.5,
    cap: 0.85,
  },
  {
    id: 'longing_for_recognition',
    triggers: ['分かってほしい', '理解してほしい', '聞いてほしい', 'ただ分かってほしい', '分かってもらいたい', '気づいてほしい'],
    perMatchStrength: 0.6,
    cap: 0.9,
  },
  {
    id: 'hope_signal',
    triggers: ['希望', '前向き', '少しだけ', '光がある', '光がある気がする', 'かすかな', 'まだ大丈夫'],
    perMatchStrength: 0.45,
    cap: 0.8,
  },
  {
    id: 'self_critique',
    triggers: ['自信がない', '自分なんて', 'ダメ', '信じきれない', '自分を信じられない', '自分が嫌', '自己嫌悪'],
    perMatchStrength: 0.55,
    cap: 0.9,
  },
  {
    id: 'uncertainty_expression',
    triggers: ['なんとなく', 'もやもや', '引っかかる', '言葉にできない', 'まだ言葉に', '漠然と', 'はっきりしない', 'ぼんやり'],
    perMatchStrength: 0.5,
    cap: 0.85,
  },
]

/**
 * Activate features from a list of meaning chunks.
 *
 * Each feature receives a rawStrength accumulated from all matching chunks.
 * Only features with rawStrength > 0 are returned.
 */
export const activateChunkFeatures = (chunks: MeaningChunk[]): ChunkFeature[] => {
  const features: ChunkFeature[] = []

  for (const def of FEATURE_DEFS) {
    let accumulated = 0
    const sourceChunkIndices: number[] = []

    for (const chunk of chunks) {
      let chunkContribution = 0
      for (const trigger of def.triggers) {
        if (chunk.text.includes(trigger)) {
          chunkContribution += def.perMatchStrength
        }
      }
      if (chunkContribution > 0) {
        accumulated += chunkContribution
        sourceChunkIndices.push(chunk.index)
      }
    }

    if (accumulated > 0) {
      const rawStrength = Math.min(accumulated, def.cap)
      features.push({
        id: def.id,
        rawStrength,
        strength: rawStrength,
        sourceChunkIndices,
      })
    }
  }

  return features
}
