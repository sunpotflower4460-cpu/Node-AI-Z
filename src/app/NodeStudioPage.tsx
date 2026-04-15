import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrainCircuit, Settings2 } from 'lucide-react'
import { runNodePipeline } from '../core/runNodePipeline'
import { buildStudioViewModel } from '../studio/buildStudioViewModel'
import { buildRevisionEntry } from '../revision/buildRevisionEntry'
import { loadRevisionState, saveRevisionState, clearRevisionState } from '../revision/revisionStorage'
import { applyUserTuning } from '../revision/applyUserTuning'
import { addRevisionEntry } from '../revision/revisionLog'
import { apiProviders, getApiProviderConfig, mergeApiProviderConfigs } from '../config/apiProviders'
import { loadExperienceMessages, saveExperienceMessages } from '../storage/experienceStorage'
import { loadApiSelection, saveApiSelection } from '../storage/apiSelectionStorage'
import { buildSurfacePrompt } from '../surface/buildSurfacePrompt'
import { generateSurfaceReply } from '../surface/generateSurfaceReply'
import type { ApiProviderId, ApiSelectionState } from '../types/apiProvider'
import type { ExperienceMessage, AppMode, ObservationRecord } from '../types/experience'
import type { NodePipelineResult, PlasticityState, RevisionEntry, RevisionState, StudioViewModel, UserTuningAction } from '../types/nodeStudio'
import type { ProvidersResponse, SurfaceConversationTurn, SurfaceReplyResult } from '../types/surface'
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
  const [currentObservation, setCurrentObservation] = useState<ObservationRecord | null>(null)
  const [observeHistory, setObserveHistory] = useState<ObservationRecord[]>([])
  const [experienceMessages, setExperienceMessages] = useState<ExperienceMessage[]>(() => loadExperienceMessages())
  const [providerConfigs, setProviderConfigs] = useState(apiProviders)
  const [apiSelection, setApiSelection] = useState<ApiSelectionState>(() => loadApiSelection())
  const [revisionState, setRevisionState] = useState<RevisionState>(() => loadRevisionState())
  const [isApiPanelOpen, setIsApiPanelOpen] = useState(false)

  const currentProviderConfig = useMemo(() => getApiProviderConfig(apiSelection.baseProvider, providerConfigs), [apiSelection.baseProvider, providerConfigs])
  const lastExperienceSurfaceMeta = useMemo<SurfaceReplyResult | null>(() => {
    const lastAssistantMessage = [...experienceMessages].reverse().find((message) => message.role === 'assistant')
    return lastAssistantMessage?.surfaceMeta ?? null
  }, [experienceMessages])

  useEffect(() => {
    saveRevisionState(revisionState)
  }, [revisionState])

  useEffect(() => {
    saveExperienceMessages(experienceMessages)
  }, [experienceMessages])

  useEffect(() => {
    saveApiSelection(apiSelection)
  }, [apiSelection])

  useEffect(() => {
    let isMounted = true

    const loadProviderConfigs = async () => {
      try {
        const response = await fetch('/api/providers', { cache: 'no-store' })
        if (!response.ok) {
          return
        }

        const payload = await response.json() as ProvidersResponse
        if (isMounted) {
          setProviderConfigs(mergeApiProviderConfigs(payload.providers))
        }
      } catch {
        if (isMounted) {
          setProviderConfigs(apiProviders)
        }
      }
    }

    void loadProviderConfigs()

    return () => {
      isMounted = false
    }
  }, [])

  const addRevisionEntryToMemory = useCallback((entry: RevisionEntry) => {
    setRevisionState((previous) => addRevisionEntry(previous, entry))
  }, [])

  const createObservation = useCallback(async (
    text: string,
    type: ObservationRecord['type'],
    plasticity: PlasticityState,
  ): Promise<ObservationRecord> => {
    const pipelineResult = runNodePipeline(text, plasticity)
    const studioView = buildStudioViewModel(pipelineResult, plasticity)
    const revisionEntry = buildRevisionEntry(pipelineResult, studioView)
    const timestamp = new Date().toISOString()

    return {
      id: createId(type),
      type,
      text,
      timestamp,
      time: formatTime(timestamp),
      pipelineResult,
      studioView,
      revisionEntry,
      assistantReply: studioView.adjustedReplyPreview,
    }
  }, [])

  const experienceHistory = useMemo<ObservationRecord[]>(() => {
    return experienceMessages
      .filter(hasObservationData)
      .map((message) => ({
        id: message.observationId,
        type: 'experience' as const,
        text: message.pipelineResult.inputText,
        timestamp: message.timestamp,
        time: formatTime(message.timestamp),
        pipelineResult: message.pipelineResult,
        studioView: message.studioView,
        revisionEntry: message.revisionEntry,
        assistantReply: message.text,
      }))
  }, [experienceMessages])

  const history = useMemo(() => {
    return [...observeHistory, ...experienceHistory].sort((first, second) => {
      return new Date(second.timestamp).getTime() - new Date(first.timestamp).getTime()
    })
  }, [experienceHistory, observeHistory])

  const handleObserveAnalyze = useCallback(async (text: string) => {
    const record = await createObservation(text, 'observe', revisionState.plasticity)
    addRevisionEntryToMemory(record.revisionEntry)
    setObserveHistory((previous) => [record, ...previous])
    setCurrentObservation(record)
  }, [addRevisionEntryToMemory, createObservation, revisionState.plasticity])

  const handleExperienceSend = useCallback(async (text: string) => {
    const record = await createObservation(text, 'experience', revisionState.plasticity)
    const turnTimestamp = record.timestamp
    const recentTurns = experienceMessages
      .slice(-4)
      .map<SurfaceConversationTurn>((message) => ({
        role: message.role,
        text: message.text,
      }))
    const prompt = buildSurfacePrompt({
      userInput: text,
      studioView: record.studioView,
      recentTurns,
      plasticity: revisionState.plasticity,
      promotedMemories: revisionState.memory.promoted,
    })
    const surfaceReply = await generateSurfaceReply({
      provider: apiSelection.baseProvider,
      providerConfig: currentProviderConfig,
      prompt,
      fallbackText: record.studioView.adjustedReplyPreview,
    })
    const completedRecord = {
      ...record,
      assistantReply: surfaceReply.text,
    }

    addRevisionEntryToMemory(record.revisionEntry)
    setCurrentObservation(completedRecord)
    setExperienceMessages((previous) => [
      ...previous,
      {
        id: createId('exp_user'),
        observationId: completedRecord.id,
        role: 'user',
        text,
        timestamp: turnTimestamp,
        pipelineResult: completedRecord.pipelineResult,
        studioView: completedRecord.studioView,
        revisionEntry: completedRecord.revisionEntry,
      },
      {
        id: createId('exp_assistant'),
        observationId: completedRecord.id,
        role: 'assistant',
        text: surfaceReply.text,
        timestamp: turnTimestamp,
        pipelineResult: completedRecord.pipelineResult,
        studioView: completedRecord.studioView,
        revisionEntry: completedRecord.revisionEntry,
        surfaceMeta: surfaceReply,
      },
      ])
  }, [addRevisionEntryToMemory, apiSelection.baseProvider, createObservation, currentProviderConfig, experienceMessages, revisionState.memory.promoted, revisionState.plasticity])

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
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">SRM-3 / Surface API Ready</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              研究するための観察ビューと、実際に話すための体験ビューを往復しながら、育つ知性を見ていく実験アプリ。
            </p>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <div className="relative flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Surface Provider: {currentProviderConfig.label}{currentProviderConfig.available ? '' : ' (fallback ready)'}
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
                    <h2 className="text-sm font-bold text-slate-900">基準API選択 v1</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      基準APIは最終発話の表面にだけ影響します。Node / Home / Revision / Memory は共通です。
                    </p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {providerConfigs.map((provider) => {
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
                              {!provider.available && provider.unavailableReason ? (
                                <div className="mt-1 text-[11px] font-medium text-amber-600">{provider.unavailableReason}</div>
                              ) : null}
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
            <div className="flex flex-wrap justify-end gap-2 text-[11px] font-semibold text-slate-500">
              {providerConfigs.map((provider) => (
                <span
                  key={provider.id}
                  className={`rounded-full border px-2.5 py-1 ${provider.available ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                >
                  {provider.label}: {provider.available ? 'ready' : provider.unavailableReason ?? 'unavailable'}
                </span>
              ))}
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
            surfaceProviderStatus={currentProviderConfig.available ? 'ready' : currentProviderConfig.unavailableReason ?? 'fallback ready'}
            lastSurfaceMeta={lastExperienceSurfaceMeta}
            tuning={revisionState.tuning}
            onSend={handleExperienceSend}
            onOpenObservation={handleOpenObservation}
            onTuningAction={handleTuningAction}
          />
        )}
      </main>
    </div>
  )
}
