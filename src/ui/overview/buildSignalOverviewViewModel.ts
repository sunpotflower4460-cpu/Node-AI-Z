import type { ObservationRecord } from '../../types/experience'
import { MODE_DISPLAY_CONFIG } from '../mode/modeDisplayConfig'
import type { OverviewMode } from '../mode/modeUiTypes'

const STAGE_LABELS: Record<number, string> = {
  1: 'Stage 1 — Ignition',
  2: 'Stage 2 — Assembly',
  3: 'Stage 3 — Teacher Binding',
  4: 'Stage 4 — Self Recall',
  5: 'Stage 5 — Contrast Learning',
  6: 'Stage 6 — Sequence Memory',
  7: 'Stage 7 — Action Loop',
  8: 'Stage 8 — Mother Ready',
}

export type SignalOverviewViewModel = {
  mode: OverviewMode
  modeLabel: string
  modeDescription: string
  currentRuntimeLabel: string
  currentLocation: string
  todaySummary: string
  snapshotLabel: string
  development: {
    currentStage: string
    stageSummary: string
    nextStage?: string
    progress: number
    requirements: Array<{
      label: string
      currentValue: number
      requiredValue: number
      satisfied: boolean
      notes: string[]
    }>
    bottlenecks: string[]
    recommendedNextActions: string[]
  }
  growth: {
    assemblyCount: number
    bridgeCount: number
    protoSeedCount: number
    teacherFreeBridgeCount: number
    recallSuccessRate: number
    averageTeacherDependency: number
    promotionReadyCandidates: number
  }
  risk: {
    level: 'low' | 'medium' | 'high'
    summary: string
    overbindingRisk: number
    teacherOvertrustRisk: number
    falseBindingRisk: number
    dreamNoiseRisk: number
    warnings: string[]
  }
  nextActions: string[]
}

type BuildSignalOverviewViewModelInput = {
  mode: OverviewMode
  observation: ObservationRecord | null
}

const emptySignalViewModel = (mode: OverviewMode): SignalOverviewViewModel => {
  const config = MODE_DISPLAY_CONFIG[mode]
  const currentRuntimeLabel = mode === 'llm_mode' ? 'LLM Mode' : mode === 'crystallized_thinking_legacy' ? 'Crystallized Legacy' : 'New Signal Mode'

  return {
    mode,
    modeLabel: config.label,
    modeDescription: config.description,
    currentRuntimeLabel,
    currentLocation: 'まだ観察結果がありません',
    todaySummary: '現在のモード、発達段階、成長指標、リスク指標が最初に見えるようにする土台です。まずは Analyze して現在地を作ってください。',
    snapshotLabel: 'No snapshot yet',
    development: {
      currentStage: mode === 'signal_mode' ? STAGE_LABELS[1] : mode === 'llm_mode' ? 'Comparison Ready' : 'Legacy Snapshot',
      stageSummary: mode === 'signal_mode'
        ? 'まだ signal observation がないため Stage 1 として待機しています。'
        : mode === 'llm_mode'
          ? 'LLM 比較モードは外部応答の差分確認用です。'
          : '旧系統の観察は比較対象として残されています。',
      nextStage: mode === 'signal_mode' ? STAGE_LABELS[2] : undefined,
      progress: mode === 'signal_mode' ? 0 : 1,
      requirements: [],
      bottlenecks: [],
      recommendedNextActions: mode === 'signal_mode'
        ? ['入力を Analyze して New Signal Mode の growth snapshot を作る']
        : ['比較用モードとして必要なときに切り替えて観察する'],
    },
    growth: {
      assemblyCount: 0,
      bridgeCount: 0,
      protoSeedCount: 0,
      teacherFreeBridgeCount: 0,
      recallSuccessRate: 0,
      averageTeacherDependency: 0,
      promotionReadyCandidates: 0,
    },
    risk: {
      level: 'low',
      summary: 'まだ risk summary はありません。',
      overbindingRisk: 0,
      teacherOvertrustRisk: 0,
      falseBindingRisk: 0,
      dreamNoiseRisk: 0,
      warnings: [],
    },
    nextActions: mode === 'signal_mode'
      ? ['まずは New Signal Mode の観察を 1 回実行して baseline を作る']
      : ['比較対象として必要なタイミングで確認する'],
  }
}

const buildRiskSummaryText = (level: 'low' | 'medium' | 'high', warnings: string[]) => {
  if (warnings.length === 0) {
    return level === 'low'
      ? 'Risk: Low — 現在、bridge の増え方は安定しています。'
      : '大きな warning はまだ出ていません。'
  }

  return `Risk: ${level.charAt(0).toUpperCase()}${level.slice(1)} — ${warnings[0]}`
}

