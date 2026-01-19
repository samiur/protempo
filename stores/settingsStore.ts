// ABOUTME: Zustand store for persistent user settings.
// ABOUTME: Manages preferences like default presets, tone style, volume, and onboarding state.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
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
  _hasHydrated: boolean

  setDefaultLongGamePreset: (presetId: string) => void
  setDefaultShortGamePreset: (presetId: string) => void
  setToneStyle: (style: ToneStyle) => void
  setKeepScreenAwake: (awake: boolean) => void
  setVolume: (volume: number) => void
  setDelayBetweenReps: (delay: number) => void
  completeOnboarding: () => void
  resetToDefaults: () => void
  setHasHydrated: (hydrated: boolean) => void
}

const initialState = {
  defaultLongGamePresetId: DEFAULT_LONG_GAME_PRESET_ID,
  defaultShortGamePresetId: DEFAULT_SHORT_GAME_PRESET_ID,
  toneStyle: DEFAULT_TONE_STYLE,
  keepScreenAwake: true,
  volume: DEFAULT_VOLUME,
  delayBetweenReps: DEFAULT_DELAY_BETWEEN_REPS,
  hasCompletedOnboarding: false,
  _hasHydrated: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setDefaultLongGamePreset: (presetId) => set({ defaultLongGamePresetId: presetId }),
      setDefaultShortGamePreset: (presetId) => set({ defaultShortGamePresetId: presetId }),
      setToneStyle: (style) => set({ toneStyle: style }),
      setKeepScreenAwake: (awake) => set({ keepScreenAwake: awake }),
      setVolume: (volume) => set({ volume }),
      setDelayBetweenReps: (delay) => set({ delayBetweenReps: delay }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      resetToDefaults: () =>
        set({
          defaultLongGamePresetId: initialState.defaultLongGamePresetId,
          defaultShortGamePresetId: initialState.defaultShortGamePresetId,
          toneStyle: initialState.toneStyle,
          keepScreenAwake: initialState.keepScreenAwake,
          volume: initialState.volume,
          delayBetweenReps: initialState.delayBetweenReps,
          hasCompletedOnboarding: initialState.hasCompletedOnboarding,
        }),
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'protempo:settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        defaultLongGamePresetId: state.defaultLongGamePresetId,
        defaultShortGamePresetId: state.defaultShortGamePresetId,
        toneStyle: state.toneStyle,
        keepScreenAwake: state.keepScreenAwake,
        volume: state.volume,
        delayBetweenReps: state.delayBetweenReps,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    }
  )
)
