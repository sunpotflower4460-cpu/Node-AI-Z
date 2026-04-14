import { useState } from 'react'
import { Activity, BrainCircuit, ChevronDown, ChevronUp, Compass, GitPullRequest, Home, MessageSquareText, RefreshCw, Search, Sparkles, Terminal } from 'lucide-react'
import type { ObservationRecord } from '../../types/experience'
import type { AppliedBoostEntry, RevisionState, UserTuningAction } from '../../types/nodeStudio'
import { buildPromotionKey, summarizePromotion } from '../../revision/promotionRules'
import { describeProposedChange, formatRevisionDelta, getRevisionKindLabel, getRevisionStatusMeta } from '../../revision/statusMeta'
import { HistoryTab } from '../tabs/HistoryTab'
import { HomeTab } from '../tabs/HomeTab'
import { PatternsTab } from '../tabs/PatternsTab'
import { RelationsTab } from '../tabs/RelationsTab'
import { ReplyTab } from '../tabs/ReplyTab'
import { StatesTab } from '../tabs/StatesTab'
import { RevisionTab } from '../tabs/RevisionTab'
import { Badge } from '../components/CommonUI'

const SAMPLE_INPUTS = [
  '仕事に対する意欲が湧かなくて、転職すべきか悩んでいる',
  '最近ずっと、自分のことを信じきれない',
  'なんとなく引っかかるけど、まだ言葉にできない',
  'ただ分かってほしいだけなのかもしれない',
  '少しだけ希望はある気がする',
]

type ActiveTab = 'Reply' | 'States' | 'Relations' | 'Patterns' | 'Home' | 'History' | 'Revision'
type RawViewMode = 'pipeline' | 'view' | 'home' | 'revision'
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

type AppliedBoostSource = 'auto' | 'keep' | 'soften' | 'lock'

const APPLIED_KIND_TO_REVISION_KIND = {
  relation: 'relation_weight',
  pattern: 'pattern_weight',
  home_trigger: 'home_trigger',
  tone: 'tone_bias',
  node: 'node_weight',
} as const

const buildAppliedPromotionKey = (entry: AppliedBoostEntry) => {
  return buildPromotionKey({ kind: APPLIED_KIND_TO_REVISION_KIND[entry.kind], key: entry.key })
}

