type TextInputStimulusCardProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (text: string) => void
  isSending: boolean
}

export const TextInputStimulusCard = ({
  value,
  onChange,
  onSubmit,
  isSending,
}: TextInputStimulusCardProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const trimmed = value.trim()
      if (trimmed && !isSending) onSubmit(trimmed)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-600">
          T
        </span>
        <span className="text-xs font-semibold text-slate-500">テキスト刺激</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="今考えていることを入力..."
        aria-label="テキスト入力"
        rows={3}
        disabled={isSending}
        className="min-h-[72px] w-full resize-none border-0 bg-transparent text-sm leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
        onKeyDown={handleKeyDown}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{value.length} 文字</span>
        <button
          type="button"
          onClick={() => {
            const trimmed = value.trim()
            if (trimmed && !isSending) onSubmit(trimmed)
          }}
          disabled={isSending || !value.trim()}
          className="rounded-full bg-rose-500 px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {isSending ? '処理中...' : '注入'}
        </button>
      </div>
    </div>
  )
}
