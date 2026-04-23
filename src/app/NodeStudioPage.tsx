import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrainCircuit, Settings2 } from 'lucide-react'
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
    const record = await createObservation(text, type, apiSelection.baseProvider, runtimeMode, implementationMode, personalLearning, brainState)
    commitObservationRecord(record, type)
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
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-4 backdrop-blur md:px-6">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight text-slate-900 md:text-xl">
              <BrainCircuit className="h-5 w-5 text-indigo-600 md:h-6 md:w-6" />
              Node-AI-Z
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">SRM-3 / CPU Runtime</span>
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              研究するための観察ビューと、実際に話すための体験ビューを往復しながら、育つ知性を見ていく実験アプリ。
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">実装方式</span>
              <div className="grid grid-cols-1 gap-1 rounded-xl border border-slate-200 bg-slate-100/80 p-1 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setImplementationMode('jibun_kaigi_api')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${implementationMode === 'jibun_kaigi_api' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  じぶん会議(API方式)
                </button>
                <button
                  type="button"
                  onClick={() => setImplementationMode('crystallized_thinking')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${implementationMode === 'crystallized_thinking' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  結晶思考(API非依存)
                </button>
              </div>
            </div>
            <div className="relative flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Surface Provider: {implementationMode === 'jibun_kaigi_api' ? currentProviderConfig.label : '未使用 (将来AI sensei用)'}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                Internal reasoning: shared
              </span>
              <button
                type="button"
                onClick={() => setIsApiPanelOpen((previous) => !previous)}
                disabled={implementationMode !== 'jibun_kaigi_api'}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Settings2 className="h-3.5 w-3.5" />
                基準APIを選ぶ
              </button>

              {isApiPanelOpen && implementationMode === 'jibun_kaigi_api' ? (
                <div className="absolute left-0 top-full z-40 mt-2 w-full max-w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0">
                  <div className="mb-3">
                    <h2 className="text-sm font-bold text-slate-900">基準API選択 v0</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      基準APIは最終発話の表面にだけ影響します。Node / Home / Revision / Memory は共通です。
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {apiProviders.map((provider) => {
                      const isSelected = provider.id === apiSelection.baseProvider

                      return (
                        <button
                          key={provider.id}
                          type="button"
                          onClick={() => handleBaseProviderChange(provider.id)}
                          disabled={!provider.available}
                          className={`rounded-xl border p-3 text-left transition-colors ${isSelected ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'} ${provider.available ? 'hover:border-indigo-200 hover:bg-slate-50' : 'cursor-not-allowed bg-slate-50 text-slate-400 opacity-70'}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{provider.label}</div>
                              <div className="mt-1 text-xs leading-relaxed text-slate-500">{provider.description}</div>
                            </div>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${provider.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
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
                <div className="absolute left-0 top-full z-40 mt-2 w-full max-w-[400px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-0">
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
            <div className="w-full lg:w-auto">
              <ModeSwitch mode={mode} onChange={setMode} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
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
