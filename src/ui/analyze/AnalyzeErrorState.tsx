import { AlertTriangle, RefreshCw } from 'lucide-react'

type AnalyzeErrorStateProps = {
  errorMessage?: string
  researchMode?: boolean
  onRetry?: () => void
}

export const AnalyzeErrorState = ({ errorMessage, researchMode = false, onRetry }: AnalyzeErrorStateProps) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-red-800">Analyze に失敗しました</p>
        <p className="mt-1 text-xs leading-relaxed text-red-700">
          入力または内部処理の途中で問題が起きました。
          もう一度試すか、Research View で詳細を確認してください。
        </p>
        {researchMode && errorMessage ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-100 px-3 py-2 font-mono text-[11px] text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        もう一度試す
      </button>
    ) : null}
  </div>
)
