import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrainCircuit, ChevronDown, Settings2, SlidersHorizontal } from 'lucide-react'
import { loadRevisionState, saveRevisionState, clearRevisionState } from '../revision/revisionStorage'
import { applyUserTuning } from '../revision/applyUserTuning'
import { addRevisionEntry } from '../revision/revisionLog'
import { apiProviders, getApiProviderConfig } from '../config/apiProviders'
import { loadExperienceMessages, saveExperienceMessages } from '../storage/experienceStorage'
import { loadApiSelection, saveApiSelection } from '../storage/apiSelectionStorage'
import { applyTuningToSomaticMarkers } from '../runtime/applyTuningToSomaticMarkers'
import { createExperienceTurnMessages, createObservationRecord } from '../runtime/createObservationRecord'
import { DEFAULT_OBSERVATION_DECISION_SHAPE, updatePersonalLearningFromObservation } from '../runtime/updatePersonalLearningFromObservation'
import { createPersonalLearningState } from '../learning/personalLearning'
import type { PersonalLearningState } from '../learning/types'
import type { ApiProviderId, ApiSelectionState } from '../types/apiProvider'
import type { ExperienceMessage, AppMode, ObservationRecord, RuntimeMode, ImplementationMode } from '../types/experience'
import type { RevisionEntry, RevisionState, UserTuningAction } from '../types/nodeStudio'
import type { SessionBrainState } from '../brain/sessionBrainState'
import { createInitialBrainState } from '../brain/createInitialBrainState'
import { loadSessionBrainState, saveSessionBrainState } from '../storage/sessionBrainStorage'
import { mapExperienceMessagesToObservationHistory, mergeObservationHistories } from '../studio/mapExperienceMessagesToObservationHistory'
import { ModeSwitch } from '../ui/components/ModeSwitch'
import { ExperienceMode } from '../ui/modes/ExperienceMode'
import { ObserveMode } from '../ui/modes/ObserveMode'
import { HelpIcon, StatusIndicator } from '../ui/components/CommonUI'