const buildKeySourceMap = (revisionState: RevisionState): Map<string, AppliedBoostSource> => {
  const map = new Map<string, AppliedBoostSource>()
  for (const memEntry of revisionState.memory.entries) {
    for (const change of memEntry.proposedChanges) {
      const promotionKey = buildPromotionKey(change)
      if (map.has(promotionKey)) continue
      if (revisionState.tuning.locked.has(change.id)) {
        map.set(promotionKey, 'lock')
      } else if (revisionState.tuning.kept.has(change.id)) {
        map.set(promotionKey, 'keep')
      } else if (revisionState.tuning.softened.has(change.id)) {
        map.set(promotionKey, 'soften')
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
  const [activeTab, setActiveTab] = useState<ActiveTab>('Reply')
  const [isRawOpen, setIsRawOpen] = useState(false)
  const [rawViewMode, setRawViewMode] = useState<RawViewMode>('pipeline')
  const [isProcessOpen, setIsProcessOpen] = useState(true)

  const handleAnalyze = () => {
    const trimmed = inputText.trim()
    if (!trimmed || isAnalyzing) {
      return
    }

    setIsAnalyzing(true)

    window.setTimeout(() => {
      void Promise.resolve(onAnalyze(trimmed)).finally(() => {
        setActiveTab('Reply')
        setIsAnalyzing(false)
      })
    }, 400)
  }

  const handleSampleClick = (text: string) => {
    setInputText(text)
    setIsAnalyzing(true)

    window.setTimeout(() => {
      void Promise.resolve(onAnalyze(text)).finally(() => {
        setActiveTab('Reply')
        setIsAnalyzing(false)
      })
    }, 400)
  }

  const handleRestore = (item: ObservationRecord) => {
    setInputText(item.text)
    onRestore(item)
    setActiveTab('Reply')
    setIsRawOpen(false)
  }

  const handleResetView = () => {
    setInputText('')
    onResetCurrent()
  }

  const pipelineResult = currentObservation?.pipelineResult ?? null
  const studioView = currentObservation?.studioView ?? null
  const currentRevisionEntry = currentObservation?.revisionEntry ?? null
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
  const promotionSummary = summarizePromotion(revisionState)

  return (
    <div className="flex flex-1 flex-col gap-6">
      <section className="rounded-3xl border border-indigo-100 bg-white px-5 py-6 shadow-sm md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <Compass className="h-4 w-4" />
              観察研究モード
            </div>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
              <BrainCircuit className="h-6 w-6 text-indigo-600" />
              Node Studio
            </h2>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500 md:text-[15px]">
              内部プロセスを観察し、反応・構造・修正・帰還を研究するモードです。結晶思考モデルの挙動を見ながら、Node / Relation / Pattern / Home / Revision を比較・検証できます。
            </p>
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
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                placeholder="テキストを入力して内部パイプラインを観察する..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-[15px] font-medium text-slate-800 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isAnalyzing ? <RefreshCw className="h-4.5 w-4.5 animate-spin" /> : <Activity className="h-4.5 w-4.5" />}
              Analyze
            </button>
          </div>
          <div className="scrollbar-hide flex items-center gap-2.5 overflow-x-auto pb-1">
            <span className="mr-1 flex shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400"><Terminal className="h-3.5 w-3.5" /> Samples</span>
            {SAMPLE_INPUTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="shrink-0 rounded-lg border border-slate-200/60 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200"
              >
                {sample.length > 20 ? `${sample.substring(0, 20)}...` : sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {currentObservation && pipelineResult && studioView ? (
        <>
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

          <section className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Promotion / Memory Growth
                </div>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-700">
                  ephemeral → provisional → promoted の育ち具合と、plasticity に安定反映されている記憶をまとめて表示します。
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { label: 'Total Entries', value: promotionSummary.growth.totalEntries, colorClass: 'bg-slate-50 border-slate-200 text-slate-800' },
                { label: getRevisionStatusMeta('ephemeral').label, value: promotionSummary.growth.ephemeralCount, colorClass: 'bg-slate-50 border-slate-200 text-slate-700' },
                { label: getRevisionStatusMeta('provisional').label, value: promotionSummary.growth.provisionalCount, colorClass: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                { label: getRevisionStatusMeta('promoted').label, value: promotionSummary.growth.promotedCount, colorClass: 'bg-green-50 border-green-200 text-green-800' },
                { label: getRevisionStatusMeta('reverted').label, value: promotionSummary.growth.revertedCount, colorClass: 'bg-red-50 border-red-200 text-red-800' },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border p-3 ${item.colorClass}`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-70">{item.label}</div>
                  <div className="mt-2 text-2xl font-bold">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recently Promoted</h3>
                {promotionSummary.recentlyPromoted.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {promotionSummary.recentlyPromoted.map((item) => (
                      <div key={`${item.kind}:${item.key}`} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Badge colorClass={getRevisionStatusMeta(item.status).badgeClass}>{getRevisionStatusMeta(item.status).label}</Badge>
                          <span className="text-xs font-bold text-green-700">{formatRevisionDelta(item.cumulativeDelta)}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{getRevisionKindLabel(item.kind)} / {item.key}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">keep {item.keepCount} / seen {item.occurrenceCount}</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{item.reasonSummary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">まだ promoted に達した memory はありません。keep と再登場が揃うとここに出ます。</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Provisional Queue</h3>
                {promotionSummary.provisionalQueue.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {promotionSummary.provisionalQueue.map((item) => (
                      <div key={`${item.kind}:${item.key}`} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Badge colorClass={getRevisionStatusMeta(item.status).badgeClass}>{getRevisionStatusMeta(item.status).label}</Badge>
                          {item.isLocked ? <Badge colorClass="bg-indigo-100 text-indigo-700 border-indigo-200">locked</Badge> : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{getRevisionKindLabel(item.kind)} / {item.key}</p>
                        <p className="mt-1 text-[11px] font-medium text-slate-500">keep {item.keepCount} / occurrence {item.occurrenceCount}</p>
                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{item.reasonSummary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">いまは provisional 待ちの候補が薄く、既存の記憶は安定化しています。</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Top Thickened Pipes</h3>
                {promotionSummary.topThickenedPipes.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    {promotionSummary.topThickenedPipes.map((item) => (
                      <div key={`${item.kind}:${item.key}`} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <Badge colorClass="bg-indigo-100 text-indigo-700 border-indigo-200">{getRevisionKindLabel(item.kind)}</Badge>
                          <span className="text-xs font-bold text-indigo-700">{formatRevisionDelta(item.delta)}</span>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{item.key}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">まだ太くなった pipe は少なく、塑性は初期状態に近いです。</p>
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
                      const source = sourceMap.get(buildAppliedPromotionKey(entry)) ?? 'auto'
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

          <div className="flex min-w-0 flex-col gap-6">
            <div className="scrollbar-hide sticky top-[92px] z-10 flex gap-2 overflow-x-auto border-b-2 border-slate-100 bg-[#F8FAFC] pb-1 pt-1">
              {(['Reply', 'States', 'Relations', 'Patterns', 'Home', 'History', 'Revision'] as ActiveTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-[2px] flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3 text-[15px] font-bold transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'}`}
                >
                  {tab === 'Reply' ? <MessageSquareText className="h-4.5 w-4.5" /> : null}
                  {tab === 'Home' ? <Home className="h-4.5 w-4.5" /> : null}
                  {tab === 'Relations' ? <GitPullRequest className="h-4.5 w-4.5" /> : null}
                  {tab === 'Revision' ? <RefreshCw className="h-4.5 w-4.5" /> : null}
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex flex-col">
              {activeTab === 'Reply' ? <ReplyTab studioView={studioView} surfaceReply={currentObservation.assistantReply} surfaceProviderLabel={surfaceProviderLabel} analyzedText={currentObservation.text} isProcessOpen={isProcessOpen} setIsProcessOpen={setIsProcessOpen} currentRevisionEntry={currentRevisionEntry} tuning={revisionState.tuning} onTuningAction={onTuningAction} /> : null}
              {activeTab === 'Home' ? <HomeTab studioView={studioView} /> : null}
              {activeTab === 'States' ? <StatesTab pipelineResult={pipelineResult} /> : null}
              {activeTab === 'Relations' ? <RelationsTab pipelineResult={pipelineResult} /> : null}
              {activeTab === 'Patterns' ? <PatternsTab studioView={studioView} /> : null}
              {activeTab === 'History' ? <HistoryTab history={history} restoreHistory={handleRestore} /> : null}
              {activeTab === 'Revision' ? <RevisionTab revisionState={revisionState} currentEntry={currentRevisionEntry} onTuningAction={onTuningAction} onClearAll={onClearRevision} /> : null}
            </div>
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
                <button type="button" onClick={() => setIsRawOpen(!isRawOpen)} className="p-1.5 text-slate-500 hover:text-white">{isRawOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
              </div>
            </div>
            {isRawOpen ? (
              <div className="max-h-[500px] overflow-y-auto break-all whitespace-pre-wrap bg-slate-900 p-5 font-mono text-xs leading-relaxed text-slate-300">
                {rawViewMode === 'pipeline' ? JSON.stringify(pipelineResult, null, 2) : null}
                {rawViewMode === 'view' ? JSON.stringify(studioView, null, 2) : null}
                {rawViewMode === 'home' ? JSON.stringify({ homeState: studioView.homeState, homeCheck: studioView.homeCheck, returnTrace: studioView.returnTrace, rawReplyPreview: studioView.rawReplyPreview, adjustedReplyPreview: studioView.adjustedReplyPreview }, null, 2) : null}
                {rawViewMode === 'revision' ? JSON.stringify({ currentEntry: currentRevisionEntry, revisionState: { plasticity: revisionState.plasticity, memoryCount: revisionState.memory.entries.length, tuningCounts: { locked: revisionState.tuning.locked.size, softened: revisionState.tuning.softened.size, reverted: revisionState.tuning.reverted.size, kept: revisionState.tuning.kept.size } } }, null, 2) : null}
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
