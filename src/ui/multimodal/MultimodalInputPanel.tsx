import { useState } from 'react'
import type { OrganismSummary } from '../../signalOrganism/buildOrganismSummary'
import type { SensoryPacket } from '../../signalSensory/sensoryPacketTypes'
import { createTextSensoryPacket } from '../../signalSensory/createTextSensoryPacket'
import { createImageSensoryPacket } from '../../signalSensory/createImageSensoryPacket'
import { createAudioSensoryPacket } from '../../signalSensory/createAudioSensoryPacket'
import { buildSensoryPacketSummary } from '../../signalSensory/buildSensoryPacketSummary'
import { buildMultimodalInputViewModel } from './buildMultimodalInputViewModel'
import { TextInputStimulusCard } from './TextInputStimulusCard'
import { ImageInputStimulusCard } from './ImageInputStimulusCard'
import { AudioInputStimulusCard } from './AudioInputStimulusCard'
import { SensoryPacketPreview } from './SensoryPacketPreview'
import { ModalityRatioCard } from './ModalityRatioCard'

type MultimodalInputPanelProps = {
  /** Called when a sensory packet is ready for injection into the runtime */
  onPacketReady: (packet: SensoryPacket) => void | Promise<void>
  /** Current organism summary for modality ratio display */
  organismSummary?: OrganismSummary | null
  isSending?: boolean
}

type ActiveTab = 'text' | 'image' | 'audio'

const TABS: { key: ActiveTab; label: string; color: string }[] = [
  { key: 'text', label: 'テキスト', color: 'text-rose-600' },
  { key: 'image', label: '画像', color: 'text-sky-600' },
  { key: 'audio', label: '音声', color: 'text-violet-600' },
]

export const MultimodalInputPanel = ({
  onPacketReady,
  organismSummary = null,
  isSending = false,
}: MultimodalInputPanelProps) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('text')
  const [textValue, setTextValue] = useState('')
  const [lastPacket, setLastPacket] = useState<SensoryPacket | null>(null)

  const viewModel = buildMultimodalInputViewModel({
    activeTab,
    lastPacketSummary: lastPacket ? buildSensoryPacketSummary(lastPacket) : null,
    organismSummary,
  })

  const handleTextSubmit = (text: string) => {
    const packet = createTextSensoryPacket(text)
    setLastPacket(packet)
    setTextValue('')
    void Promise.resolve(onPacketReady(packet))
  }

  const handleImageSubmit = (source: HTMLImageElement) => {
    const packet = createImageSensoryPacket(source)
    setLastPacket(packet)
    void Promise.resolve(onPacketReady(packet))
  }

  const handleAudioSubmit = (buffer: AudioBuffer | null, description?: string) => {
    const packet = createAudioSensoryPacket(buffer, { description })
    setLastPacket(packet)
    void Promise.resolve(onPacketReady(packet))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Tab selector */}
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map(({ key, label, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
              activeTab === key
                ? `bg-white shadow-sm ${color}`
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Active input card */}
      {activeTab === 'text' && (
        <TextInputStimulusCard
          value={textValue}
          onChange={setTextValue}
          onSubmit={handleTextSubmit}
          isSending={isSending}
        />
      )}
      {activeTab === 'image' && (
        <ImageInputStimulusCard
          onSubmit={handleImageSubmit}
          isSending={isSending}
        />
      )}
      {activeTab === 'audio' && (
        <AudioInputStimulusCard
          onSubmit={handleAudioSubmit}
          isSending={isSending}
        />
      )}

      {/* Last packet preview */}
      {viewModel.lastPacketSummary && (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold text-slate-400">最後の感覚パケット</p>
          <SensoryPacketPreview summary={viewModel.lastPacketSummary} />
        </div>
      )}

      {/* Modality ratio */}
      <ModalityRatioCard
        textRatio={viewModel.modalityBalance.textRatio}
        imageRatio={viewModel.modalityBalance.imageRatio}
        audioRatio={viewModel.modalityBalance.audioRatio}
        dominant={viewModel.modalityBalance.dominant}
        totalInputCount={viewModel.totalInputCount}
      />
    </div>
  )
}
