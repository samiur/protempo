// ABOUTME: Zustand store for transient session state during playback.
// ABOUTME: Manages playback status, rep count, and current preset selection.

import { create } from 'zustand'
import { GameMode, PlaybackMode } from '../types/tempo'
import {
  DEFAULT_LONG_GAME_PRESET_ID,
  DEFAULT_SHORT_GAME_PRESET_ID,
  DEFAULT_PLAYBACK_MODE,
} from '../constants/defaults'

interface SessionState {
  gameMode: GameMode
  currentPresetId: string
  isPlaying: boolean
  isPaused: boolean
  repCount: number
  playbackMode: PlaybackMode

  setGameMode: (mode: GameMode) => void
  setPreset: (presetId: string) => void
  setPlaying: (playing: boolean) => void
  setPaused: (paused: boolean) => void
  incrementRepCount: () => void
  resetRepCount: () => void
  setPlaybackMode: (mode: PlaybackMode) => void
  resetSession: () => void
}

const initialState = {
  gameMode: 'longGame' as GameMode,
  currentPresetId: DEFAULT_LONG_GAME_PRESET_ID,
  isPlaying: false,
  isPaused: false,
  repCount: 0,
  playbackMode: DEFAULT_PLAYBACK_MODE,
}

export const useSessionStore = create<SessionState>()((set) => ({
  ...initialState,

  setGameMode: (mode) => {
    const presetId =
      mode === 'longGame' ? DEFAULT_LONG_GAME_PRESET_ID : DEFAULT_SHORT_GAME_PRESET_ID
    set({ gameMode: mode, currentPresetId: presetId })
  },
  setPreset: (presetId) => set({ currentPresetId: presetId }),
  setPlaying: (playing) =>
    set((state) => ({
      isPlaying: playing,
      isPaused: playing ? false : state.isPaused,
    })),
  setPaused: (paused) => set({ isPaused: paused }),
  incrementRepCount: () => set((state) => ({ repCount: state.repCount + 1 })),
  resetRepCount: () => set({ repCount: 0 }),
  setPlaybackMode: (mode) => set({ playbackMode: mode }),
  resetSession: () => set(initialState),
}))
