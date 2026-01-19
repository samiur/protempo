// ABOUTME: Long Game screen for 3:1 tempo training.
// ABOUTME: Uses shared TempoScreen component with Long Game presets.

import { useSettingsStore } from '../../stores/settingsStore'
import { LONG_GAME_PRESETS } from '../../constants/tempos'
import TempoScreen from '../../components/TempoScreen'

export default function LongGameScreen() {
  const defaultPresetId = useSettingsStore((s) => s.defaultLongGamePresetId)

  return (
    <TempoScreen
      title="Long Game"
      subtitle="3:1 Tempo Training"
      presets={LONG_GAME_PRESETS}
      defaultPresetId={defaultPresetId}
      gameMode="longGame"
    />
  )
}
