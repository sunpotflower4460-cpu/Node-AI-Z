import { useState } from 'react'
import { Activity, AlertTriangle, BrainCircuit, ChevronDown, ChevronUp, Clock, Compass, FlaskConical, GitPullRequest, Home, MessageSquareText, RefreshCw, Search, Sparkles, Terminal, TrendingUp, Zap, Brain } from 'lucide-react'
import type { ObservationRecord, ImplementationMode } from '../../types/experience'
import type { AppliedBoostEntry, RevisionState, UserTuningAction } from '../../types/nodeStudio'
import type { HumanReviewDecisionInput } from '../../core'
import { describeProposedChange, formatRevisionDelta, getRevisionStatusMeta } from '../../revision/statusMeta'
import { summarizePromotion } from '../../revision/promotionRules'
import { HistoryTab } from '../tabs/HistoryTab'
import { HomeTab } from '../tabs/HomeTab'
import { PatternsTab } from '../tabs/PatternsTab'
import { RelationsTab } from '../tabs/RelationsTab'
import { ReplyTab } from '../tabs/ReplyTab'
import { StatesTab } from '../tabs/StatesTab'
import { RevisionTab } from '../tabs/RevisionTab'
import { SessionBrainTab } from '../tabs/SessionBrainTab'
import { Badge, HelpIcon } from '../components/CommonUI'
import { SignalOverviewPage } from '../overview/SignalOverviewPage'
import { getDefaultOverviewMode, type OverviewMode, type UiDetailMode } from '../mode/modeUiTypes'
import { HumanReviewPanel } from '../review/HumanReviewPanel'
import { TrunkUndoPanel } from '../review/TrunkUndoPanel'
import { LayeredObservePanel } from '../LayeredObservePanel'
import { SignalFieldView } from '../signalField/SignalFieldView'
import { GrowthView } from '../growth/GrowthView'
import { TeacherDependencyView } from '../teacher/TeacherDependencyView'
import { ScenarioView } from '../evaluate/ScenarioView'
import { RiskView } from '../risk/RiskView'
import { HistoryTimelineView } from '../history/HistoryTimelineView'
import type { LayeredThinkingResult } from '../../runtime/runtimeTypes'
import {
  createEmptySharedTrunk,
  listPendingHumanReviews,
  listResolvedHumanReviews,
  loadSharedTrunkState,
  safeUndoTrunkApply,
  submitHumanReviewDecision,
} from '../../core'

const SAMPLE_INPUTS = [
  '仕事に対する意欲が湧かなくて、転職すべきか悩んでいる',
  '最近ずっと、自分のことを信じきれない',
  'なんとなく引っかかるけど、まだ言葉にできない',
  'ただ分かってほしいだけなのかもしれない',
  '少しだけ希望はある気がする',
]

type ActiveTab = 'Overview' | 'Field' | 'Growth' | 'Teacher' | 'Evaluate' | 'Risk' | 'History' | 'Reply' | 'States' | 'Relations' | 'Patterns' | 'Home' | 'Revision' | 'SessionBrain'
type RawViewMode = 'pipeline' | 'view' | 'home' | 'revision' | 'signal' | 'dual' | 'facade_raw' | 'facade_translated' | 'facade_notes' | 'layered'
const MIN_PLASTICITY_DISPLAY_VALUE = 0.009

const TONE_NOTES: Record<string, (value: number) => string> = {
  over_explaining: (value) => value < 0
    ? '説明を前に出しすぎず、反応を先に置く補正が少し効いています。'
    : '説明を支える補正が少し強まっています。',
  certainty: (value) => value < 0
    ? '断定を少しゆるめ、言い切らない余白を残しやすい状態です。'
    : '言い切る強さがやや前に出やすい状態です。',
  gentleness: () => 'やわらかさを保つ補正が少し厚くなっています。',
}

const HOME_TRIGGER_NOTES: Record<string, string> = {
  overperformance: '過剰整理に戻る検知が、以前より少し早めに入ります。',
  ambiguity_overload: '曖昧さが高いとき、急がず戻る検知が少し早くなっています。',
  fragility: 'fragility が高いとき、近さを優先する return が少し早めに働きます。',
  trust_drop: 'trust_drop を拾って関係を保つ return が少し働きやすくなっています。',
}

const PATTERN_NOTES: Record<string, string> = {
  unarticulated_feeling: 'まだ言葉になる手前の感覚を、以前より少し拾いやすくなっています。',
}

const describeActivePlasticity = (kind: 'tone' | 'home' | 'pattern', key: string, value: number) => {
  if (kind === 'tone') {
    return TONE_NOTES[key]?.(value) || '返答の口調に小さな補正が乗っています。'
  }
  if (kind === 'home') {
    return HOME_TRIGGER_NOTES[key] || 'Home return の入り方が少し調整されています。'
  }
  return PATTERN_NOTES[key] || 'このパターンは以前より少し拾われやすくなっています。'
}

const describeRelationGrowth = (key: string) => {
  const relationParts = key.split('->')
  if (relationParts.length !== 2 || !relationParts[0] || !relationParts[1]) {
    return 'この relation が最近少し太くなっています。'
  }
  const [source, target] = relationParts
  return `${source} と ${target} のあいだの通り道が少し太くなり、揺れや引っぱりを先に拾いやすくなっています。`
}

const getLayeredThinkingResult = (record: ObservationRecord): LayeredThinkingResult | null => {
  if (record.implementationMode !== 'layered_thinking' || !record.layeredThinkingTrace) {
    return null
  }

  return {
    implementationMode: 'layered_thinking',
    input: record.text,
    utterance: record.assistantReply,
    trace: record.layeredThinkingTrace,
  }
}

type AppliedBoostSource = 'auto' | 'keep' | 'soften' | 'lock'

const buildKeySourceMap = (revisionState: RevisionState): Map<string, AppliedBoostSource> => {
  const map = new Map<string, AppliedBoostSource>()
  for (const memEntry of revisionState.memory.entries) {
    for (const change of memEntry.proposedChanges) {
      if (map.has(change.key)) continue
      if (revisionState.tuning.locked.has(change.id)) {
        map.set(change.key, 'lock')
      } else if (revisionState.tuning.kept.has(change.id)) {
        map.set(change.key, 'keep')
      } else if (revisionState.tuning.softened.has(change.id)) {
        map.set(change.key, 'soften')
      }
    }
  }
  return map
}

const directionWord = (delta: number) => (delta > 0 ? '強化' : '緩和')

const describeAppliedEffect = (entry: AppliedBoostEntry): string => {
  const sign = entry.delta > 0 ? '+' : ''
  const val = `${sign}${entry.delta.toFixed(3)}`
  switch (entry.kind) {
    case 'relation': {
      const parts = entry.key.split('->')
      if (parts.length === 2 && parts[0] && parts[1]) {
        return `${parts[0]} → ${parts[1]} に ${val} 適用`
      }
      return `relation ${entry.key} に ${val} 適用`
    }
    case 'pattern':
      return `${entry.key} パターンを ${val} ${directionWord(entry.delta)}`
    case 'home_trigger':
      return `${entry.key} home trigger を ${val} ${directionWord(entry.delta)}`
    case 'tone':
      return `${entry.key} tone bias を ${val} 補正`
    case 'node':
      return `${entry.key} ノード活性を ${val} 補正`
    default:
      return entry.label
  }
}

