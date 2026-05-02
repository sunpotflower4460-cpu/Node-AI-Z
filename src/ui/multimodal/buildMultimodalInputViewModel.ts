import type { SensoryPacketSummary } from '../../signalSensory/buildSensoryPacketSummary'
import type { OrganismSummary } from '../../signalOrganism/buildOrganismSummary'

export type MultimodalInputViewModel = {
  activeTab: 'text' | 'image' | 'audio'
  lastPacketSummary: SensoryPacketSummary | null
  modalityBalance: {
    textRatio: number
    imageRatio: number
    audioRatio: number
    dominant: 'text' | 'image' | 'audio' | 'none'
  }
  totalInputCount: number
}

export function buildMultimodalInputViewModel(options: {
  activeTab: 'text' | 'image' | 'audio'
  lastPacketSummary: SensoryPacketSummary | null
  organismSummary: OrganismSummary | null
}): MultimodalInputViewModel {
  const { activeTab, lastPacketSummary, organismSummary } = options

  const balance = organismSummary?.modalityBalance ?? {
    textRatio: 0,
    imageRatio: 0,
    audioRatio: 0,
  }

  let dominant: 'text' | 'image' | 'audio' | 'none' = 'none'
  if (balance.textRatio > balance.imageRatio && balance.textRatio > balance.audioRatio) {
    dominant = 'text'
  } else if (balance.imageRatio > balance.textRatio && balance.imageRatio > balance.audioRatio) {
    dominant = 'image'
  } else if (balance.audioRatio > balance.textRatio && balance.audioRatio > balance.imageRatio) {
    dominant = 'audio'
  }

  return {
    activeTab,
    lastPacketSummary,
    modalityBalance: { ...balance, dominant },
    totalInputCount: organismSummary?.totalInputCount ?? 0,
  }
}
