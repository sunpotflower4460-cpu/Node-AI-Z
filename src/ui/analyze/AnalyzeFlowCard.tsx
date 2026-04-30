import { useState } from 'react'
import type { ObservationRecord } from '../../types/experience'
import type { PrimaryTabId } from '../navigation/tabUiTypes'
import { buildAnalyzeFlowViewModel } from '../viewModels/buildAnalyzeFlowViewModel'
import { buildAnalyzeResultSummaryViewModel } from '../viewModels/buildAnalyzeResultSummaryViewModel'
import { buildPostAnalyzeNextActionsViewModel } from '../viewModels/buildPostAnalyzeNextActionsViewModel'
import { AnalyzeInputArea } from './AnalyzeInputArea'
import { AnalyzeProgressPanel } from './AnalyzeProgressPanel'
import { AnalyzeResultSummary } from './AnalyzeResultSummary'
import { PostAnalyzeNextActions } from './PostAnalyzeNextActions'
import { AnalyzeErrorState } from './AnalyzeErrorState'

type AnalyzeFlowCardProps = {
  inputText: string
  isAnalyzing: boolean
  currentObservation: ObservationRecord | null
  previousObservation: ObservationRecord | null
  errorMessage?: string
  researchMode?: boolean
  onInputChange: (text: string) => void
  onAnalyze: () => void
  onSampleClick: (text: string) => void
  onTabChange: (tabId: PrimaryTabId) => void
  onRetry?: () => void
}

export const AnalyzeFlowCard = ({
  inputText,
  isAnalyzing,
  currentObservation,
  previousObservation,
  errorMessage,
  researchMode = false,
  onInputChange,
  onAnalyze,
  onSampleClick,
  onTabChange,
  onRetry,
}: AnalyzeFlowCardProps) => {
  const [showEmptyHint, setShowEmptyHint] = useState(false)

  const flowViewModel = buildAnalyzeFlowViewModel({
    inputText,
    isAnalyzing,
    hasObservation: currentObservation !== null,
    errorMessage,
  })

  const resultSummaryViewModel = buildAnalyzeResultSummaryViewModel({
    currentObservation,
    previousObservation,
  })

  const nextActionsViewModel = buildPostAnalyzeNextActionsViewModel({
    currentObservation,
    previousObservation,
  })

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      setShowEmptyHint(true)
      return
    }
    setShowEmptyHint(false)
    onAnalyze()
  }

  const stateLabel: Record<typeof flowViewModel.state, string> = {
    idle: 'まず観察したいテキストを入力してください。',
    ready: 'Analyze すると、内部の発火・成長・リスクが更新されます。',
    analyzing: '内部パイプラインを観察中...',
    completed: '今回の観察結果',
    error: 'Analyze に失敗しました。',
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <p className="mb-3 text-sm font-bold text-slate-700">観察する</p>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">{stateLabel[flowViewModel.state]}</p>

      <AnalyzeInputArea
        inputText={inputText}
        isAnalyzing={isAnalyzing}
        showEmptyHint={showEmptyHint && flowViewModel.state === 'idle'}
        helperText={undefined}
        onInputChange={(text) => {
          onInputChange(text)
          if (text.trim()) setShowEmptyHint(false)
        }}
        onAnalyze={handleAnalyze}
        onSampleClick={onSampleClick}
      />

      {isAnalyzing ? (
        <div className="mt-4">
          <AnalyzeProgressPanel
            researchMode={researchMode}
          />
        </div>
      ) : null}

      {flowViewModel.state === 'error' ? (
        <div className="mt-4">
          <AnalyzeErrorState
            errorMessage={errorMessage}
            researchMode={researchMode}
            onRetry={onRetry}
          />
        </div>
      ) : null}

      {flowViewModel.state === 'completed' && resultSummaryViewModel.hasResult ? (
        <div className="mt-4 flex flex-col gap-3">
          <AnalyzeResultSummary
            viewModel={resultSummaryViewModel}
            researchMode={researchMode}
            onTabChange={onTabChange}
          />
          {nextActionsViewModel.actions.length > 0 ? (
            <PostAnalyzeNextActions
              viewModel={nextActionsViewModel}
              onTabChange={onTabChange}
            />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
