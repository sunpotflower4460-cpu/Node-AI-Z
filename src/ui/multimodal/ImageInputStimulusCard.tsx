import { useRef } from 'react'

type ImageInputStimulusCardProps = {
  onSubmit: (source: HTMLImageElement) => void
  isSending: boolean
}

export const ImageInputStimulusCard = ({
  onSubmit,
  isSending,
}: ImageInputStimulusCardProps) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      onSubmit(img)
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-600">
          I
        </span>
        <span className="text-xs font-semibold text-slate-500">画像刺激</span>
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isSending}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 px-4 py-6 text-sm text-slate-400 transition hover:border-sky-300 hover:text-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-2xl">🖼️</span>
        <span>画像ファイルを選択</span>
        <span className="text-[11px]">jpg / png / gif / webp</span>
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="mt-2 text-[11px] text-slate-400">
        色・明暗・形の低次元特徴を抽出します（意味ラベルなし）
      </p>
    </div>
  )
}
