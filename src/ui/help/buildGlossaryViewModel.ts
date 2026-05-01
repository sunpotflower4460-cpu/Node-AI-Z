import type { GlossaryEntry } from '../copy/uiCopyTypes'

export type GlossaryViewModel = {
  entries: GlossaryEntry[]
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: '発火',
    definition: '入力に反応して点群が強くなること。',
    researchNote: 'particle activation',
  },
  {
    term: '成長した点群',
    definition: '何度も似た形で発火して、まとまりとして記録されたもの。',
    researchNote: 'assembly',
  },
  {
    term: '結びつき',
    definition: '点群同士のあいだにできた再利用できる橋。',
    researchNote: 'bridge',
  },
  {
    term: '意味の種',
    definition: 'まだ確定した意味ではないが、意味になりそうな安定したまとまり。',
    researchNote: 'proto seed',
  },
  {
    term: '先生',
    definition: '画像と言葉などを「同じもの」と教える補助役。',
    researchNote: 'Binding Teacher',
  },
  {
    term: '先生への依存',
    definition: '先生なしで想起できるかどうかの指標。値が低いほど自立している。',
    researchNote: 'teacher dependency',
  },
  {
    term: '昇格候補',
    definition: '安定した発火パターンが記録され、次の段階への準備が整ったもの。',
    researchNote: 'promotion ready',
  },
  {
    term: '過結合傾向',
    definition: '結びつきが増えすぎて、似ていないものまで同じ扱いになりやすい状態。',
    researchNote: 'overbinding risk',
  },
  {
    term: '保存候補',
    definition: '安定した結びつきや意味の種で、Node Mother に渡す前の確認待ちのもの。',
    researchNote: 'export candidate',
  },
  {
    term: '新しい信号モード',
    definition: '最初から意味を入れず、点群の発火と結びつきから育てるモード。',
    researchNote: 'signal_mode',
  },
]

export const buildGlossaryViewModel = (): GlossaryViewModel => ({
  entries: GLOSSARY_ENTRIES,
})

export const findGlossaryEntry = (term: string): GlossaryEntry | undefined =>
  GLOSSARY_ENTRIES.find((e) => e.term === term)
