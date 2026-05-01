import type { EmptyStateEntry } from './uiCopyTypes'
import type { TabId } from './tabCopy'

export const EMPTY_STATE_COPY: Record<TabId, EmptyStateEntry> = {
  overview: {
    title: 'まだ観察記録はありません',
    description: '短い文章を入力して Analyze すると、発火・成長・リスクがここに表示されます。',
    nextAction: 'まず Analyze してみましょう',
  },
  field: {
    title: 'まだ発火データはありません',
    description:
      '文章を入力して Analyze すると、どの点群が反応したかここに表示されます。',
    nextAction: 'Analyze して発火を見る',
  },
  growth: {
    title: 'まだ成長記録はありません',
    description:
      '同じテーマを何度か観察すると、繰り返し発火する点群が assembly として育ち始めます。',
    nextAction: '何度か観察してみましょう',
  },
  teacher: {
    title: 'まだ先生からの結びつきはありません',
    description:
      '画像・言葉・音などを「同じもの」と教えると、最初の橋が作られます。',
    nextAction: '先生との関係を作ってみましょう',
  },
  evaluate: {
    title: 'まだ検証記録はありません',
    description: 'シナリオを設定して実行すると、育ち方の確認ができます。',
    nextAction: 'シナリオを試してみましょう',
  },
  risk: {
    title: 'まだリスクデータはありません',
    description: 'Analyze を繰り返すと、結びつきや先生依存の傾向がここに表示されます。',
    nextAction: 'Analyze を重ねて傾向を見る',
  },
  history: {
    title: 'まだ履歴はありません',
    description:
      'Analyze や段階変化があると、タイムラインに記録されます。',
    nextAction: '最初の記録を作ってみましょう',
  },
  mother: {
    title: 'まだ保存候補はありません',
    description:
      '安定した結びつきや意味の種が育つと、Node Mother に渡す前の候補として表示されます。',
    nextAction: '候補が育つまで観察を続けましょう',
  },
}

export const getEmptyStateCopy = (tabId: TabId): EmptyStateEntry => EMPTY_STATE_COPY[tabId]