const SOURCE_LABEL: Record<AppliedBoostSource, { label: string; colorClass: string }> = {
  auto: { label: 'auto', colorClass: 'bg-slate-100 text-slate-600 border-slate-200' },
  keep: { label: 'keep', colorClass: 'bg-green-100 text-green-700 border-green-200' },
  soften: { label: 'soften', colorClass: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  lock: { label: 'lock', colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
}

type ObserveModeProps = {
  currentObservation: ObservationRecord | null
  implementationMode: ImplementationMode
  history: ObservationRecord[]
  revisionState: RevisionState
  surfaceProviderLabel: string
  onAnalyze: (text: string) => void | Promise<void>
  onRestore: (item: ObservationRecord) => void
  onResetCurrent: () => void
  onTuningAction: (entryId: string, changeId: string, action: UserTuningAction) => void
  onClearRevision: () => void
}

export const ObserveMode = ({
  currentObservation,
  implementationMode,
  history,
  revisionState,
  surfaceProviderLabel,
  onAnalyze,
  onRestore,
  onResetCurrent,
  onTuningAction,
  onClearRevision,
}: ObserveModeProps) => {
  const [inputText, setInputText] = useState(currentObservation?.text ?? '')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('Overview')
  const [selectedOverviewMode, setSelectedOverviewMode] = useState<OverviewMode>(() => getDefaultOverviewMode(implementationMode))
  const [detailMode, setDetailMode] = useState<UiDetailMode>('simple')
  const [isRawOpen, setIsRawOpen] = useState(false)
  const [rawViewMode, setRawViewMode] = useState<RawViewMode>('pipeline')
  const [isProcessOpen, setIsProcessOpen] = useState(true)
  const [, forceObserveRefresh] = useState(0)
  const humanReviewPending = listPendingHumanReviews()
  const humanReviewResolved = listResolvedHumanReviews()
  const trunkState = loadSharedTrunkState() ?? currentObservation?.updatedTrunk ?? null
  const promotionCandidates = currentObservation?.promotionCandidates ?? []

  const handleHumanDecision = (input: HumanReviewDecisionInput) => {
    submitHumanReviewDecision(input)
    forceObserveRefresh((value) => value + 1)
  }

  const handleUndoTrunkApply = (input: { applyRecordId: string; reason: string }) => {
    safeUndoTrunkApply({
      currentTrunk: trunkState ?? createEmptySharedTrunk(),
      applyRecordId: input.applyRecordId,
      reason: input.reason,
      revertedBy: 'human_reviewer',
    })
    forceObserveRefresh((value) => value + 1)
  }

  const handleAnalyze = () => {
    const trimmed = inputText.trim()
    if (!trimmed || isAnalyzing) {
      return
    }

    setIsAnalyzing(true)

    window.setTimeout(() => {
      void Promise.resolve(onAnalyze(trimmed)).finally(() => {
        setActiveTab('Overview')
        setIsAnalyzing(false)
      })
    }, 400)
  }

  const handleSampleClick = (text: string) => {
    setInputText(text)
    setIsAnalyzing(true)

    window.setTimeout(() => {
      void Promise.resolve(onAnalyze(text)).finally(() => {
        setActiveTab('Overview')
        setIsAnalyzing(false)
      })
    }, 400)
  }

  const handleRestore = (item: ObservationRecord) => {
    setInputText(item.text)
    onRestore(item)
    setActiveTab('Overview')
    setIsRawOpen(false)
  }

  const handleResetView = () => {
    setInputText('')
    onResetCurrent()
  }

  const pipelineResult = currentObservation?.pipelineResult ?? null
  const studioView = currentObservation?.studioView ?? null
  const currentRevisionEntry = currentObservation?.revisionEntry ?? null
  const dualStreamResult = currentObservation?.dualStreamResult ?? currentObservation?.chunkedResult?.dualStream ?? null
  const translatedFacadeView = currentObservation?.facadeView ?? null
  const rawFacadeView = currentObservation?.rawFacadeView ?? translatedFacadeView
  const facadeTranslation = currentObservation?.facadeViewTranslation ?? null
  const presentationBiasProfile = currentObservation?.presentationBiasProfile ?? facadeTranslation?.biasProfile ?? null
  const relationHighlights = Object.entries(revisionState.plasticity.relationBoosts)
    .filter(([, value]) => value > MIN_PLASTICITY_DISPLAY_VALUE)
    .sort((first, second) => second[1] - first[1])
    .slice(0, 3)
  const activePlasticityHighlights = [
    ...Object.entries(revisionState.plasticity.toneBiases).map(([key, value]) => ({ kind: 'tone' as const, key, value })),
    ...Object.entries(revisionState.plasticity.homeTriggerBoosts).map(([key, value]) => ({ kind: 'home' as const, key, value })),
    ...Object.entries(revisionState.plasticity.patternBoosts).map(([key, value]) => ({ kind: 'pattern' as const, key, value })),
  ]
    .filter(({ value }) => Math.abs(value) > MIN_PLASTICITY_DISPLAY_VALUE)
    .sort((first, second) => Math.abs(second.value) - Math.abs(first.value))
    .slice(0, 4)
  const surfaceHighlights = facadeTranslation?.highlightKeys
    ?? translatedFacadeView?.surfacePresentation?.highlightKeys
    ?? []
  const orderingNotes = facadeTranslation?.orderingNotes
    ?? translatedFacadeView?.surfacePresentation?.notes
    ?? []
  const summaryNotes = facadeTranslation?.summaryNotes
    ?? translatedFacadeView?.surfacePresentation?.notes
    ?? []
  const layeredCurrentResult = currentObservation ? getLayeredThinkingResult(currentObservation) : null
  const layeredHistory = history.filter((item) =>
    item.implementationMode === 'layered_thinking'
    && item.layeredThinkingTrace
    && item.id !== currentObservation?.id
  )

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="rounded-3xl border border-indigo-100 bg-white px-5 py-6 shadow-sm md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Compass className="h-4 w-4" />
              観察研究モード
              <HelpIcon content="AIの内部処理を詳しく観察・研究するモードです。どのように考え、判断し、学習しているかを可視化できます。" />
            </div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              <BrainCircuit className="h-6 w-6 text-indigo-600" />
              Node Studio
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 md:text-[15px]">
              内部プロセスを観察し、反応・構造・修正・帰還を研究するモードです。結晶思考モデルの挙動を見ながら、Node / Relation / Pattern / Home / Revision を比較・検証できます。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 inline-flex items-center gap-1">
                入力して分析
                <HelpIcon content="テキストを入力してAnalyzeボタンを押すと、AIがどのように処理するかを詳しく見ることができます。" />
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 inline-flex items-center gap-1">
                タブで内部を見る
                <HelpIcon content="Reply、States、Relations等のタブで、AIの内部状態や処理の詳細を確認できます。" />
              </span>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                履歴から見返せる
                <HelpIcon content="Historyタブで過去の分析結果を振り返ることができます。" />
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetView}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            表示をリセット
          </button>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="テキストを入力して内部パイプラインを観察する..."
                aria-label="観察対象のテキスト"
                inputMode="text"
                enterKeyHint="search"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base font-medium text-slate-800 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:py-3.5 md:text-[15px]"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAnalyze()
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              aria-label={isAnalyzing ? '分析中' : '分析する'}
              className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 sm:w-auto"
            >
              {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              Analyze
            </button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-medium leading-relaxed text-slate-500 inline-flex items-center gap-1">
            <span>1. テキストを入力 → 2. Analyze → 3. まず Overview で現在地を確認 → 必要に応じて Reply / States / History を見る</span>
            <HelpIcon content="この3ステップで、AIの内部処理を観察できます。Samplesボタンで例文を試すこともできます。" />
          </div>
          <div className="scrollbar-hide -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            <span className="mr-0.5 flex shrink-0 items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400"><Terminal className="h-3.5 w-3.5" /> Samples</span>
            {SAMPLE_INPUTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="shrink-0 rounded-lg border border-slate-200/60 bg-slate-100 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 active:scale-[0.98]"
              >
                {sample.length > 20 ? `${sample.substring(0, 20)}...` : sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!currentObservation ? (
        <SignalOverviewPage
          observation={null}
          selectedMode={selectedOverviewMode}
          detailMode={detailMode}
          implementationMode={implementationMode}
          onModeChange={setSelectedOverviewMode}
          onDetailModeChange={setDetailMode}
        />
      ) : null}

      {currentObservation && pipelineResult && studioView ? (
        <>
          {translatedFacadeView || rawFacadeView ? (
            <section className="rounded-2xl border border-sky-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-700">
                    <Zap className="h-3.5 w-3.5" />
                    Surface Translator
                  </div>
                  <p className="text-sm font-semibold leading-relaxed text-slate-700">
                    同じ Mother Core を、モードごとの presentation bias でどう見せているかのレイヤーです。
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    raw facade view を変えず、見せ方 (emphasis / ordering / summary style) だけを変換しています。
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-sky-700">Presentation Bias Profile</h4>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                    <span className="rounded-md bg-white px-2 py-1 text-sky-700">
                      mode: {presentationBiasProfile?.mode ?? currentObservation.implementationMode}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">
                      ordering: {presentationBiasProfile?.ordering ?? translatedFacadeView?.surfacePresentation?.ordering?.join(' > ') ?? 'branch_first'}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">
                      summary: {presentationBiasProfile?.summaryStyle ?? translatedFacadeView?.surfacePresentation?.summaryStyle ?? 'plain'}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">
                      metadata: {presentationBiasProfile?.metadataDensity ?? translatedFacadeView?.surfacePresentation?.metadataDensity ?? 'balanced'}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-slate-700">
                      depth: {presentationBiasProfile?.explanationDepth ?? translatedFacadeView?.surfacePresentation?.explanationDepth ?? 'minimal'}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">Highlights</h4>
                  {surfaceHighlights.length > 0 ? (
                    <ul className="mt-2 space-y-1.5 text-xs font-semibold text-indigo-800">
                      {surfaceHighlights.slice(0, 6).map((key) => (
                        <li key={key} className="flex items-center gap-2 rounded-lg bg-white px-2 py-1 shadow-sm">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{key}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-slate-500">今回は強調ポイントはありません。</p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Raw vs Translated</h4>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Raw</p>
                      <p>schemas: {rawFacadeView?.visibleSchemas.length ?? 0}</p>
                      <p>mixed: {rawFacadeView?.visibleMixedNodes.length ?? 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Translated</p>
                      <p>schemas: {translatedFacadeView?.visibleSchemas.length ?? 0}</p>
                      <p>mixed: {translatedFacadeView?.visibleMixedNodes.length ?? 0}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                    {(orderingNotes.length > 0 ? orderingNotes : summaryNotes).slice(0, 3).map((note) => (
                      <p key={note} className="leading-snug">・{note}</p>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Revision / Plasticity Snapshot
                </div>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">
                  {currentRevisionEntry?.note || '今回は大きな revision は発生していません。'}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  JSON を開かなくても、今回どこが育ってどこを様子見しているかが分かる要約です。
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">今回動いた boost / bias</h3>
                {currentRevisionEntry?.proposedChanges.length ? (
                  <div className="mt-3 space-y-3">
                    {currentRevisionEntry.proposedChanges.slice(0, 3).map((change) => (
                      <div key={change.id} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Badge colorClass={getRevisionStatusMeta(change.status).badgeClass}>{getRevisionStatusMeta(change.status).label}</Badge>
                          <span className="text-xs font-bold text-slate-700">{formatRevisionDelta(change.delta)}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{describeProposedChange(change)}</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{change.reason}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">今回は proposed change が立たなかったため、補正は据え置きです。</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">最近太くなった経路</h3>
                {relationHighlights.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {relationHighlights.map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{key.replace('->', ' → ')}</p>
                          <span className="text-xs font-bold text-indigo-700">{formatRevisionDelta(value)}</span>
                        </div>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{describeRelationGrowth(key)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">relation の太りはまだ控えめで、いまは tone / home 側の微調整が中心です。</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">いま効いている boost / bias</h3>
                {activePlasticityHighlights.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {activePlasticityHighlights.map(({ kind, key, value }) => (
                      <div key={`${kind}:${key}`} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">{key}</p>
                          <span className="text-xs font-bold text-slate-700">{formatRevisionDelta(value)}</span>
                        </div>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{describeActivePlasticity(kind, key, value)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">まだ塑性の蓄積は薄く、既定のふるまいが中心です。</p>
                )}
              </div>
            </div>
          </section>

          {studioView.appliedPlasticity.length > 0 ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm md:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Applied This Turn</h3>
              </div>
              <p className="mb-3 text-xs font-medium text-emerald-700/70">
                今回の返答に実際に影響した plasticity 補正の一覧です。source は操作の由来を示します。
              </p>
              {(() => {
                const sourceMap = buildKeySourceMap(revisionState)
                return (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {studioView.appliedPlasticity.map((entry) => {
                      const source = sourceMap.get(entry.key) ?? 'auto'
                      const sourceMeta = SOURCE_LABEL[source]
                      return (
                        <div key={`${entry.kind}:${entry.key}`} className="flex flex-col gap-1.5 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                          <div className="flex items-center justify-between gap-2">
                            <Badge colorClass={
                              entry.kind === 'relation' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                              entry.kind === 'pattern' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                              entry.kind === 'home_trigger' ? 'bg-pink-100 text-pink-700 border-pink-200' :
                              entry.kind === 'tone' ? 'bg-teal-100 text-teal-700 border-teal-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }>
                              {entry.kind}
                            </Badge>
                            <Badge colorClass={sourceMeta.colorClass}>{sourceMeta.label}</Badge>
                          </div>
                          <p className="text-xs font-semibold text-slate-800">{describeAppliedEffect(entry)}</p>
                          <span className={`self-end text-xs font-bold ${entry.delta > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                            {entry.delta > 0 ? '+' : ''}{entry.delta.toFixed(3)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </section>
          ) : null}

          {(() => {
            const promotionSummary = summarizePromotion(revisionState)
            if (promotionSummary.totalEntries === 0) return null
            return (
              <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-violet-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-700">Promotion / Growth</h3>
                </div>
                <p className="mb-4 text-xs font-medium text-violet-700/70">
                  change の ephemeral → provisional → promoted 昇格状態と、plasticity として蓄積された経路の太りを確認できます。
                </p>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Revision Growth</h4>
                    <div className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                      <div className="flex justify-between"><span>Total entries</span><span className="font-bold text-slate-800">{promotionSummary.totalEntries}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">ephemeral</span><span>{promotionSummary.ephemeralCount}</span></div>
                      <div className="flex justify-between"><span className="text-yellow-700">provisional</span><span>{promotionSummary.provisionalCount}</span></div>
                      <div className="flex justify-between"><span className="text-green-700">promoted</span><span className="font-bold text-green-800">{promotionSummary.promotedCount}</span></div>
                      <div className="flex justify-between"><span className="text-red-600">reverted</span><span>{promotionSummary.revertedCount}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recently Promoted</h4>
                    {promotionSummary.recentlyPromoted.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {promotionSummary.recentlyPromoted.map((item) => (
                          <div key={`${item.kind}:${item.key}`} className="rounded-lg border border-green-100 bg-green-50 px-2 py-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold text-green-700">{item.kind}</span>
                              <span className="rounded-full bg-green-200 px-1.5 py-0.5 text-[9px] font-bold text-green-800">定着</span>
                            </div>
                            <p className="mt-0.5 text-xs font-semibold text-slate-800">{item.key}</p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-500">{item.reason}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">まだ promoted な change はありません。</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Provisional Queue</h4>
                    <p className="mt-1 text-[10px] text-slate-400">promoted 手前の昇格候補</p>
                    {promotionSummary.provisionalQueue.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {promotionSummary.provisionalQueue.map((item) => (
                          <div key={`${item.kind}:${item.key}`} className="rounded-lg border border-yellow-100 bg-yellow-50 px-2 py-1.5">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-bold text-yellow-700">{item.kind}</span>
                            </div>
                            <p className="mt-0.5 text-xs font-semibold text-slate-800">{item.key}</p>
                            <div className="mt-0.5 flex gap-3 text-[10px] text-slate-500">
                              <span>keep: <span className="font-bold text-slate-700">{item.keepCount}</span></span>
                              <span>出現: <span className="font-bold text-slate-700">{item.occurrences}</span></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">昇格候補はまだありません。</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Thickened Pipes</h4>
                    {(() => {
                      const entries = [
                        ...Object.entries(revisionState.plasticity.relationBoosts).map(([k, v]) => ({ kind: 'relation', key: k, value: v })),
                        ...Object.entries(revisionState.plasticity.nodeBoosts).map(([k, v]) => ({ kind: 'node', key: k, value: v })),
                        ...Object.entries(revisionState.plasticity.homeTriggerBoosts).map(([k, v]) => ({ kind: 'home', key: k, value: v })),
                      ]
                        .filter((e) => Math.abs(e.value) >= MIN_PLASTICITY_DISPLAY_VALUE)
                        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
                        .slice(0, 5)
                      return entries.length > 0 ? (
                        <div className="mt-2 space-y-1.5">
                          {entries.map((e) => (
                            <div key={`${e.kind}:${e.key}`} className="flex items-center justify-between gap-1">
                              <span className="truncate text-xs text-slate-700">{e.key.replace('->', ' → ')}</span>
                              <span className={`shrink-0 text-xs font-bold ${e.value > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{formatRevisionDelta(e.value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">まだ経路の太りはありません。</p>
                      )
                    })()}
                  </div>
                </div>
              </section>
            )
          })()}

          <div className="flex min-w-0 flex-col gap-6">
            {dualStreamResult ? (
              <section className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Dual Stream Architecture v1</h3>
                  <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold text-violet-600">
                    fused: {dualStreamResult.fusedState.fusedConfidence.toFixed(2)}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lexical Stream</h4>
                    <div className="mt-2 space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex justify-between gap-2"><span>requestType</span><span className="font-bold text-slate-800">{dualStreamResult.lexicalState.requestType ?? 'none'}</span></div>
                      <div className="flex justify-between gap-2"><span>explicitQuestion</span><span className="font-bold text-slate-800">{dualStreamResult.lexicalState.explicitQuestion ? 'true' : 'false'}</span></div>
                      <div><span className="font-bold text-slate-700">optionLabels: </span>{dualStreamResult.lexicalState.optionLabels?.join(', ') ?? 'none'}</div>
                      <div><span className="font-bold text-slate-700">entities: </span>{dualStreamResult.lexicalState.explicitEntities?.join(', ') ?? 'none'}</div>
                      <div><span className="font-bold text-slate-700">tensions: </span>{dualStreamResult.lexicalState.explicitTensions?.join(', ') ?? 'none'}</div>
                      <div><span className="font-bold text-slate-700">syntax: </span>{dualStreamResult.lexicalState.syntaxHints?.join(', ') ?? 'none'}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signal Packets</h4>
                    <div className="mt-2 space-y-2">
                      {dualStreamResult.signalPackets.map((packet) => (
                        <div key={packet.id} className="rounded-lg border border-violet-50 bg-violet-50/30 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-800">{packet.id}</span>
                            <span className="text-[10px] font-bold text-violet-700">{packet.chunkText}</span>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                            <div className="flex justify-between"><span>salience</span><span className="font-bold text-slate-800">{packet.salience.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>charge</span><span className="font-bold text-slate-800">{packet.emotionalCharge.toFixed(2)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Micro Cues (raw)</h4>
                    <div className="mt-2 space-y-2">
                      {dualStreamResult.microCues.length > 0 ? dualStreamResult.microCues.map((cue) => (
                        <div key={cue.id} className="rounded-lg border border-violet-50 bg-violet-50/30 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-800">{cue.id}</span>
                            <span className="text-[10px] font-bold text-violet-700">{(cue.rawStrength ?? cue.strength).toFixed(2)}</span>
                          </div>
                          <p className="mt-1 text-[9px] text-slate-500">{cue.reasons.join(' / ')}</p>
                        </div>
                      )) : <p className="text-xs text-slate-400">micro cue なし</p>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Temporal / Refractory</h4>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-600">
                      {dualStreamResult.observe.temporalDecay.map((note) => <p key={note} className="leading-snug">{note}</p>)}
                      <div className="mt-2 h-px bg-violet-100" />
                      {dualStreamResult.observe.refractory.map((note) => <p key={note} className="leading-snug">{note}</p>)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Inhibition & Threshold</h4>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-600">
                      {dualStreamResult.observe.inhibition.map((note) => <p key={note} className="leading-snug">{note}</p>)}
                      <p className="mt-2 font-semibold text-slate-800">{dualStreamResult.observe.threshold}</p>
                      <p className="text-[10px] text-slate-500">
                        loop: {dualStreamResult.recurrentResult.iterations} step(s), converged {dualStreamResult.recurrentResult.converged ? 'yes' : 'no'}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Prediction Error</h4>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-600">
                      <p className="font-semibold text-slate-800">surprise: {dualStreamResult.prediction.modulation.overallSurprise.toFixed(3)}</p>
                      <p>surprise cues: {dualStreamResult.prediction.modulation.surpriseCues.join(', ') || 'none'}</p>
                      <p>missing cues: {dualStreamResult.prediction.modulation.missingCues.join(', ') || 'none'}</p>
                      {dualStreamResult.observe.prediction.map((note) => <p key={note} className="leading-snug">{note}</p>)}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active Cues</h4>
                    <div className="mt-2 space-y-2">
                      {dualStreamResult.activeCues.length > 0 ? dualStreamResult.activeCues.map((cue) => (
                        <div key={cue.id} className="rounded-lg border border-violet-50 bg-violet-50/30 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-slate-800">{cue.id}</span>
                            <span className="text-[10px] font-bold text-violet-700">{cue.strength.toFixed(2)}</span>
                          </div>
                          <p className="mt-1 text-[9px] text-slate-500">last fired: {cue.lastFiredTurn ?? 0} / refractory: {cue.refractoryUntilTurn ?? 0}</p>
                        </div>
                      )) : <p className="text-xs text-slate-400">active cue なし</p>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Micro Signal Dimensions</h4>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-600">
                      {Object.entries(dualStreamResult.microSignalState.dimensions).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span>{key}</span>
                          <span className="font-bold text-slate-800">{value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Field Tone</h4>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">{dualStreamResult.microSignalState.fieldTone}</span>
                      <span className="text-[10px] text-slate-500">{dualStreamResult.fusedState.dominantTextures.join(' / ') || 'texture なし'}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sensory Proto Meanings</h4>
                    <div className="mt-2 space-y-1">
                      {dualStreamResult.sensoryProtoMeanings.length > 0 ? dualStreamResult.sensoryProtoMeanings.map((meaning) => (
                        <div key={meaning.id} className="flex items-center justify-between gap-2 text-[10px] text-slate-700">
                          <span className="font-bold text-slate-800">{meaning.glossJa}</span>
                          <span className="text-violet-700">{meaning.strength.toFixed(2)}</span>
                        </div>
                      )) : <p className="text-xs text-slate-400">sensory なし</p>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Narrative Proto Meanings</h4>
                    <div className="mt-2 space-y-1">
                      {dualStreamResult.narrativeProtoMeanings.length > 0 ? dualStreamResult.narrativeProtoMeanings.map((meaning) => (
                        <div key={meaning.id} className="space-y-0.5 text-[10px] text-slate-700">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-800">{meaning.glossJa}</span>
                            <span className="text-violet-700">{meaning.strength.toFixed(2)}</span>
                          </div>
                          <p className="text-[9px] text-slate-500">childIds: {meaning.childIds?.join(', ') ?? 'none'}</p>
                        </div>
                      )) : <p className="text-xs text-slate-400">narrative なし</p>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hierarchy View</h4>
                    <div className="mt-2 space-y-1 text-[10px] text-slate-700">
                      {dualStreamResult.observe.hierarchy.map((note) => (
                        <p key={note} className="leading-snug">{note}</p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-violet-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Fused State</h4>
                    <div className="mt-2 space-y-2 text-[10px] text-slate-600">
                      <div>
                        <div className="font-bold text-slate-700">integratedTensions</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(dualStreamResult.fusedState.integratedTensions.length > 0 ? dualStreamResult.fusedState.integratedTensions : ['none']).map((tension) => (
                            <span key={tension} className="rounded-full bg-violet-100 px-2 py-0.5 font-bold text-violet-700">{tension}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">dominantTextures</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {dualStreamResult.fusedState.dominantTextures.map((texture) => (
                            <span key={texture} className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700">{texture}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span>fusedConfidence</span>
                        <span className="font-bold text-slate-800">{dualStreamResult.fusedState.fusedConfidence.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
            {currentObservation.chunkedResult ? (
              <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-amber-700">ISR v2.1 — Chunk → Feature → Node</h3>
                  <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-600">
                    threshold: {currentObservation.chunkedResult.chunkedStage.threshold.current.toFixed(2)}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Meaning Chunks ({currentObservation.chunkedResult.chunkedStage.chunks.length})</h4>
                    <div className="mt-2 space-y-1">
                      {currentObservation.chunkedResult.chunkedStage.chunks.map((chunk) => (
                        <div key={chunk.index} className="flex items-start gap-1.5">
                          <span className="mt-0.5 shrink-0 rounded bg-amber-100 px-1 py-0.5 text-[9px] font-bold text-amber-700">{chunk.index}</span>
                          <span className="text-xs text-slate-700">{chunk.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Feature Activations</h4>
                    <div className="mt-2 space-y-1.5">
                      {currentObservation.chunkedResult.chunkedStage.inhibitedFeatures.length > 0 ? (
                        currentObservation.chunkedResult.chunkedStage.inhibitedFeatures.map((feature) => {
                          const isActive = currentObservation.chunkedResult?.chunkedStage.activeFeatures.some((f) => f.id === feature.id) ?? false
                          return (
                            <div key={feature.id} className="flex items-center justify-between gap-2">
                              <span className={`truncate text-xs ${isActive ? 'font-semibold text-slate-800' : 'text-slate-400 line-through'}`}>
                                {feature.id}
                              </span>
                              <div className="flex shrink-0 items-center gap-1">
                                {feature.strength < feature.rawStrength ? (
                                  <span className="text-[9px] text-slate-400">{feature.rawStrength.toFixed(2)}→</span>
                                ) : null}
                                <span className={`text-[10px] font-bold ${isActive ? 'text-amber-700' : 'text-slate-400'}`}>
                                  {feature.strength.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-xs text-slate-400">feature 発火なし</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nodes with ActivationProfile</h4>
                    <div className="mt-2 space-y-2">
                      {currentObservation.chunkedResult.activatedNodes.filter((n) => n.activationProfile).map((node) => (
                        <div key={node.id} className="rounded-lg border border-amber-50 bg-amber-50/40 p-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-slate-800">{node.id}</span>
                            <span className="text-[10px] font-bold text-amber-700">{node.value.toFixed(2)}</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {Object.entries(node.activationProfile ?? {}).map(([featureId, contrib]) => (
                              <div key={featureId} className="flex items-center justify-between gap-1">
                                <span className="text-[9px] text-slate-500">{featureId}</span>
                                <span className="text-[9px] font-bold text-slate-600">{(contrib as number).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {currentObservation.chunkedResult.activatedNodes.filter((n) => n.activationProfile).length === 0 ? (
                        <p className="text-xs text-slate-400">activationProfile なし（fallback モード）</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sensory Proto Meanings</h4>
                    <div className="mt-2 space-y-2">
                      {currentObservation.chunkedResult.sensoryProtoMeanings.length > 0 ? (
                        currentObservation.chunkedResult.sensoryProtoMeanings.map((meaning) => (
                          <div key={meaning.id} className="rounded-lg border border-amber-50 bg-amber-50/40 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800">{meaning.glossJa}</span>
                              <span className="text-[10px] font-bold text-amber-700">{meaning.strength.toFixed(2)}</span>
                            </div>
                            <p className="mt-1 text-[9px] text-slate-500">{meaning.sourceCueIds.join(', ') || 'cue なし'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">sensory proto meaning なし</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Narrative Proto Meanings</h4>
                    <div className="mt-2 space-y-2">
                      {currentObservation.chunkedResult.narrativeProtoMeanings.length > 0 ? (
                        currentObservation.chunkedResult.narrativeProtoMeanings.map((meaning) => (
                          <div key={meaning.id} className="rounded-lg border border-amber-50 bg-amber-50/40 p-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-slate-800">{meaning.glossJa}</span>
                              <span className="text-[10px] font-bold text-amber-700">{meaning.strength.toFixed(2)}</span>
                            </div>
                            <p className="mt-1 text-[9px] text-slate-500">childIds: {(meaning.childIds ?? []).join(', ') || 'なし'}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">narrative proto meaning なし</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Hierarchy View</h4>
                    <div className="mt-2 space-y-2">
                      {currentObservation.chunkedResult.protoMeaningHierarchy.narrative.length > 0 ? (
                        currentObservation.chunkedResult.protoMeaningHierarchy.narrative.map((meaning) => (
                          <div key={meaning.id} className="rounded-lg border border-amber-50 bg-amber-50/40 p-2">
                            <p className="text-[10px] font-bold text-slate-800">{meaning.glossJa}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(meaning.childIds ?? []).map((childId) => {
                                const sensoryChild = currentObservation.chunkedResult?.protoMeaningHierarchy.sensory.find((sensoryMeaning) => sensoryMeaning.id === childId)
                                return (
                                  <span key={childId} className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700">
                                    {sensoryChild?.glossJa ?? childId}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">hierarchy なし</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Option Fields</h4>
                    <div className="mt-2 space-y-2">
                      {currentObservation.chunkedResult.detectedOptions.length > 0 && currentObservation.chunkedResult.optionCompetition ? (
                        currentObservation.chunkedResult.optionCompetition.optionFields.map((field) => {
                          const option = currentObservation.chunkedResult?.detectedOptions.find((candidate) => candidate.id === field.optionId)
                          return (
                            <div key={field.optionId} className="rounded-lg border border-indigo-50 bg-indigo-50/30 p-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-800">{option?.label ?? field.optionId}</span>
                                <span className="text-[10px] font-bold text-indigo-700">{field.netPull.toFixed(2)}</span>
                              </div>
                              <div className="mt-1 grid grid-cols-2 gap-1 text-[9px] text-slate-500">
                                <div className="flex justify-between"><span>support</span><span className="font-bold text-slate-700">{field.totalSupport.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>resistance</span><span className="font-bold text-slate-700">{field.totalResistance.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>reason</span><span>{field.reasonWeight.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>sensory</span><span>{field.sensoryWeight.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>identity</span><span>{field.identityFitWeight.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span>risk</span><span>{field.riskWeight.toFixed(2)}</span></div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <p className="text-xs text-slate-400">option field なし</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Explicit Option Awareness</h4>
                    {currentObservation.chunkedResult.optionAwareness ? (
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-indigo-50 bg-indigo-50/30 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">{currentObservation.chunkedResult.optionAwareness.summaryLabel}</span>
                            <span className="text-[10px] font-bold text-indigo-700">{currentObservation.chunkedResult.optionAwareness.confidence.toFixed(2)}</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {Object.entries(currentObservation.chunkedResult.optionAwareness.optionRatios).map(([optionId, ratio]) => {
                              const option = currentObservation.chunkedResult?.detectedOptions.find((candidate) => candidate.id === optionId)
                              return (
                                <div key={optionId} className="flex items-center justify-between gap-2 text-[10px] text-slate-600">
                                  <span>{option?.label ?? optionId}</span>
                                  <span className="font-bold text-slate-800">{ratio}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                          <div className="rounded-lg bg-slate-50 p-2">
                            <div className="text-slate-400">difference</div>
                            <div className="font-bold text-slate-800">{currentObservation.chunkedResult.optionAwareness.differenceMagnitude.toFixed(2)}</div>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-2">
                            <div className="text-slate-400">hesitation</div>
                            <div className="font-bold text-slate-800">{currentObservation.chunkedResult.optionAwareness.hesitationStrength.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">option awareness なし</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-indigo-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Decision / Utterance Shaping</h4>
                    {currentObservation.chunkedResult.optionDecision ? (
                      <div className="mt-2 space-y-2">
                        <div className="rounded-lg border border-indigo-50 bg-indigo-50/30 p-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">{currentObservation.chunkedResult.optionDecision.stance}</span>
                            <span className="text-[10px] font-bold text-indigo-700">{currentObservation.chunkedResult.optionDecision.confidence.toFixed(2)}</span>
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {currentObservation.chunkedResult.optionDecision.notes.map((note, index) => (
                              <p key={index} className="text-[9px] text-slate-500">{note}</p>
                            ))}
                          </div>
                        </div>
                        {currentObservation.chunkedResult.optionUtteranceHints ? (
                          <div className="rounded-lg border border-indigo-50 bg-white p-2">
                            <div className="text-[10px] font-bold text-slate-700">{currentObservation.chunkedResult.optionUtteranceHints.ratioText ?? 'ratio なし'}</div>
                            <p className="mt-1 text-[10px] text-slate-500">{currentObservation.chunkedResult.optionUtteranceHints.suggestedClose}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400">decision shaping なし</p>
                    )}
                  </div>
                </div>
              </section>
            ) : null}
            {currentObservation.somaticSignature ? (
              <section className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-4 text-teal-600 font-bold text-xs">S</span>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-teal-700">ISR v2.5 — Somatic Marker Decision Layer</h3>
                  <span className="ml-auto rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-bold text-teal-600">
                    strength: {(currentObservation.somaticInfluence?.influenceStrength ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-teal-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Somatic Signature</h4>
                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                      <div>
                        <span className="font-bold text-slate-700">Sensory IDs: </span>
                        <span>{currentObservation.somaticSignature.sensoryIds.join(', ') || 'none'}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-700">Narrative IDs: </span>
                        <span>{currentObservation.somaticSignature.narrativeIds.join(', ') || 'none'}</span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {Object.entries(currentObservation.somaticSignature.fieldShape).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between gap-1">
                            <span className="text-[9px] text-slate-500">{key.replace('Band', '')}</span>
                            <span className={`text-[9px] font-bold rounded px-1 ${value === 'high' ? 'bg-teal-100 text-teal-700' : value === 'mid' ? 'bg-slate-100 text-slate-600' : 'bg-slate-50 text-slate-400'}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-teal-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Relevant Markers ({currentObservation.relevantSomaticMarkers?.length ?? 0})</h4>
                    <div className="mt-2 space-y-1.5">
                      {(currentObservation.relevantSomaticMarkers ?? []).length > 0 ? (
                        (currentObservation.relevantSomaticMarkers ?? []).map((marker) => (
                          <div key={marker.id} className="rounded-lg border border-teal-50 bg-teal-50/40 p-2">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[9px] font-bold text-teal-700">{marker.decisionShape.stance}</span>
                              <span className="text-[9px] text-slate-500">×{marker.count}</span>
                            </div>
                            <p className="mt-0.5 text-[9px] text-slate-500 truncate">{marker.id}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400">関連するマーカーなし</p>
                      )}
                    </div>
                  </div>

                  {currentObservation.somaticInfluence ? (
                    <div className="rounded-xl border border-teal-100 bg-white p-3 shadow-sm">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Somatic Influence</h4>
                      <div className="mt-2 space-y-1 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>influenceStrength</span>
                          <span className="font-bold text-teal-700">{currentObservation.somaticInfluence.influenceStrength.toFixed(2)}</span>
                        </div>
                        {Object.entries(currentObservation.somaticInfluence.averageOutcome).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}</span>
                            <span className={`font-bold ${(value as number) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{(value as number).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      {currentObservation.somaticInfluence.debugNotes.length > 0 ? (
                        <div className="mt-2 border-t border-teal-50 pt-2 space-y-0.5">
                          {currentObservation.somaticInfluence.debugNotes.map((note, i) => (
                            <p key={i} className="text-[9px] text-slate-400 truncate">{note}</p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
            {currentObservation.signalResult ? (
              <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-600" />
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Signal Runtime Observation</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stimulus</h4>
                    <div className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                      <div className="flex justify-between"><span>intensity</span><span className="font-bold text-slate-800">{currentObservation.signalResult.stimulus.intensity.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>valence</span><span className="font-bold text-slate-800">{currentObservation.signalResult.stimulus.valence.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>tokens</span><span className="font-bold text-slate-800">{currentObservation.signalResult.stimulus.tokens.length}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Signals ({currentObservation.signalResult.signals.length})</h4>
                    <div className="mt-2 space-y-1">
                      {currentObservation.signalResult.signals.slice(0, 4).map((s) => (
                        <div key={s.id} className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-slate-700">{s.label}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700">{s.layer}</span>
                            <span className="text-[10px] font-bold text-slate-800">{s.strength.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Boundary</h4>
                    <div className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                      <div className="flex justify-between"><span>tension</span><span className={`font-bold ${currentObservation.signalResult.boundaryLoopState.boundaryTension > 0.6 ? 'text-rose-700' : 'text-slate-800'}`}>{currentObservation.signalResult.boundaryLoopState.boundaryTension.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>internal</span><span className="font-bold text-slate-800">{currentObservation.signalResult.boundaryLoopState.internalSignals.length}</span></div>
                      <div className="flex justify-between"><span>external</span><span className="font-bold text-slate-800">{currentObservation.signalResult.boundaryLoopState.externalSignals.length}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Field</h4>
                    <div className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                      <div className="flex justify-between"><span>intensity</span><span className="font-bold text-slate-800">{currentObservation.signalResult.signalField.fieldIntensity.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>co-firing groups</span><span className="font-bold text-slate-800">{currentObservation.signalResult.signalField.coFiringGroups.length}</span></div>
                      <div className="flex justify-between"><span>resonance</span><span className="font-bold text-slate-800">{currentObservation.signalResult.selfLoopState.resonanceScore.toFixed(2)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Proto-Meanings</h4>
                    <div className="mt-2 space-y-1">
                      {currentObservation.signalResult.protoMeanings.map((pm) => (
                        <div key={pm.id} className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs text-slate-700">{pm.texture}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-800">w:{pm.weight.toFixed(2)}</span>
                            <span className={`text-[10px] font-bold ${pm.valence >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>v:{pm.valence.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Decision</h4>
                    <div className="mt-2 space-y-1 text-xs font-medium text-slate-600">
                      <div className="flex justify-between"><span>mode</span><span className="font-bold text-rose-700">{currentObservation.signalResult.decision.utteranceMode}</span></div>
                      <div className="flex justify-between"><span>shouldSpeak</span><span className="font-bold text-slate-800">{currentObservation.signalResult.decision.shouldSpeak ? 'true' : 'false'}</span></div>
                      <div className="flex justify-between"><span>intent</span><span className="font-bold text-slate-800">{currentObservation.signalResult.decision.replyIntent ?? 'n/a'}</span></div>
                    </div>
                    <div className="mt-2 border-t border-slate-100 pt-2">
                      <h5 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sentence Plan Tone</h5>
                      <p className="mt-1 text-xs font-bold text-slate-700">{currentObservation.signalResult.sentencePlan.tone}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-rose-100 bg-white p-3 shadow-sm">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Lexicalization</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <h5 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">narrative core</h5>
                        <div className="mt-1 space-y-1">
                          {currentObservation.signalResult.wordCandidates.filter((candidate) => candidate.role === 'core').slice(0, 3).map((candidate) => (
                            <div key={candidate.protoMeaningId} className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs text-slate-700">{candidate.glossJa ?? candidate.protoMeaningId}</span>
                              <span className="text-[9px] text-rose-700">{candidate.words[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-slate-100 pt-2">
                        <h5 className="text-[9px] font-bold uppercase tracking-wider text-slate-400">sensory tone</h5>
                        <div className="mt-1 space-y-1">
                          {currentObservation.signalResult.wordCandidates.filter((candidate) => candidate.role === 'tone').slice(0, 3).map((candidate) => (
                            <div key={candidate.protoMeaningId} className="flex items-center justify-between gap-2">
                              <span className="truncate text-xs text-slate-700">{candidate.glossJa ?? candidate.protoMeaningId}</span>
                              <span className="text-[9px] text-rose-700">{candidate.words[0]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
            {layeredCurrentResult ? (
              <section className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm md:p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                      Layered Observe
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      layered_thinking の層ごとの観測結果を、このターンと履歴でそのまま確認できます。
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <LayeredObservePanel result={layeredCurrentResult} />
                  {layeredHistory.length > 0 ? (
                    <div className="space-y-3">
                      <div className="pt-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
                        複数ターン履歴
                      </div>
                      {layeredHistory.map((item) => {
                        const result = getLayeredThinkingResult(item)
                        if (!result) {
                          return null
                        }

                        return <LayeredObservePanel key={item.id} result={result} />
                      })}
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}
            <div className="scrollbar-hide sticky top-2 z-10 -mx-1 flex gap-1 overflow-x-auto bg-[#F8FAFC] px-1 pb-2 pt-1 md:top-[84px]" role="tablist" aria-label="観察ビュー">
              {(['Overview', 'Field', 'Growth', 'Teacher', 'Evaluate', 'Risk', 'History', 'Reply', 'SessionBrain', 'States', 'Relations', 'Patterns', 'Home', 'Revision'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tap-target flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition-all duration-150 ${
                    activeTab === tab
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'
                  }`}
                >
                  {tab === 'Overview' ? <Compass className="h-4 w-4" /> : null}
                  {tab === 'Field' ? <Zap className="h-4 w-4" /> : null}
                  {tab === 'Growth' ? <TrendingUp className="h-4 w-4" /> : null}
                  {tab === 'Teacher' ? <Brain className="h-4 w-4" /> : null}
                  {tab === 'Evaluate' ? <FlaskConical className="h-4 w-4" /> : null}
                  {tab === 'Risk' ? <AlertTriangle className="h-4 w-4" /> : null}
                  {tab === 'History' ? <Clock className="h-4 w-4" /> : null}
                  {tab === 'Reply' ? <MessageSquareText className="h-4 w-4" /> : null}
                  {tab === 'SessionBrain' ? <BrainCircuit className="h-4 w-4" /> : null}
                  {tab === 'Home' ? <Home className="h-4 w-4" /> : null}
                  {tab === 'Relations' ? <GitPullRequest className="h-4 w-4" /> : null}
                  {tab === 'Revision' ? <RefreshCw className="h-4 w-4" /> : null}
                  {tab}
                  {activeTab === tab ? <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> : null}
                </button>
              ))}
            </div>

            <div className="flex flex-col">
              {activeTab === 'Overview' ? <SignalOverviewPage observation={currentObservation} selectedMode={selectedOverviewMode} detailMode={detailMode} implementationMode={implementationMode} onModeChange={setSelectedOverviewMode} onDetailModeChange={setDetailMode} /> : null}
              {activeTab === 'Field' ? <SignalFieldView source={currentObservation.signalOverviewSource ?? null} detailMode={detailMode} /> : null}
              {activeTab === 'Growth' ? <GrowthView source={currentObservation.signalOverviewSource ?? null} detailMode={detailMode} /> : null}
              {activeTab === 'Teacher' ? <TeacherDependencyView source={currentObservation.signalOverviewSource ?? null} detailMode={detailMode} /> : null}
              {activeTab === 'Evaluate' ? <ScenarioView detailMode={detailMode} /> : null}
              {activeTab === 'Risk' ? <RiskView source={currentObservation.signalOverviewSource ?? null} detailMode={detailMode} /> : null}
              {activeTab === 'History' ? (
                <div className="flex flex-col gap-6">
                  <HistoryTimelineView input={{ snapshots: currentObservation.signalOverviewSource?.snapshot ? [currentObservation.signalOverviewSource.snapshot] : [] }} detailMode={detailMode} />
                  {history.length > 0 ? (
                    <div>
                      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Observation History</p>
                      <HistoryTab history={history} restoreHistory={handleRestore} />
                    </div>
                  ) : null}
                </div>
              ) : null}
              {activeTab === 'Reply' ? <ReplyTab studioView={studioView} surfaceReply={currentObservation.assistantReply} surfaceProviderLabel={surfaceProviderLabel} analyzedText={currentObservation.text} isProcessOpen={isProcessOpen} setIsProcessOpen={setIsProcessOpen} currentRevisionEntry={currentRevisionEntry} tuning={revisionState.tuning} onTuningAction={onTuningAction} /> : null}
              {activeTab === 'SessionBrain' ? <SessionBrainTab observation={currentObservation} /> : null}
              {activeTab === 'Home' ? <HomeTab studioView={studioView} /> : null}
              {activeTab === 'States' ? <StatesTab pipelineResult={pipelineResult} /> : null}
              {activeTab === 'Relations' ? <RelationsTab pipelineResult={pipelineResult} /> : null}
              {activeTab === 'Patterns' ? <PatternsTab studioView={studioView} /> : null}
              {activeTab === 'Revision' ? <RevisionTab revisionState={revisionState} currentEntry={currentRevisionEntry} onTuningAction={onTuningAction} onClearAll={onClearRevision} /> : null}
            </div>
          </div>

          <div className="mt-6">
            {promotionCandidates.length > 0 ? (
              <section className="rounded-3xl border border-indigo-200 bg-white shadow-sm">
                <div className="border-b border-indigo-100 px-4 py-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-indigo-700">
                    Cross-Branch Consistency
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-600">
                    Promotion candidates are checked against comparable branch summaries before shared trunk apply.
                  </p>
                </div>
                <div className="grid gap-3 p-4 lg:grid-cols-2">
                  {promotionCandidates.map((candidate) => (
                    <div key={candidate.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{candidate.type}</div>
                          <div className="text-[11px] text-slate-500">{candidate.id}</div>
                        </div>
                        <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold text-indigo-700">
                          score {candidate.crossBranchSupport?.consistencyScore.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <div className="rounded-lg bg-white px-2 py-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800">Comparable Branch Count</span>: {candidate.crossBranchSupport?.comparedBranchCount ?? 0}
                        </div>
                        <div className="rounded-lg bg-white px-2 py-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800">Cross-Branch Support</span>: {candidate.crossBranchSupport?.supportCount ?? 0}
                        </div>
                        <div className="rounded-lg bg-white px-2 py-1 text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-800">Cross-Branch Matches</span>: {candidate.crossBranchSupport?.matches?.length ?? 0}
                        </div>
                      </div>
                      {candidate.crossBranchSupport?.matches?.length ? (
                        <ul className="mt-3 space-y-1 text-xs text-slate-600">
                          {candidate.crossBranchSupport.matches.map((match) => (
                            <li key={`${candidate.id}-${match.branchId}`} className="rounded-lg bg-white px-3 py-2">
                              {match.branchId} · {(match.similarityScore * 100).toFixed(0)}% · {match.matchedKeys.join(', ') || 'abstract match'}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {candidate.crossBranchSupport?.notes?.length ? (
                        <ul className="mt-3 space-y-1 text-xs text-indigo-800">
                          {candidate.crossBranchSupport.notes.map((note) => (
                            <li key={note} className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                              {note}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="mt-6">
            <HumanReviewPanel
              pending={humanReviewPending}
              resolved={humanReviewResolved}
              onDecision={handleHumanDecision}
            />
          </div>

          <div className="mt-6">
            <TrunkUndoPanel
              applyRecords={trunkState?.trunkApplyRecords ?? []}
              revertRecords={trunkState?.trunkRevertRecords ?? []}
              currentSafetySnapshotId={trunkState?.currentRevertSafetySnapshotId}
              consistencyResult={trunkState?.lastTrunkConsistencyCheck}
              onUndo={handleUndoTrunkApply}
            />
          </div>

          <div className="mb-8 mt-8 flex shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="flex w-full flex-col items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 p-3 sm:flex-row">
              <div className="flex flex-col gap-1 pl-2">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Internal Data Inspect</span>
                </div>
                <div className="mt-1 flex gap-3 text-[10px] text-slate-500">
                  <span>source: {currentObservation.type}</span>
                  <span>retrieved: {pipelineResult.meta.retrievalCount}</span>
                  <span>bindings: {pipelineResult.meta.bindingCount}</span>
                  <span>patterns: {pipelineResult.meta.patternCount}</span>
                  <span>elapsed: {pipelineResult.meta.elapsedMs.toFixed(2)}ms</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setRawViewMode('pipeline'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'pipeline' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Pipeline Raw</button>
                <button type="button" onClick={() => { setRawViewMode('view'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'view' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Studio View</button>
                <button type="button" onClick={() => { setRawViewMode('home'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'home' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Home View</button>
                <button type="button" onClick={() => { setRawViewMode('revision'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'revision' && isRawOpen ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Revision</button>
                {rawFacadeView ? (
                  <button type="button" onClick={() => { setRawViewMode('facade_raw'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'facade_raw' && isRawOpen ? 'bg-sky-800 text-white' : 'text-sky-500 hover:bg-slate-800'}`}>Facade Raw</button>
                ) : null}
                {translatedFacadeView ? (
                  <button type="button" onClick={() => { setRawViewMode('facade_translated'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'facade_translated' && isRawOpen ? 'bg-sky-800 text-white' : 'text-sky-500 hover:bg-slate-800'}`}>Facade Translated</button>
                ) : null}
                {facadeTranslation || presentationBiasProfile ? (
                  <button type="button" onClick={() => { setRawViewMode('facade_notes'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'facade_notes' && isRawOpen ? 'bg-sky-900 text-white' : 'text-slate-500 hover:bg-slate-800'}`}>Surface Notes</button>
                ) : null}
                {currentObservation.signalResult ? (
                  <button type="button" onClick={() => { setRawViewMode('signal'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'signal' && isRawOpen ? 'bg-rose-800 text-white' : 'text-rose-400 hover:bg-slate-800'}`}>Signal</button>
                ) : null}
                {dualStreamResult ? (
                  <button type="button" onClick={() => { setRawViewMode('dual'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'dual' && isRawOpen ? 'bg-violet-800 text-white' : 'text-violet-400 hover:bg-slate-800'}`}>Dual</button>
                ) : null}
                {currentObservation.layeredThinkingTrace ? (
                  <button type="button" onClick={() => { setRawViewMode('layered'); setIsRawOpen(true) }} className={`rounded px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${rawViewMode === 'layered' && isRawOpen ? 'bg-emerald-800 text-white' : 'text-emerald-400 hover:bg-slate-800'}`}>Layered</button>
                ) : null}
                <button type="button" onClick={() => setIsRawOpen(!isRawOpen)} className="p-1.5 text-slate-500 hover:text-white">{isRawOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
              </div>
            </div>
            {isRawOpen ? (
              <div className="max-h-[500px] overflow-y-auto break-all whitespace-pre-wrap bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-300">
                {rawViewMode === 'pipeline' ? JSON.stringify(pipelineResult, null, 2) : null}
                {rawViewMode === 'view' ? JSON.stringify(studioView, null, 2) : null}
                {rawViewMode === 'home' ? JSON.stringify({ homeState: studioView.homeState, homeCheck: studioView.homeCheck, returnTrace: studioView.returnTrace, rawReplyPreview: studioView.rawReplyPreview, adjustedReplyPreview: studioView.adjustedReplyPreview }, null, 2) : null}
                {rawViewMode === 'revision' ? JSON.stringify({ currentEntry: currentRevisionEntry, revisionState: { plasticity: revisionState.plasticity, memoryCount: revisionState.memory.entries.length, tuningCounts: { locked: revisionState.tuning.locked.size, softened: revisionState.tuning.softened.size, reverted: revisionState.tuning.reverted.size, kept: revisionState.tuning.kept.size } } }, null, 2) : null}
                {rawViewMode === 'facade_raw' ? JSON.stringify(rawFacadeView, null, 2) : null}
                {rawViewMode === 'facade_translated' ? JSON.stringify(translatedFacadeView, null, 2) : null}
                {rawViewMode === 'facade_notes' ? JSON.stringify({ translation: facadeTranslation, profile: presentationBiasProfile }, null, 2) : null}
                {rawViewMode === 'signal' && currentObservation.signalResult ? JSON.stringify(currentObservation.signalResult, null, 2) : null}
                {rawViewMode === 'dual' && dualStreamResult ? JSON.stringify(dualStreamResult, null, 2) : null}
                {rawViewMode === 'layered' && currentObservation.layeredThinkingTrace ? JSON.stringify(currentObservation.layeredThinkingTrace, null, 2) : null}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="my-4 flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 px-4 py-24 text-slate-400">
          <BrainCircuit className="mb-6 h-20 w-20 text-indigo-100" />
          <h2 className="mb-3 text-2xl font-bold text-slate-700">観察研究モードの準備ができています</h2>
          <p className="mb-10 max-w-md text-center text-[15px] font-medium leading-relaxed text-slate-500">
            テキストを入力すると、実際の Node Pipeline と Home Layer が走り、結晶AIの返答がどう結晶化したかを研究ビューで観察できます。
          </p>
        </div>
      )}

      {!currentObservation && history.length > 0 ? <HistoryTab history={history} restoreHistory={handleRestore} /> : null}
    </div>
  )
}
