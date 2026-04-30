export type AnalyzeFlowState = 'idle' | 'ready' | 'analyzing' | 'completed' | 'error'

export type AnalyzeFlowViewModel = {
  state: AnalyzeFlowState
  inputText: string
  canAnalyze: boolean
  helperText: string
  currentStep?: string
  completedSteps: string[]
  errorMessage?: string
}

type BuildAnalyzeFlowViewModelInput = {
  inputText: string
  isAnalyzing: boolean
  hasObservation: boolean
  errorMessage?: string
}

export const buildAnalyzeFlowViewModel = (input: BuildAnalyzeFlowViewModelInput): AnalyzeFlowViewModel => {
  const { inputText, isAnalyzing, hasObservation, errorMessage } = input
  const trimmed = inputText.trim()

  if (errorMessage) {
    return {
      state: 'error',
      inputText,
      canAnalyze: trimmed.length > 0,
      helperText: 'Analyze に失敗しました。もう一度試してください。',
      completedSteps: [],
      errorMessage,
    }
  }

  if (isAnalyzing) {
    return {
      state: 'analyzing',
      inputText,
      canAnalyze: false,
      helperText: '内部パイプラインを観察中...',
      completedSteps: [],
    }
  }

  if (hasObservation) {
    return {
      state: 'completed',
      inputText,
      canAnalyze: trimmed.length > 0,
      helperText: '今回の観察結果',
      completedSteps: [],
    }
  }

  if (trimmed.length > 0) {
    return {
      state: 'ready',
      inputText,
      canAnalyze: true,
      helperText: 'Analyze すると、内部の発火・成長・リスクが更新されます。',
      completedSteps: [],
    }
  }

  return {
    state: 'idle',
    inputText,
    canAnalyze: false,
    helperText: 'まず観察したいテキストを入力してください。',
    completedSteps: [],
  }
}
