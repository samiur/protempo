// ABOUTME: Zustand store for persistent user settings.
// ABOUTME: Manages preferences like default presets, tone style, volume, and onboarding state.

import { create } from 'zustand'
import { ToneStyle } from '../types/tempo'
import {
  DEFAULT_LONG_GAME_PRESET_ID,
  DEFAULT_SHORT_GAME_PRESET_ID,
  DEFAULT_TONE_STYLE,
  DEFAULT_VOLUME,
  DEFAULT_DELAY_BETWEEN_REPS,
} from '../constants/defaults'

interface SettingsState {
  defaultLongGamePresetId: string
  defaultShortGamePresetId: string
  toneStyle: ToneStyle
  keepScreenAwake: boolean
  volume: number
  delayBetweenReps: number
  hasCompletedOnboarding: boolean

  setDefaultLongGamePreset: (presetId: string) => void
  setDefaultShortGamePreset: (presetId: string) => void
  setToneStyle: (style: ToneStyle) => void
  setKeepScreenAwake: (awake: boolean) => void
  setVolume: (volume: number) => void
  setDelayBetweenReps: (delay: number) => void
  completeOnboarding: () => void
  resetToDefaults: () => void
}

const initialState = {
  defaultLongGamePresetId: DEFAULT_LONG_GAME_PRESET_ID,
  defaultShortGamePresetId: DEFAULT_SHORT_GAME_PRESET_ID,
  toneStyle: DEFAULT_TONE_STYLE,
  keepScreenAwake: true,
  volume: DEFAULT_VOLUME,
  delayBetweenReps: DEFAULT_DELAY_BETWEEN_REPS,
  hasCompletedOnboarding: false,
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  ...initialState,

  setDefaultLongGamePreset: (presetId) => set({ defaultLongGamePresetId: presetId }),
  setDefaultShortGamePreset: (presetId) => set({ defaultShortGamePresetId: presetId }),
  setToneStyle: (style) => set({ toneStyle: style }),
  setKeepScreenAwake: (awake) => set({ keepScreenAwake: awake }),
  setVolume: (volume) => set({ volume }),
  setDelayBetweenReps: (delay) => set({ delayBetweenReps: delay }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  resetToDefaults: () => set(initialState),
}))
