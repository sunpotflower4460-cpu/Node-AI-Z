export const UI_LABELS = {
  screenMode: {
    observe: '観察',
    experience: '体験',
  },
  engine: {
    signal_mode: '新しい信号モード',
    crystallized_legacy: '旧・結晶思考',
    llm_mode: 'LLM比較モード',
  },
  tabs: {
    overview: '概要',
    field: '発火',
    growth: '成長',
    teacher: '先生',
    evaluate: '検証',
    risk: 'リスク',
    history: '履歴',
    mother: 'Mother',
  },
  metrics: {
    assemblies: '成長した点群',
    bridges: '結びつき',
    protoSeeds: '意味の種',
    recallSuccess: '想起成功',
    teacherDependency: '先生への依存',
    promotionReady: '昇格候補',
  },
  actions: {
    analyze: 'Analyze',
    learnMore: '詳しく見る',
    skip: 'スキップ',
    next: '次へ',
    prev: '前へ',
    start: '始める',
    sendToMother: 'Node Mother に送る（準備中）',
  },
  export: {
    candidate: '保存候補',
    longTermCandidate: '長期記録候補',
    preMotherCheck: 'Mother に渡す前の確認',
    prePromotionCheck: '昇格前チェック',
    guardianCheck: 'Guardian確認',
  },
} as const

export type UILabels = typeof UI_LABELS

export const getResearchLabel = (
  simpleLabel: string,
  researchLabel: string,
  mode: 'simple' | 'research'
): string => (mode === 'research' ? `${simpleLabel} ${researchLabel}` : simpleLabel)
