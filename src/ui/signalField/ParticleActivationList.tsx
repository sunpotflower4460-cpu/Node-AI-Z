import type { ParticleViewModel } from './buildSignalFieldViewModel'

type ParticleActivationListProps = {
  particles: ParticleViewModel[]
  researchMode?: boolean
}

const SOURCE_LABEL: Record<string, string> = {
  external: '外部',
  internal: 'replay',
  teacher: 'teacher',
}

export const ParticleActivationList = ({ particles, researchMode = false }: ParticleActivationListProps) => {
  const activeParticles = particles
    .filter((p) => p.activation > 0.1)
    .sort((a, b) => b.activation - a.activation)
    .slice(0, 20)

  if (activeParticles.length === 0) {
    return (
      <p className="text-xs font-medium text-slate-400">
        現在発火中の粒子はありません。
      </p>
    )
  }

  return (
    <div className="space-y-1.5">
      {activeParticles.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
        >
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              background: p.source === 'external' ? '#e0f2fe' : p.source === 'internal' ? '#3b82f6' : p.source === 'teacher' ? '#a855f7' : '#374151',
            }}
          />
          <div className="flex flex-1 items-center justify-between gap-2">
            {researchMode ? (
              <span className="text-[11px] font-mono text-slate-600">{p.id}</span>
            ) : (
              <span className="text-xs font-medium text-slate-600">
                {SOURCE_LABEL[p.source ?? ''] ?? '未分類'}
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-16 rounded-full bg-slate-200">
                <div
                  className="h-1.5 rounded-full bg-indigo-500"
                  style={{ width: `${Math.round(p.activation * 100)}%` }}
                />
              </div>
              {researchMode && (
                <span className="text-[10px] font-bold text-slate-500">
                  {p.activation.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
