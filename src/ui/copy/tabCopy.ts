import type { TabEntry } from './uiCopyTypes'

export type TabId =
  | 'overview'
  | 'field'
  | 'growth'
  | 'teacher'
  | 'evaluate'
  | 'risk'
  | 'history'
  | 'mother'

export const TAB_COPY: Record<TabId, TabEntry> = {
  overview: {
    title: '概要',
    description: '現在の状態・成長・リスクをまとめて確認します。',
  },
  field: {
    title: '発火',
    description: '入力に反応した点群や結びつきを見ます。',
  },
  growth: {
    title: '成長',
    description: '繰り返し育ってきた点群・結びつき・意味の種を見ます。',
  },
  teacher: {
    title: '先生',
    description: 'Binding Teacher への依存がどれくらい下がっているか見ます。',
  },
  evaluate: {
    title: '検証',
    description: 'シナリオや比較実験で、育ち方を確認します。',
  },
  risk: {
    title: 'リスク',
    description: '結びつきすぎや先生への頼りすぎを確認します。',
  },
  history: {
    title: '履歴',
    description: '保存・段階変化・成長イベントを時系列で見ます。',
  },
  mother: {
    title: 'Mother',
    description: 'Node Mother に渡す前の保存候補を確認します。',
  },
}

export const getTabCopy = (tabId: TabId): TabEntry => TAB_COPY[tabId]