export default function NodeStudioPage() {
  const [mode, setMode] = useState<AppMode>('observe')
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>('node')
  const [implementationMode, setImplementationMode] = useState<ImplementationMode>('jibun_kaigi_api')
  const [currentObservation, setCurrentObservation] = useState<ObservationRecord | null>(null)
  const [observeHistory, setObserveHistory] = useState<ObservationRecord[]>([])
  const [experienceMessages, setExperienceMessages] = useState<ExperienceMessage[]>(() => loadExperienceMessages(implementationMode))
  const [apiSelection, setApiSelection] = useState<ApiSelectionState>(() => loadApiSelection())
  const [revisionState, setRevisionState] = useState<RevisionState>(() => loadRevisionState())
  const [isApiPanelOpen, setIsApiPanelOpen] = useState(false)
  const [isHeaderDetailsOpen, setIsHeaderDetailsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [personalLearning, setPersonalLearning] = useState<PersonalLearningState>(() => createPersonalLearningState())
  // Phase 1: Session brain state for crystallized_thinking mode
  const [brainState, setBrainState] = useState<SessionBrainState | undefined>(() => {
    // Load from localStorage if available, otherwise create new initial state
    const loaded = loadSessionBrainState()
    return loaded ?? createInitialBrainState()
  })

  const currentProviderConfig = useMemo(() => getApiProviderConfig(apiSelection.baseProvider), [apiSelection.baseProvider])

  useEffect(() => {
    saveRevisionState(revisionState)
  }, [revisionState])

  useEffect(() => {
    saveExperienceMessages(implementationMode, experienceMessages)
  }, [implementationMode, experienceMessages])

  useEffect(() => {
    saveApiSelection(apiSelection)
  }, [apiSelection])

  // Phase 1: Save brain state to localStorage when it changes
  useEffect(() => {
    if (brainState && implementationMode === 'crystallized_thinking') {
      saveSessionBrainState(brainState)
    }
  }, [brainState, implementationMode])

  const addRevisionEntryToMemory = useCallback((entry: RevisionEntry) => {
    setRevisionState((previous) => addRevisionEntry(previous, entry))
  }, [])

  const applyObservationLearning = useCallback((record: ObservationRecord) => {
    setPersonalLearning((previous) => updatePersonalLearningFromObservation(previous, record))
  }, [])

  const createObservation = useCallback(async (
    text: string,
    type: ObservationRecord['type'],
    provider: ApiProviderId,
    runtimeMode: RuntimeMode,
    currentImplementationMode: ImplementationMode,
    currentPersonalLearning: PersonalLearningState,
    currentBrainState?: SessionBrainState,
  ): Promise<ObservationRecord> => {
    return createObservationRecord({
      type,
      text,
      provider,
      runtimeMode,
      implementationMode: currentImplementationMode,
      personalLearning: currentPersonalLearning,
      plasticity: revisionState.plasticity,
      brainState: currentImplementationMode === 'crystallized_thinking' ? currentBrainState : undefined,
    })
  }, [revisionState.plasticity])

  const experienceHistory = useMemo<ObservationRecord[]>(() => {
    return mapExperienceMessagesToObservationHistory(experienceMessages)
  }, [experienceMessages])

  const history = useMemo(() => {
    return mergeObservationHistories(observeHistory, experienceHistory)
  }, [experienceHistory, observeHistory])

  const commitObservationRecord = useCallback((record: ObservationRecord, type: ObservationRecord['type']) => {
    addRevisionEntryToMemory(record.revisionEntry)
    setCurrentObservation(record)
    applyObservationLearning(record)

    // Phase 1: Update brain state after observation (crystallized_thinking only)
    if (record.implementationMode === 'crystallized_thinking' && record.nextBrainState) {
      setBrainState(record.nextBrainState)
    }

    if (type === 'observe') {
      setObserveHistory((previous) => [record, ...previous])
      return
    }

    setExperienceMessages((previous) => [...previous, ...createExperienceTurnMessages(record)])
  }, [addRevisionEntryToMemory, applyObservationLearning])

  const handleObservationSubmit = useCallback(async (text: string, type: ObservationRecord['type']) => {
    setIsSending(true)
    try {
      const record = await createObservation(text, type, apiSelection.baseProvider, runtimeMode, implementationMode, personalLearning, brainState)
      commitObservationRecord(record, type)
    } finally {
      setIsSending(false)
    }
  }, [apiSelection.baseProvider, commitObservationRecord, createObservation, personalLearning, runtimeMode, implementationMode, brainState])

  const handleObserveAnalyze = useCallback(async (text: string) => {
    await handleObservationSubmit(text, 'observe')
  }, [handleObservationSubmit])

  const handleExperienceSend = useCallback(async (text: string) => {
    await handleObservationSubmit(text, 'experience')
  }, [handleObservationSubmit])

  const handleRestoreObservation = useCallback((record: ObservationRecord) => {
    setCurrentObservation(record)
  }, [])

  const handleOpenObservation = useCallback((observationId: string) => {
    const record = history.find((item) => item.id === observationId)
    if (!record) {
      return
    }

    setCurrentObservation(record)
    setMode('observe')
  }, [history])

  const handleResetCurrent = useCallback(() => {
    setCurrentObservation(null)
  }, [])

  const handleTuningAction = useCallback((entryId: string, changeId: string, action: UserTuningAction) => {
    setRevisionState((previous) => applyUserTuning(previous, entryId, changeId, action))
    if (currentObservation?.chunkedResult?.somaticSignature) {
      const { somaticSignature } = currentObservation.chunkedResult
      setPersonalLearning((prev) => ({
        ...prev,
        somaticMarkers: applyTuningToSomaticMarkers(
          prev.somaticMarkers ?? [],
          somaticSignature,
          DEFAULT_OBSERVATION_DECISION_SHAPE,
          action,
          Date.now(),
        ),
      }))
    }
  }, [currentObservation])

  const handleClearRevision = useCallback(() => {
    if (confirm('Clear all revision data? This cannot be undone.')) {
      clearRevisionState()
      setRevisionState(loadRevisionState())
    }
  }, [])

  const handleBaseProviderChange = useCallback((providerId: ApiProviderId) => {
    const providerConfig = getApiProviderConfig(providerId)
    if (!providerConfig.available) {
      return
    }

    setApiSelection({
      baseProvider: providerId,
      lastUpdatedAt: new Date().toISOString(),
    })
    setIsApiPanelOpen(false)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <header className="safe-area-pt sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Row 1: Brand + mobile settings toggle */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
                <BrainCircuit className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Node-AI-Z</h1>
                  <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:inline-block">SRM-3 / CPU Runtime</span>
                  <HelpIcon content="Node-AI-Zは、会話を通じて学習・成長するAIシステムです。観察モードで内部の仕組みを研究したり、体験モードで実際に会話したりできます。" />
                </div>
                <p className="mt-0.5 hidden max-w-2xl text-xs font-medium leading-relaxed text-slate-500 sm:block">
                  研究するための観察ビューと、実際に話すための体験ビューを往復しながら、育つ知性を見ていく実験アプリ。
                </p>
              </div>
            </div>
            {/* Mobile-only settings drawer toggle */}
            <button
              type="button"
              onClick={() => setIsHeaderDetailsOpen((previous) => !previous)}
              aria-expanded={isHeaderDetailsOpen}
              aria-controls="header-details"
              aria-label="設定を開く"
              className="tap-target inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>設定</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isHeaderDetailsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Mobile: prominent mode switch right under title for thumb access */}
          <div className="w-full lg:hidden">
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>

          {/* Settings area: collapsed by default on mobile, always visible on lg */}
          <div
            id="header-details"
            className={`flex-col gap-2.5 lg:flex lg:flex-col lg:items-end ${isHeaderDetailsOpen ? 'flex' : 'hidden'}`}
          >
            <div className="flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center gap-1">
                実装方式
                <HelpIcon content="AIの動作方式を選択できます。じぶん会議方式はAPIを使った対話型、結晶思考方式はAPI不要の独立した推論システムです。" />
              </span>
              <div className="grid grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-slate-100/80 p-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setImplementationMode('jibun_kaigi_api')}
                  aria-pressed={implementationMode === 'jibun_kaigi_api'}
                  title="外部APIを使った対話型の実装方式。OpenAI、Anthropic等のプロバイダーを利用します。"
                  className={`tap-target inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-all duration-150 ${implementationMode === 'jibun_kaigi_api' ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                >
                  じぶん会議(API方式)
                </button>
                <button
                  type="button"
                  onClick={() => setImplementationMode('crystallized_thinking')}
                  aria-pressed={implementationMode === 'crystallized_thinking'}
                  title="外部API不要の独立した推論システム。内部状態を持ち続け、学習しながら成長します。"
                  className={`tap-target inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-all duration-150 ${implementationMode === 'crystallized_thinking' ? 'bg-white text-violet-700 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
                >
                  結晶思考(API非依存)
                </button>
              </div>
            </div>
            <div className="relative flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 inline-flex items-center gap-1">
                <StatusIndicator status={isSending ? 'processing' : 'idle'} />
                Surface Provider: {implementationMode === 'jibun_kaigi_api' ? currentProviderConfig.label : '未使用 (将来AI sensei用)'}
                <HelpIcon content="表面的な返答の生成に使用するAIプロバイダーです。内部の推論は共通で、表現だけが変わります。" />
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                Internal reasoning: shared
                <HelpIcon content="どの方式を選んでも、内部の推論エンジン（Node/Relation/Pattern等）は共通です。" />
              </span>
              <button
                type="button"
                onClick={() => setIsApiPanelOpen((previous) => !previous)}
                disabled={implementationMode !== 'jibun_kaigi_api'}
                aria-expanded={isApiPanelOpen}
                className="tap-target inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Settings2 className="h-3.5 w-3.5" />
                基準APIを選ぶ
              </button>

              {isApiPanelOpen && implementationMode === 'jibun_kaigi_api' ? (
                <div className="absolute left-0 top-full z-40 mt-2 w-full max-w-[min(100vw-2rem,320px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0">
                  <div className="mb-3">
                    <h2 className="text-sm font-bold text-slate-900">基準API選択 v0</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      基準APIは最終発話の表面にだけ影響します。Node / Home / Revision / Memory は共通です。
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {apiProviders.map((provider) => {
                      const isSelected = provider.id === apiSelection.baseProvider

                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => handleBaseProviderChange(provider.id)}
                          disabled={!provider.available}
                          aria-pressed={isSelected}
                          className={`rounded-xl border p-3 text-left transition-all duration-150 ${isSelected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50'} ${!provider.available ? 'cursor-not-allowed bg-slate-50 text-slate-400 opacity-60' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{provider.label}</div>
                              <div className="mt-1 text-xs leading-relaxed text-slate-500">{provider.description}</div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${provider.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                              {provider.available ? (isSelected ? 'Selected' : 'Available') : 'Disabled'}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              {/* Phase 2: Dashboard for Boundary / Confidence / Uncertainty / Replay */}
              {implementationMode === 'crystallized_thinking' && currentObservation && (
                <div className="absolute left-0 top-full z-40 mt-2 w-full max-w-[min(100vw-2rem,400px)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-black/5 sm:left-auto sm:right-0">
                  <div className="mb-3">
                    <h2 className="text-sm font-bold text-slate-900">Phase 2 Runtime State</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Internal state visualization (read-only)
                    </p>
                  </div>

                  {currentObservation.eventBoundary && (
                    <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <div className="text-xs font-semibold text-amber-900">Event Boundary</div>
                      <div className="mt-1 space-y-1">
                        <div className="text-xs text-amber-700">
                          Triggered: {currentObservation.eventBoundary.triggered ? 'Yes' : 'No'}
                        </div>
                        {currentObservation.eventBoundary.triggered && (
                          <>
                            <div className="text-xs text-amber-700">
                              Score: {currentObservation.eventBoundary.score.toFixed(2)} ({currentObservation.eventBoundary.kind})
                            </div>
                            <div className="text-xs text-amber-600">
                              {currentObservation.eventBoundary.reasons.join(', ')}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {currentObservation.confidenceState && (
                    <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <div className="text-xs font-semibold text-blue-900">Confidence State</div>
                      <div className="mt-1 space-y-1">
                        <div className="text-xs text-blue-700">
                          Decision: {(currentObservation.confidenceState.decisionStrength * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-blue-700">
                          Interpretation: {(currentObservation.confidenceState.interpretationConfidence * 100).toFixed(0)}%
                        </div>
                        {currentObservation.confidenceState.shouldAsk && (
                          <div className="text-xs font-semibold text-blue-800">→ Should ask for clarification</div>
                        )}
                        {currentObservation.confidenceState.shouldHold && (
                          <div className="text-xs font-semibold text-blue-800">→ Should hold decision</div>
                        )}
                      </div>
                    </div>
                  )}

                  {currentObservation.uncertaintyState && (
                    <div className="mb-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
                      <div className="text-xs font-semibold text-purple-900">Uncertainty State</div>
                      <div className="mt-1 space-y-1">
                        <div className="text-xs text-purple-700">
                          Sensory: {(currentObservation.uncertaintyState.sensoryUncertainty * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-purple-700">
                          Model: {(currentObservation.uncertaintyState.modelUncertainty * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-purple-700">
                          Precision: {(currentObservation.uncertaintyState.precisionWeight * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-purple-700">
                          Learning Rate: {currentObservation.uncertaintyState.learningRate.toFixed(2)}x
                        </div>
                      </div>
                    </div>
                  )}

                  {currentObservation.replaySummary && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="text-xs font-semibold text-green-900">Replay Summary</div>
                      <div className="mt-1 space-y-1">
                        <div className="text-xs text-green-700">
                          Episodes: {currentObservation.replaySummary.episodesReplayed}
                        </div>
                        <div className="text-xs text-green-700">
                          Updates: {currentObservation.replaySummary.pathwayUpdates.length} pathways
                        </div>
                        <div className="text-xs text-green-700">
                          Consolidation: {(currentObservation.replaySummary.consolidationStrength * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="hidden w-full lg:block lg:w-auto">
              <ModeSwitch mode={mode} onChange={setMode} />
            </div>
          </div>
        </div>
      </header>

      <main className="safe-area-px mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-6 px-4 py-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] md:px-6 md:py-6">
        {mode === 'observe' ? (
          <ObserveMode
            currentObservation={currentObservation}
            history={history}
            revisionState={revisionState}
            surfaceProviderLabel={currentProviderConfig.label}
            onAnalyze={handleObserveAnalyze}
            onRestore={handleRestoreObservation}
            onResetCurrent={handleResetCurrent}
            onTuningAction={handleTuningAction}
            onClearRevision={handleClearRevision}
          />
        ) : (
          <ExperienceMode
            messages={experienceMessages}
            surfaceProviderLabel={currentProviderConfig.label}
            tuning={revisionState.tuning}
            runtimeMode={runtimeMode}
            onRuntimeModeChange={setRuntimeMode}
            onSend={handleExperienceSend}
            onOpenObservation={handleOpenObservation}
            onTuningAction={handleTuningAction}
          />
        )}
      </main>
    </div>
  )
}
