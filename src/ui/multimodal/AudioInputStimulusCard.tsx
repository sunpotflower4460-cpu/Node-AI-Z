import { useRef, useState } from 'react'

type AudioInputStimulusCardProps = {
  onSubmit: (buffer: AudioBuffer | null, description?: string) => void
  isSending: boolean
}

export const AudioInputStimulusCard = ({
  onSubmit,
  isSending,
}: AudioInputStimulusCardProps) => {
  const fileRef = useRef<HTMLInputElement>(null)
  const [mockDesc, setMockDesc] = useState('')
  const [loadingAudio, setLoadingAudio] = useState(false)

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setLoadingAudio(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const audioCtx = new AudioContext()
      const decoded = await audioCtx.decodeAudioData(arrayBuffer)
      onSubmit(decoded, file.name)
    } catch {
      // If decode fails, fall back to mock
      onSubmit(null, file.name)
    } finally {
      setLoadingAudio(false)
    }
  }

  const handleMockSubmit = () => {
    onSubmit(null, mockDesc || 'mock audio')
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-600">
          A
        </span>
        <span className="text-xs font-semibold text-slate-500">音声刺激</span>
      </div>

      {/* Real audio file */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isSending || loadingAudio}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-4 text-sm text-slate-400 transition hover:border-violet-300 hover:text-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-2xl">🎵</span>
        <span>{loadingAudio ? '読込中...' : '音声ファイルを選択'}</span>
        <span className="text-[11px]">mp3 / wav / ogg</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      {/* Mock fallback */}
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
        <p className="mb-1.5 text-[11px] font-semibold text-slate-500">モック音声 (説明文から特徴生成)</p>
        <input
          type="text"
          value={mockDesc}
          onChange={(e) => setMockDesc(e.target.value)}
          placeholder="例: soft rain, energetic beat..."
          disabled={isSending}
          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none placeholder:text-slate-300"
        />
        <button
          type="button"
          onClick={handleMockSubmit}
          disabled={isSending}
          className="mt-2 w-full rounded-full bg-violet-500 py-1.5 text-xs font-bold text-white disabled:opacity-50"
        >
          {isSending ? '処理中...' : 'モック注入'}
        </button>
      </div>

      <p className="text-[11px] text-slate-400">
        波形・振幅・リズムの低次元特徴を抽出します（意味ラベルなし）
      </p>
    </div>
  )
}
