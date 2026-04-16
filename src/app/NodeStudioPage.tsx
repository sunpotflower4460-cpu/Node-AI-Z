import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrainCircuit, Settings2 } from 'lucide-react'
import { runNodePipeline } from '../core/runNodePipeline'
import { buildStudioViewModel } from '../studio/buildStudioViewModel'
import { buildRevisionEntry } from '../revision/buildRevisionEntry'
import { loadRevisionState, saveRevisionState, clearRevisionState } from '../revision/revisionStorage'
import { applyUserTuning } from '../revision/applyUserTuning'
import { addRevisionEntry } from '../revision/revisionLog'
import { apiProviders, getApiProviderConfig } from '../config/apiProviders'
import { loadExperienceMessages, saveExperienceMessages } from '../storage/experienceStorage'
import { loadApiSelection, saveApiSelection } from '../storage/apiSelectionStorage'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import { runSignalRuntime } from '../signal/runSignalRuntime'
import { buildSignalRevisionEntry } from '../signal/buildSignalRevisionEntry'
import type { ApiProviderId, ApiSelectionState } from '../types/apiProvider'
import type { ExperienceMessage, AppMode, ObservationRecord, RuntimeMode } from '../types/experience'
import type { NodePipelineResult, PlasticityState, RevisionEntry, RevisionState, StudioViewModel, UserTuningAction } from '../types/nodeStudio'
import { ModeSwitch } from '../ui/components/ModeSwitch'
import { ExperienceMode } from '../ui/modes/ExperienceMode'
import { ObserveMode } from '../ui/modes/ObserveMode'

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`
  }

  const highResolutionTime = typeof performance !== 'undefined' ? performance.now().toFixed(5) : '0'
  return `${prefix}_${Date.now()}_${highResolutionTime}_${Math.random().toString(36).slice(2, 8)}`
}

const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

const hasObservationData = (
  message: ExperienceMessage,
): message is ExperienceMessage & { pipelineResult: NodePipelineResult; studioView: StudioViewModel; revisionEntry: RevisionEntry } => {
  return message.role === 'assistant' && Boolean(message.pipelineResult && message.studioView && message.revisionEntry)
}

export default function NodeStudioPage() {
  const [mode, setMode] = useState<AppMode>('observe')
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>('node')
  const [currentObservation, setCurrentObservation] = useState<ObservationRecord | null>(null)
  const [observeHistory, setObserveHistory] = useState<ObservationRecord[]>([])
  const [experienceMessages, setExperienceMessages] = useState<ExperienceMessage[]>(() => loadExperienceMessages())
  const [apiSelection, setApiSelection] = useState<ApiSelectionState>(() => loadApiSelection())
  const [revisionState, setRevisionState] = useState<RevisionState>(() => loadRevisionState())
  const [isApiPanelOpen, setIsApiPanelOpen] = useState(false)

  const currentProviderConfig = useMemo(() => getApiProviderConfig(apiSelection.baseProvider), [apiSelection.baseProvider])

  useEffect(() => {
    saveRevisionState(revisionState)
  }, [revisionState])

  useEffect(() => {
    saveExperienceMessages(experienceMessages)
  }, [experienceMessages])

  useEffect(() => {
    saveApiSelection(apiSelection)
  }, [apiSelection])

  const addRevisionEntryToMemory = useCallback((entry: RevisionEntry) => {
    setRevisionState((previous) => addRevisionEntry(previous, entry))
  }, [])

  const createObservation = useCallback(async (
    text: string,
    type: ObservationRecord['type'],
    plasticity: PlasticityState,
    provider: ApiProviderId,
    runtime: RuntimeMode,
  ): Promise<ObservationRecord> => {
    if (runtime === 'signal') {
      const signalResult = runSignalRuntime(text)
      const revisionEntry = buildSignalRevisionEntry(signalResult)
      const timestamp = new Date().toISOString()
      // Build a minimal NodePipelineResult / StudioViewModel so ObservationRecord shape stays consistent
      const pipelineResult = runNodePipeline(text, plasticity)
      const studioView = buildStudioViewModel(pipelineResult, plasticity)
      return {
        id: createId(type),
        type,
        runtimeMode: 'signal',
        text,
        timestamp,
        time: formatTime(timestamp),
        pipelineResult,
        studioView,
        revisionEntry,
        assistantReply: signalResult.utterance,
        signalResult,
      }
    }

    const pipelineResult = runNodePipeline(text, plasticity)
    const studioView = buildStudioViewModel(pipelineResult, plasticity)
    const revisionEntry = buildRevisionEntry(pipelineResult, studioView)
    const assistantReply = await generateSurfaceReply({ provider, studioView })
    const timestamp = new Date().toISOString()

    return {
      id: createId(type),
      type,
      runtimeMode: 'node',
      text,
      timestamp,
      time: formatTime(timestamp),
      pipelineResult,
      studioView,
      revisionEntry,
      assistantReply,
    }
  }, [])

  const experienceHistory = useMemo<ObservationRecord[]>(() => {
    return experienceMessages
      .filter(hasObservationData)
      .map((message) => ({
        id: message.observationId,
        type: 'experience' as const,
        runtimeMode: message.runtimeMode ?? ('node' as const),
        text: message.pipelineResult.inputText,
        timestamp: message.timestamp,
        time: formatTime(message.timestamp),
        pipelineResult: message.pipelineResult,
        studioView: message.studioView,
        revisionEntry: message.revisionEntry,
        assistantReply: message.text,
        signalResult: message.signalResult,
      }))
  }, [experienceMessages])

  const history = useMemo(() => {
    return [...observeHistory, ...experienceHistory].sort((first, second) => {
      return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()
    })
  }, [experienceHistory, observeHistory])

  const handleObserveAnalyze = useCallback(async (text: string) => {
    const record = await createObservation(text, 'observe', revisionState.plasticity, apiSelection.baseProvider, runtimeMode)
    addRevisionEntryToMemory(record.revisionEntry)
    setObserveHistory((previous) => [record, ...previous])
    setCurrentObservation(record)
  }, [addRevisionEntryToMemory, apiSelection.baseProvider, createObservation, revisionState.plasticity, runtimeMode])

  const handleExperienceSend = useCallback(async (text: string) => {
    const record = await createObservation(text, 'experience', revisionState.plasticity, apiSelection.baseProvider, runtimeMode)
    const turnTimestamp = record.timestamp

    addRevisionEntryToMemory(record.revisionEntry)
    setCurrentObservation(record)
    setExperienceMessages((previous) => [
      ...previous,
      {
        id: createId('exp_user'),
        observationId: record.id,
        role: 'user',
        text,
        timestamp: turnTimestamp,
        runtimeMode,
        pipelineResult: record.pipelineResult,
        studioView: record.studioView,
        revisionEntry: record.revisionEntry,
        signalResult: record.signalResult,
      },
      {
        id: createId('exp_assistant'),
        observationId: record.id,
        role: 'assistant',
        text: record.assistantReply,
        timestamp: turnTimestamp,
        runtimeMode,
        pipelineResult: record.pipelineResult,
        studioView: record.studioView,
        revisionEntry: record.revisionEntry,
        signalResult: record.signalResult,
        },
      ])
  }, [addRevisionEntryToMemory, apiSelection.baseProvider, createObservation, revisionState.plasticity, runtimeMode])

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
  }, [])

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
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 md:text-xl">
              <BrainCircuit className="h-5 w-5 text-indigo-600 md:h-6 md:w-6" />
              Node-AI-Z
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">SRM-2 / Provisional Plasticity</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              研究するための観察ビューと、実際に話すための体験ビューを往復しながら、育つ知性を見ていく実験アプリ。
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Surface Provider: {currentProviderConfig.label}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                Internal reasoning: shared
              </span>
              <button
                type="button"
                onClick={() => setIsApiPanelOpen((previous) => !previous)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                <Settings2 className="h-3.5 w-3.5" />
                基準APIを選ぶ
              </button>

              {isApiPanelOpen ? (
                <div className="absolute right-0 top-full z-40 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
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
            </div>
            <ModeSwitch mode={mode} onChange={setMode} />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-6 px-4 py-6 md:px-6">
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
