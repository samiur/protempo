// ABOUTME: Unit tests for the session store.
// ABOUTME: Tests playback state, rep counting, and session reset functionality.

import { act } from '@testing-library/react-native'
import { useSessionStore } from '../../stores/sessionStore'
import {
  DEFAULT_LONG_GAME_PRESET_ID,
  DEFAULT_SHORT_GAME_PRESET_ID,
  DEFAULT_PLAYBACK_MODE,
} from '../../constants/defaults'

describe('sessionStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useSessionStore.getState().resetSession()
    })
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useSessionStore.getState()

      expect(state.gameMode).toBe('longGame')
      expect(state.currentPresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
      expect(state.isPlaying).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.repCount).toBe(0)
      expect(state.playbackMode).toBe(DEFAULT_PLAYBACK_MODE)
    })
  })

  describe('setGameMode', () => {
    it('should update game mode to shortGame', () => {
      act(() => {
        useSessionStore.getState().setGameMode('shortGame')
      })

      expect(useSessionStore.getState().gameMode).toBe('shortGame')
    })

    it('should update game mode to longGame', () => {
      act(() => {
        useSessionStore.getState().setGameMode('shortGame')
        useSessionStore.getState().setGameMode('longGame')
      })

      expect(useSessionStore.getState().gameMode).toBe('longGame')
    })

    it('should update preset ID when switching to short game', () => {
      act(() => {
        useSessionStore.getState().setGameMode('shortGame')
      })

      expect(useSessionStore.getState().currentPresetId).toBe(DEFAULT_SHORT_GAME_PRESET_ID)
    })

    it('should update preset ID when switching to long game', () => {
      act(() => {
        useSessionStore.getState().setGameMode('shortGame')
        useSessionStore.getState().setGameMode('longGame')
      })

      expect(useSessionStore.getState().currentPresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
    })
  })

  describe('setPreset', () => {
    it('should update the current preset ID', () => {
      act(() => {
        useSessionStore.getState().setPreset('21/7')
      })

      expect(useSessionStore.getState().currentPresetId).toBe('21/7')
    })

    it('should accept any preset ID', () => {
      const presetIds = ['18/6', '21/7', '24/8', '27/9', '30/10']

      presetIds.forEach((presetId) => {
        act(() => {
          useSessionStore.getState().setPreset(presetId)
        })
        expect(useSessionStore.getState().currentPresetId).toBe(presetId)
      })
    })
  })

  describe('setPlaying', () => {
    it('should set playing to true', () => {
      act(() => {
        useSessionStore.getState().setPlaying(true)
      })

      expect(useSessionStore.getState().isPlaying).toBe(true)
    })

    it('should set playing to false', () => {
      act(() => {
        useSessionStore.getState().setPlaying(true)
        useSessionStore.getState().setPlaying(false)
      })

      expect(useSessionStore.getState().isPlaying).toBe(false)
    })

    it('should clear paused state when starting playback', () => {
      act(() => {
        useSessionStore.getState().setPaused(true)
        useSessionStore.getState().setPlaying(true)
      })

      expect(useSessionStore.getState().isPlaying).toBe(true)
      expect(useSessionStore.getState().isPaused).toBe(false)
    })
  })

  describe('setPaused', () => {
    it('should set paused to true', () => {
      act(() => {
        useSessionStore.getState().setPlaying(true)
        useSessionStore.getState().setPaused(true)
      })

      expect(useSessionStore.getState().isPaused).toBe(true)
    })

    it('should set paused to false', () => {
      act(() => {
        useSessionStore.getState().setPlaying(true)
        useSessionStore.getState().setPaused(true)
        useSessionStore.getState().setPaused(false)
      })

      expect(useSessionStore.getState().isPaused).toBe(false)
    })
  })

  describe('incrementRepCount', () => {
    it('should increment rep count by 1', () => {
      expect(useSessionStore.getState().repCount).toBe(0)

      act(() => {
        useSessionStore.getState().incrementRepCount()
      })

      expect(useSessionStore.getState().repCount).toBe(1)
    })

    it('should increment multiple times correctly', () => {
      act(() => {
        useSessionStore.getState().incrementRepCount()
        useSessionStore.getState().incrementRepCount()
        useSessionStore.getState().incrementRepCount()
      })

      expect(useSessionStore.getState().repCount).toBe(3)
    })

    it('should handle large rep counts', () => {
      // Simulate 100 reps
      act(() => {
        for (let i = 0; i < 100; i++) {
          useSessionStore.getState().incrementRepCount()
        }
      })

      expect(useSessionStore.getState().repCount).toBe(100)
    })
  })

  describe('resetRepCount', () => {
    it('should reset rep count to 0', () => {
      act(() => {
        useSessionStore.getState().incrementRepCount()
        useSessionStore.getState().incrementRepCount()
        useSessionStore.getState().incrementRepCount()
      })

      expect(useSessionStore.getState().repCount).toBe(3)

      act(() => {
        useSessionStore.getState().resetRepCount()
      })

      expect(useSessionStore.getState().repCount).toBe(0)
    })

    it('should work when rep count is already 0', () => {
      expect(useSessionStore.getState().repCount).toBe(0)

      act(() => {
        useSessionStore.getState().resetRepCount()
      })

      expect(useSessionStore.getState().repCount).toBe(0)
    })
  })

  describe('setPlaybackMode', () => {
    it('should set playback mode to single', () => {
      act(() => {
        useSessionStore.getState().setPlaybackMode('single')
      })

      expect(useSessionStore.getState().playbackMode).toBe('single')
    })

    it('should set playback mode to continuous', () => {
      act(() => {
        useSessionStore.getState().setPlaybackMode('single')
        useSessionStore.getState().setPlaybackMode('continuous')
      })

      expect(useSessionStore.getState().playbackMode).toBe('continuous')
    })
  })

  describe('resetSession', () => {
    it('should reset all session state to defaults', () => {
      // Modify all state
      act(() => {
        useSessionStore.getState().setGameMode('shortGame')
        useSessionStore.getState().setPreset('16/8')
        useSessionStore.getState().setPlaying(true)
        useSessionStore.getState().setPaused(true)
        useSessionStore.getState().incrementRepCount()
        useSessionStore.getState().incrementRepCount()
        useSessionStore.getState().setPlaybackMode('single')
      })

      // Verify changes
      expect(useSessionStore.getState().gameMode).toBe('shortGame')
      expect(useSessionStore.getState().repCount).toBe(2)

      // Reset session
      act(() => {
        useSessionStore.getState().resetSession()
      })

      // Verify reset
      const state = useSessionStore.getState()
      expect(state.gameMode).toBe('longGame')
      expect(state.currentPresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
      expect(state.isPlaying).toBe(false)
      expect(state.isPaused).toBe(false)
      expect(state.repCount).toBe(0)
      expect(state.playbackMode).toBe(DEFAULT_PLAYBACK_MODE)
    })
  })
})
