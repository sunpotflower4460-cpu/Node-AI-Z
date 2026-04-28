import { useState } from 'react'
import type { ParticleViewModel, AssemblyViewModel, BridgeViewModel } from './buildSignalFieldViewModel'

type SignalFieldCanvasProps = {
  particles: ParticleViewModel[]
  assemblies: AssemblyViewModel[]
  bridges: BridgeViewModel[]
}

type CanvasToggles = {
  showParticles: boolean
  showAssemblies: boolean
  showBridges: boolean
  showTeacherBridges: boolean
  showReplay: boolean
}

const PARTICLE_COLOR: Record<string, string> = {
  external: '#e0f2fe', // white/cyan
  internal: '#3b82f6', // blue
  teacher: '#a855f7', // purple
  default: '#374151', // dark gray
}

const BRIDGE_COLOR: Record<string, string> = {
  teacher_light: '#a855f7',
  teacher_free: '#22c55e',
  promoted: '#4ade80',
  reinforced: '#818cf8',
  tentative: '#94a3b8',
}

export const SignalFieldCanvas = ({ particles, assemblies, bridges }: SignalFieldCanvasProps) => {
  const [toggles, setToggles] = useState<CanvasToggles>({
    showParticles: true,
    showAssemblies: true,
    showBridges: true,
    showTeacherBridges: true,
    showReplay: true,
  })

  const toggle = (key: keyof CanvasToggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const activeParticles = particles.filter((p) => p.activation > 0.1)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2 text-[11px]">
        {(Object.entries(toggles) as [keyof CanvasToggles, boolean][]).map(([key, value]) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`rounded-full border px-3 py-1 font-semibold transition-colors ${
              value
                ? 'border-indigo-400 bg-indigo-100 text-indigo-700'
                : 'border-slate-200 bg-slate-100 text-slate-500'
            }`}
          >
            {key.replace(/([A-Z])/g, ' $1').replace('show ', '')}
          </button>
        ))}
      </div>

      <div
        className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
        aria-label="Signal field canvas"
      >
        {/* Bridges layer */}
        {toggles.showBridges && (
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            {bridges.map((bridge) => {
              if (!toggles.showTeacherBridges && bridge.stage !== 'teacher_free' && bridge.stage !== 'promoted') {
                return null
              }
              const color = BRIDGE_COLOR[bridge.stage] ?? '#94a3b8'
              // Draw bridge as horizontal line placeholder
              const xPct = bridge.teacherDependencyScore * 80 + 10
              const yPct = bridge.recallSuccessScore * 80 + 10
              return (
                <line
                  key={bridge.id}
                  x1={`${xPct}%`}
                  y1="20%"
                  x2={`${Math.min(xPct + 15, 95)}%`}
                  y2={`${yPct}%`}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeOpacity="0.7"
                />
              )
            })}
          </svg>
        )}

        {/* Assembly outlines */}
        {toggles.showAssemblies &&
          assemblies.slice(0, 8).map((assembly, index) => {
            const cx = 15 + (index % 4) * 22
            const cy = 20 + Math.floor(index / 4) * 40
            return (
              <div
                key={assembly.id}
                className="absolute rounded-full border border-indigo-500/40 bg-indigo-500/10"
                style={{
                  left: `${cx}%`,
                  top: `${cy}%`,
                  width: `${Math.max(assembly.stabilityScore * 15 + 5, 8)}%`,
                  height: `${Math.max(assembly.stabilityScore * 15 + 5, 8)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                title={`Assembly: ${assembly.id}`}
              />
            )
          })}

        {/* Particles */}
        {toggles.showParticles &&
          activeParticles.slice(0, 120).map((p) => {
            const color = PARTICLE_COLOR[p.source ?? 'default'] ?? PARTICLE_COLOR.default
            const size = 3 + p.activation * 5
            const opacity = 0.3 + p.activation * 0.7
            return (
              <div
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.x * 100}%`,
                  top: `${p.y * 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  background: color,
                  opacity,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )
          })}

        {/* Replay indicator */}
        {toggles.showReplay && (
          <div className="absolute bottom-2 right-3 rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
            replay
          </div>
        )}

        {activeParticles.length === 0 && (
          <div className="flex h-full items-center justify-center text-xs font-medium text-slate-500">
            まだ発火している粒子がありません
          </div>
        )}
      </div>
    </div>
  )
}
