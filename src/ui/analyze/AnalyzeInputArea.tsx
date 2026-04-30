import { Activity, RefreshCw, Search, Terminal } from 'lucide-react'
import { useState } from 'react'
import { AnalyzeEmptyInputHint } from './AnalyzeEmptyInputHint'

const SAMPLE_INPUTS = [
  '仕事に対する意欲が湧かなくて、転職するべきか悩んでいる',
  '最近ずっと、自分のことを信じきれない',
  'なんとなく引っかかるけど、まだ言葉にできない',
  'ただ分かってほしいだけなのかもしれない',
  '少しだけ希望はある気がする',
]

const MAX_SAMPLE_PREVIEW_LENGTH = 20

type AnalyzeInputAreaProps = {
  inputText: string
  isAnalyzing: boolean
  showEmptyHint?: boolean
  helperText?: string
  onInputChange: (text: string) => void
  onAnalyze: () => void
  onSampleClick: (text: string) => void
}

export const AnalyzeInputArea = ({
  inputText,
  isAnalyzing,
  showEmptyHint = false,
  helperText,
  onInputChange,
  onAnalyze,
  onSampleClick,
}: AnalyzeInputAreaProps) => {
  const [isSamplesOpen, setIsSamplesOpen] = useState(false)
  const canAnalyze = !isAnalyzing && inputText.trim().length > 0

  return (
    <div className="flex flex-col gap-3">
      {helperText ? (
        <p className="text-xs leading-relaxed text-slate-500">{helperText}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            value={inputText}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="観察したい文章を入力（例：仕事への意欲が湧かなくて悩んでいる）"
            aria-label="観察対象のテキスト"
            inputMode="text"
            enterKeyHint="search"
            disabled={isAnalyzing}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base font-medium text-slate-800 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60 md:py-3.5 md:text-[15px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onAnalyze()
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          aria-label={isAnalyzing ? '分析中' : '分析する'}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 sm:w-auto"
        >
          {isAnalyzing ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Activity className="h-4 w-4" aria-hidden="true" />}
          Analyze
        </button>
      </div>
      {showEmptyHint ? <AnalyzeEmptyInputHint /> : null}
      <div>
        <button
          type="button"
          onClick={() => setIsSamplesOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400"
        >
          <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          サンプル
          <span className="text-[9px]" aria-hidden="true">{isSamplesOpen ? '▲' : '▼'}</span>
        </button>
        {isSamplesOpen ? (
          <div className="scrollbar-hide mt-2 -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {SAMPLE_INPUTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => onSampleClick(sample)}
                className="shrink-0 rounded-lg border border-slate-200/60 bg-slate-100 px-3.5 py-2.5 text-left text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-200 active:scale-[0.98]"
              >
                {sample.length > MAX_SAMPLE_PREVIEW_LENGTH
                  ? `${sample.substring(0, MAX_SAMPLE_PREVIEW_LENGTH)}...`
                  : sample}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
