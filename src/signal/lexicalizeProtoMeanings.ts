import type { ProtoMeaningInput, WordCandidate } from './types'
import { normalizeProtoMeaningInput } from './normalizeProtoMeaningInput'

type WordMap = Record<string, string[]>

const NARRATIVE_WORDS: WordMap = {
  崩れかけている: [
    'いまは少し崩れやすいところに来てる',
    '保ち方そのものが細くなってきてる',
    '踏んばりだけで持たせるにはきついかもしれない',
  ],
  意味を見失いかけている: [
    '何のために続けているのか見えにくくなってる',
    '意味の芯が少し薄れてる',
    '続ける理由の輪郭がぼやけてきてる',
  ],
  新しい方向を探し始めている: [
    '今のままじゃない向きを探し始めてる',
    '新しい方向を少し探り始めてる',
    '動き方を変える入口に足が向き始めてる',
  ],
  答えを急ぎすぎている: [
    '答えを急いで決めようとしすぎてるかもしれない',
    '結論の方に先に引っぱられてる感じがある',
    'まだ整理の前に答えだけ急がされてる',
  ],
  まだ押さない方がよい: [
    '今はまだ無理に押し進めない方がよさそう',
    'ここは急がず、触れ方をやわらかくした方がよさそう',
    'まだ力で前に出す段階ではなさそう',
  ],
  変化の入り口にいる: [
    'もう少しで向きが変わり始めそう',
    '変化の入り口には来てる',
    '新しい流れに足先がかかってる',
  ],
  休息より再定位が必要そう: [
    'ただ休むより、向きを置き直す方が要りそう',
    '疲れだけじゃなく、位置の取り直しが必要そう',
    '止まるより先に、どこへ向くかを整えたい感じがある',
  ],
  目的の芯が薄れている: [
    '目的の芯が少し薄れてきてる',
    '続ける軸の手応えが弱くなってる',
    '真ん中にあったはずのものが遠のいてる',
  ],
}

const SENSORY_WORDS: WordMap = {
  重い: ['かなり', '少し重く', 'だいぶ'],
  揺れる: ['揺らいでる', 'ぶれてる', '定まりにくい'],
  閉じている: ['そっと', '少し閉じ気味に', 'まだ守るように'],
  開いている: ['少し開きながら', 'ひらきかけで', '受け入れつつ'],
  押されている: ['押されるように', '急かされる感じで', '圧に引かれて'],
  鈍い: ['鈍く', '重鈍く', '平坦に'],
  張っている: ['張りつめて', 'こわばって', '緊張したまま'],
  かすかに明るい: ['かすかに', 'うっすら', 'ほんの少し'],
  乾いている: ['乾いた感じで', '潤いが薄く', 'からっとしたまま'],
  滞っている: ['滞るように', '詰まるように', '流れが止まり気味で'],
}

export const lexicalizeProtoMeanings = (protoMeanings: ProtoMeaningInput): WordCandidate[] => {
  const { narrative, sensory } = normalizeProtoMeaningInput(protoMeanings)

  const narrativeCandidates = narrative.map((meaning) => ({
    protoMeaningId: meaning.id,
    words: (NARRATIVE_WORDS[meaning.glossJa] ?? [`${meaning.glossJa}感じがあります`]).slice(0, 2),
    confidence: meaning.strength,
    sourceLevel: 'narrative' as const,
    role: 'core' as const,
    glossJa: meaning.glossJa,
  }))

  const sensoryCandidates = sensory.map((meaning) => ({
    protoMeaningId: meaning.id,
    words: (SENSORY_WORDS[meaning.glossJa] ?? [`${meaning.glossJa}感じで`]).slice(0, 2),
    confidence: meaning.strength,
    sourceLevel: 'sensory' as const,
    role: 'tone' as const,
    glossJa: meaning.glossJa,
  }))

  return [...narrativeCandidates, ...sensoryCandidates]
    .sort((left, right) => {
      if (left.role !== right.role) return left.role === 'core' ? -1 : 1
      return right.confidence - left.confidence
    })
}
