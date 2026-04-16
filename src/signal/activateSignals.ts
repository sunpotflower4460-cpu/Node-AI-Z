import type { Signal, StimulusPacket } from './types'

type SignalDef = {
  id: string
  layer: Signal['layer']
  label: string
  triggers: string[]
  baseStrength: number
}

const SIGNAL_DEFS: SignalDef[] = [
  // other layer – external/environmental stimuli
  { id: 'work_pressure', layer: 'other', label: '仕事の重さ', triggers: ['仕事', '転職', '職場', '会社', '労働', '業務', '上司', '同僚'], baseStrength: 0.6 },
  { id: 'relational_friction', layer: 'other', label: '人との摩擦', triggers: ['人間関係', '人', '関係', '友達', '家族', '親', 'パートナー'], baseStrength: 0.5 },
  { id: 'social_expectation', layer: 'other', label: '社会の期待', triggers: ['社会', '周囲', '世間', 'みんな', '普通', 'ちゃんと'], baseStrength: 0.5 },
  { id: 'change_signal', layer: 'other', label: '変化の圧力', triggers: ['変化', '変わる', '変わりたい', '変えたい', '違う', '新し'], baseStrength: 0.55 },
  { id: 'time_pressure', layer: 'other', label: '時間の圧力', triggers: ['いつも', 'ずっと', 'もう', 'いつまで', '最近', 'なかなか'], baseStrength: 0.45 },

  // self layer – self-referential signals
  { id: 'self_reference', layer: 'self', label: '自己参照', triggers: ['自分', '私', '僕', '俺', 'わたし', 'じぶん'], baseStrength: 0.55 },
  { id: 'self_trust', layer: 'self', label: '自己信頼', triggers: ['信じ', '信頼', '自信', '信じられ', '信じきれ'], baseStrength: 0.65 },
  { id: 'self_exhaustion', layer: 'self', label: '自己疲弊', triggers: ['疲れ', '疲労', 'つかれ', 'しんどい', 'きつい', '消耗'], baseStrength: 0.7 },
  { id: 'self_limit', layer: 'self', label: '限界感', triggers: ['できない', '無理', '限界', 'もう無理', 'こなせ', '追いつかな'], baseStrength: 0.7 },
  { id: 'self_doubt', layer: 'self', label: '自己疑念', triggers: ['自分はだめ', 'だめな', '向いてない', 'ダメ', '弱い', '情けな'], baseStrength: 0.65 },

  // belief layer – values / meanings / fears
  { id: 'normative_belief', layer: 'belief', label: '規範信念', triggers: ['べき', 'はず', '正しい', 'ちゃんと', 'すべき', 'きちんと'], baseStrength: 0.6 },
  { id: 'meaning_seeking', layer: 'belief', label: '意味探索', triggers: ['意味', '価値', '目的', '理由', 'なぜ', '何のため'], baseStrength: 0.6 },
  { id: 'fear_signal', layer: 'belief', label: '恐れの発火', triggers: ['怖い', '不安', '恐怖', '心配', 'こわい', '怖くて'], baseStrength: 0.65 },
  { id: 'hope_signal', layer: 'belief', label: '希望の萌芽', triggers: ['希望', '前向き', 'きっと', 'かもしれない', '少しだけ', 'まだ'], baseStrength: 0.55 },
  { id: 'loss_belief', layer: 'belief', label: '喪失感', triggers: ['失う', '消えた', 'なくなっ', 'もう戻れ', '取り返せ', '後悔'], baseStrength: 0.6 },

  // field layer – ambient / pre-verbal signals
  { id: 'ambient_unease', layer: 'field', label: '漠然とした不安', triggers: ['なんとなく', 'なんか', 'どこか', 'なんだか', 'ふとした', 'もやもや'], baseStrength: 0.5 },
  { id: 'pre_verbal', layer: 'field', label: '言語化前の感覚', triggers: ['言葉にできない', '言えない', 'わからない', '分からない', 'うまく言えない', 'うまく'], baseStrength: 0.6 },
  { id: 'temporal_tension', layer: 'field', label: '時間的緊張', triggers: ['まだ', 'もう', 'いつ', 'これから', 'ずっと', 'いつまでも'], baseStrength: 0.45 },
  { id: 'bare_signal', layer: 'field', label: '素のシグナル', triggers: ['ただ', 'ただただ', 'ひたすら', 'とにかく', 'ただ…'], baseStrength: 0.45 },
  { id: 'boundary_awareness', layer: 'field', label: '境界の気配', triggers: ['もういや', 'いやだ', '嫌', '距離', '一人', 'ひとり', '孤独'], baseStrength: 0.55 },
]

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export const activateSignals = (stimulus: StimulusPacket): Signal[] => {
  const signals: Signal[] = []
  const text = stimulus.raw

  for (const def of SIGNAL_DEFS) {
    const matchedTriggers: string[] = []
    for (const trigger of def.triggers) {
      if (text.includes(trigger)) {
        matchedTriggers.push(trigger)
      }
    }
    if (matchedTriggers.length === 0) continue

    const matchBonus = (matchedTriggers.length - 1) * 0.07
    const intensityBonus = stimulus.intensity * 0.15
    const strength = clamp(def.baseStrength + matchBonus + intensityBonus, 0, 0.99)

    signals.push({
      id: def.id,
      layer: def.layer,
      label: def.label,
      strength,
      pathways: matchedTriggers,
    })
  }

  // Fallback: always fire a minimal field signal so the runtime never has zero signals
  if (signals.length === 0) {
    signals.push({
      id: 'ambient_unease',
      layer: 'field',
      label: '漠然とした不安',
      strength: 0.3 + stimulus.intensity * 0.1,
      pathways: ['fallback'],
    })
  }

  return signals.sort((a, b) => b.strength - a.strength)
}
