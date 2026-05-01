export type ResearchBilingualEntry = {
  simpleLabel: string
  researchLabel: string
  internalId?: string
}

export const RESEARCH_METRIC_LABELS: ResearchBilingualEntry[] = [
  { simpleLabel: '成長した点群', researchLabel: 'Assemblies', internalId: 'assemblyCount' },
  { simpleLabel: '結びつき', researchLabel: 'Bridges', internalId: 'bridgeCount' },
  { simpleLabel: '意味の種', researchLabel: 'Proto Seeds', internalId: 'protoSeedCount' },
  { simpleLabel: '想起成功', researchLabel: 'Recall Success', internalId: 'recallSuccessRate' },
  { simpleLabel: '先生への依存', researchLabel: 'Teacher Dependency', internalId: 'averageTeacherDependency' },
  { simpleLabel: '昇格候補', researchLabel: 'Promotion Ready', internalId: 'promotionReadyCount' },
]

export const RESEARCH_RISK_LABELS: ResearchBilingualEntry[] = [
  { simpleLabel: '過結合傾向', researchLabel: 'Overbinding Risk', internalId: 'overbindingRisk' },
  { simpleLabel: '誤結合傾向', researchLabel: 'False Binding Risk', internalId: 'falseBindingRisk' },
  { simpleLabel: '先生過信傾向', researchLabel: 'Teacher Overtrust Risk', internalId: 'teacherOvertrustRisk' },
  { simpleLabel: '夢ノイズ傾向', researchLabel: 'Dream Noise Risk', internalId: 'dreamNoiseRisk' },
]

export const formatResearchLabel = (entry: ResearchBilingualEntry): string =>
  `${entry.simpleLabel} ${entry.researchLabel}`
