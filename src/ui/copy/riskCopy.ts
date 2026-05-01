import type { RiskEntry } from './uiCopyTypes'

export type RiskTypeId = 'overbinding' | 'falseBinding' | 'teacherOvertrust' | 'dreamNoise'

export const RISK_COPY: Record<RiskTypeId, RiskEntry> = {
  overbinding: {
    simpleLabel: '過結合傾向',
    researchLabel: 'Overbinding Risk',
    low: {
      label: '落ち着いています',
      title: '結びつきの増え方は安定しています',
      body: '現在、結びつきの増え方は安定しています。',
    },
    medium: {
      label: '少し注意が必要です',
      title: '結びつきに偏りが出始めています',
      body: '結びつきの増え方に偏りが出始めています。追加の検証をおすすめします。',
    },
    high: {
      label: '確認が必要です',
      title: '未成熟な結びつきが強くなりすぎている可能性があります',
      body: '未成熟な結びつきが強くなりすぎている可能性があります。昇格や保存の前に、検証してください。',
    },
  },
  falseBinding: {
    simpleLabel: '誤結合傾向',
    researchLabel: 'False Binding Risk',
    low: {
      label: '落ち着いています',
      title: '誤った結びつきは少ない状態です',
      body: '誤った結びつきは少ない状態です。',
    },
    medium: {
      label: '少し注意が必要です',
      title: '誤った結びつきが一部含まれている可能性があります',
      body: '誤った結びつきが一部含まれている可能性があります。追加の検証をおすすめします。',
    },
    high: {
      label: '確認が必要です',
      title: '誤った結びつきが残存している可能性があります',
      body: '誤った結びつきが残存している可能性が高い状態です。昇格や保存の前に、検証してください。',
    },
  },
  teacherOvertrust: {
    simpleLabel: '先生過信傾向',
    researchLabel: 'Teacher Overtrust Risk',
    low: {
      label: '落ち着いています',
      title: '先生への依存は適切な範囲内です',
      body: '先生への依存は適切な範囲内です。',
    },
    medium: {
      label: '少し注意が必要です',
      title: '先生依存に偏りが出始めています',
      body: '先生への依存がやや高い傾向があります。自立した想起を増やすと改善できます。',
    },
    high: {
      label: '確認が必要です',
      title: '先生由来の結びつきが強くなりすぎています',
      body: '先生由来の結びつきが想起成功前に強くなりすぎています。先生なしでの検証を増やしてください。',
    },
  },
  dreamNoise: {
    simpleLabel: '夢ノイズ傾向',
    researchLabel: 'Dream Noise Risk',
    low: {
      label: '落ち着いています',
      title: '夢ノイズは少ない状態です',
      body: '夢ノイズは少ない状態です。',
    },
    medium: {
      label: '少し注意が必要です',
      title: '夢由来の結びつきが若干多めです',
      body: '夢由来の結びつきが若干多めです。少し観察を続けると自然に安定します。',
    },
    high: {
      label: '確認が必要です',
      title: '夢ノイズが多い状態です',
      body: '夢由来の仮結びつきが増えて、ノイズが多い状態です。整理を検討してください。',
    },
  },
}

export const RISK_OVERALL_COPY = {
  low: {
    title: '落ち着いています',
    body: '現在、結びつきの増え方は安定しています。',
  },
  medium: {
    title: '少し注意が必要です',
    body: '結びつきや先生依存に偏りが出始めています。追加の検証をおすすめします。',
  },
  high: {
    title: '確認が必要です',
    body: '未成熟な結びつきが強くなりすぎている可能性があります。昇格や保存の前に、検証してください。',
  },
} as const

export const getRiskCopy = (id: RiskTypeId): RiskEntry => RISK_COPY[id]
