type EmptyGrowthIllustrationProps = {
  message?: string
  hint?: string
}

export const EmptyGrowthIllustration = ({
  message = 'まだ十分な assembly は育っていません。',
  hint = '同じ刺激を数回与えると、反復する発火群が見え始めます。',
}: EmptyGrowthIllustrationProps) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-12 text-center">
    <div className="flex gap-2 opacity-40">
      {[0.3, 0.6, 0.9, 0.6, 0.3].map((opacity, i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-cyan-400"
          style={{ opacity }}
        />
      ))}
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-300">{message}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{hint}</p>
    </div>
  </div>
)
