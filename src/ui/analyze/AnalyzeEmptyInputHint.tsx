import { Lightbulb } from 'lucide-react'

export const AnalyzeEmptyInputHint = () => (
  <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
    <p className="text-xs leading-relaxed text-slate-500">
      まず短い文章を入力してください。
      一文だけでも内部パイプラインを観察できます。
    </p>
  </div>
)