export const buildSignalOverviewViewModel = ({ mode, observation }: BuildSignalOverviewViewModelInput): SignalOverviewViewModel => {
  if (!observation) {
    return emptySignalViewModel(mode)
  }

  if (mode === 'signal_mode' && observation.signalOverviewSource) {
    const source = observation.signalOverviewSource
    const config = MODE_DISPLAY_CONFIG.signal_mode
    const stageNumber = source.developmentStage.stage
    const growth = {
      assemblyCount: source.observeSummary.branch.assemblyCount,
      bridgeCount: source.observeSummary.branch.bridgeCount,
      protoSeedCount: source.observeSummary.branch.protoSeedCount,
      teacherFreeBridgeCount: source.observeSummary.branch.teacherFreeBridgeCount,
      recallSuccessRate: source.observeSummary.branch.averageRecallSuccess,
      averageTeacherDependency: source.observeSummary.branch.averageTeacherDependency,
      promotionReadyCandidates: source.observeSummary.brainLikeGrowth.promotionReadiness.readyCount,
    }
    const developmentSummary = source.developmentDashboard.recommendedNextActions[0]
      ?? source.riskReport.recommendedActions[0]
      ?? 'contrast learning を増やして次段階へ近づけてください。'

    return {
      mode,
      modeLabel: config.label,
      modeDescription: config.description,
      currentRuntimeLabel: 'Crystallized Thinking runtime + Signal overview',
      currentLocation: `${STAGE_LABELS[stageNumber]} / branch ${source.observeSummary.branch.branchId}`,
      todaySummary: `現在は ${STAGE_LABELS[stageNumber]}。assemblies ${growth.assemblyCount} / bridges ${growth.bridgeCount} を観察しています。`,
      snapshotLabel: observation.signalOverviewSource.snapshot ? 'Signal snapshot available' : 'Signal snapshot not stored',
      development: {
        currentStage: STAGE_LABELS[stageNumber],
        stageSummary: developmentSummary,
        nextStage: stageNumber < 8 ? STAGE_LABELS[stageNumber + 1] : undefined,
        progress: source.developmentDashboard.stageProgress,
        requirements: source.developmentDashboard.requirements,
        bottlenecks: source.developmentDashboard.bottlenecks,
        recommendedNextActions: source.developmentDashboard.recommendedNextActions,
      },
      growth,
      risk: {
        level: source.riskReport.riskLevel,
        summary: buildRiskSummaryText(source.riskReport.riskLevel, source.riskReport.warnings),
        overbindingRisk: source.riskReport.overbindingRisk,
        teacherOvertrustRisk: source.riskReport.teacherOvertrustRisk,
        falseBindingRisk: source.riskReport.falseBindingRisk,
        dreamNoiseRisk: source.riskReport.dreamNoiseRisk,
        warnings: source.riskReport.warnings,
      },
      nextActions: Array.from(new Set([
        ...source.riskReport.recommendedActions,
        ...source.developmentDashboard.recommendedNextActions,
      ])).slice(0, 4),
    }
  }

  if (mode === 'crystallized_thinking_legacy') {
    const config = MODE_DISPLAY_CONFIG.crystallized_thinking_legacy
    const legacyBindings = observation.pipelineResult.meta.bindingCount
    const legacyPatterns = observation.pipelineResult.meta.patternCount

    return {
      mode,
      modeLabel: config.label,
      modeDescription: config.description,
      currentRuntimeLabel: observation.implementationMode === 'llm_mode' ? 'LLM runtime snapshot' : 'Legacy node pipeline snapshot',
      currentLocation: `bindings ${legacyBindings} / patterns ${legacyPatterns}`,
      todaySummary: '旧結晶思考の Node / Relation / Pattern の状態を比較対象として確認できます。',
      snapshotLabel: 'Legacy studio snapshot',
      development: {
        currentStage: 'Legacy Observation',
        stageSummary: observation.studioView.flowSummaryText,
        nextStage: undefined,
        progress: 1,
        requirements: [],
        bottlenecks: [],
        recommendedNextActions: ['必要なときだけ Reply / States / History で旧系統を比較する'],
      },
      growth: {
        assemblyCount: observation.pipelineResult.activatedNodes.length,
        bridgeCount: observation.pipelineResult.bindings.length,
        protoSeedCount: observation.pipelineResult.liftedPatterns.length,
        teacherFreeBridgeCount: 0,
        recallSuccessRate: 0,
        averageTeacherDependency: 0,
        promotionReadyCandidates: observation.revisionEntry.proposedChanges.length,
      },
      risk: {
        level: 'low',
        summary: 'Legacy は比較用のため、signal-specific risk は追跡していません。',
        overbindingRisk: 0,
        teacherOvertrustRisk: 0,
        falseBindingRisk: 0,
        dreamNoiseRisk: 0,
        warnings: [],
      },
      nextActions: ['Legacy の internal process と New Signal Mode の overview を見比べる'],
    }
  }

  const config = MODE_DISPLAY_CONFIG.llm_mode
  return {
    mode,
    modeLabel: config.label,
    modeDescription: config.description,
    currentRuntimeLabel: observation.implementationMode === 'llm_mode' ? 'LLM runtime active' : 'LLM comparison lens',
    currentLocation: observation.implementationMode === 'llm_mode' ? '外部 LLM 比較中' : '比較用に待機中',
    todaySummary: observation.implementationMode === 'llm_mode'
      ? '現在は LLM Mode で外部応答の比較を行っています。'
      : 'LLM Mode は外部挙動比較用に残しています。',
    snapshotLabel: observation.implementationMode === 'llm_mode' ? 'LLM response snapshot' : 'No live LLM snapshot',
    development: {
      currentStage: 'Comparison Ready',
      stageSummary: observation.assistantReply,
      nextStage: undefined,
      progress: 1,
      requirements: [],
      bottlenecks: [],
      recommendedNextActions: ['同じ入力で New Signal Mode と LLM Mode の反応差を見る'],
    },
    growth: {
      assemblyCount: observation.pipelineResult.meta.retrievalCount,
      bridgeCount: observation.pipelineResult.meta.bindingCount,
      protoSeedCount: observation.pipelineResult.meta.patternCount,
      teacherFreeBridgeCount: 0,
      recallSuccessRate: 0,
      averageTeacherDependency: 0,
      promotionReadyCandidates: 0,
    },
    risk: {
      level: 'low',
      summary: 'LLM Mode は比較用なので signal risk の定量評価は行いません。',
      overbindingRisk: 0,
      teacherOvertrustRisk: 0,
      falseBindingRisk: 0,
      dreamNoiseRisk: 0,
      warnings: [],
    },
    nextActions: ['外部LLMの返答を New Signal Mode の growth / risk と比較する'],
  }
}
