// ABOUTME: Short Game screen for 2:1 tempo training.
// ABOUTME: Uses shared TempoScreen component with Short Game presets.

import { useSettingsStore } from '../../stores/settingsStore'
import { SHORT_GAME_PRESETS } from '../../constants/tempos'
import TempoScreen from '../../components/TempoScreen'

export default function ShortGameScreen() {
  const defaultPresetId = useSettingsStore((s) => s.defaultShortGamePresetId)

  return (
    <TempoScreen
      title="Short Game"
      subtitle="2:1 Tempo Training"
      presets={SHORT_GAME_PRESETS}
      defaultPresetId={defaultPresetId}
      gameMode="shortGame"
    />
  )
}
