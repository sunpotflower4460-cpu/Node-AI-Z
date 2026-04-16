import type { ProtoMeaning, WordCandidate } from './types'

type TextureWordMap = Record<string, string[]>

const TEXTURE_WORDS: TextureWordMap = {
  heavy: [
    'かなり重たいものを持ちながら来た感じがあります',
    'ずっしりとした重さが伝わります',
    '疲れが積もったままの感じがします',
  ],
  searching: [
    'まだ答えが出ないまま、探し続けている感じがあります',
    'どこかに何かがある気がするけど、まだ見えていない感じがします',
    '方向を探りながら、ここにいる感じがします',
  ],
  still: [
    'まだ言葉になる手前で、ただそこにいる感じがあります',
    '静かに、でも確かに何かがあります',
    'うまく言えないまま、ここにある感じがします',
  ],
  fragile: [
    'ちょっとしたことで揺れそうな感じがあります',
    '少し触れただけでも崩れそうな感じがします',
    '繊細な場所に来ている感じがします',
  ],
  ambiguous: [
    'まだはっきりしないまま、何かが引っかかっている感じがあります',
    '言葉にしようとすると、するりと逃げていく感じがします',
    '分からないまま、でも確かに何かがある感じがします',
  ],
  hopeful: [
    '少しだけ、明るい方に向かおうとしている感じがあります',
    '小さいけれど、前向きな何かが残っています',
    'かすかに、でも確かな希望の感触があります',
  ],
  conflicted: [
    'どちらに動けばいいか分からない感じがあります',
    '二つの気持ちが同時に立っている感じがあります',
    '葛藤がそのまま残っている感じがあります',
  ],
  open: [
    '変わりたい気持ちが、静かにここにある感じがします',
    '何かが動き始めているような感触があります',
    '新しい方向を探している感じがあります',
  ],
  closed: [
    '一度、距離をとりたい感じがあります',
    '少し閉じた感じで、自分を守っている感じがあります',
    'ここで引いていたい感じがあります',
  ],
}

export const lexicalizeProtoMeanings = (protoMeanings: ProtoMeaning[]): WordCandidate[] => {
  return protoMeanings.map((pm) => {
    const pool = TEXTURE_WORDS[pm.texture] ?? TEXTURE_WORDS['still']
    const words = pool.slice(0, Math.min(2, pool.length))
    return {
      protoMeaningId: pm.id,
      words,
      confidence: pm.weight,
    }
  })
}
