// ABOUTME: Unit tests for the settings store.
// ABOUTME: Tests state initialization, actions, and reset functionality.

import { act } from '@testing-library/react-native'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  DEFAULT_LONG_GAME_PRESET_ID,
  DEFAULT_SHORT_GAME_PRESET_ID,
  DEFAULT_TONE_STYLE,
  DEFAULT_VOLUME,
  DEFAULT_DELAY_BETWEEN_REPS,
} from '../../constants/defaults'

describe('settingsStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useSettingsStore.getState().resetToDefaults()
    })
  })

  describe('initial state', () => {
    it('should have correct default values', () => {
      const state = useSettingsStore.getState()

      expect(state.defaultLongGamePresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
      expect(state.defaultShortGamePresetId).toBe(DEFAULT_SHORT_GAME_PRESET_ID)
      expect(state.toneStyle).toBe(DEFAULT_TONE_STYLE)
      expect(state.keepScreenAwake).toBe(true)
      expect(state.volume).toBe(DEFAULT_VOLUME)
      expect(state.delayBetweenReps).toBe(DEFAULT_DELAY_BETWEEN_REPS)
      expect(state.hasCompletedOnboarding).toBe(false)
    })
  })

  describe('setDefaultLongGamePreset', () => {
    it('should update the default long game preset', () => {
      act(() => {
        useSettingsStore.getState().setDefaultLongGamePreset('21/7')
      })

      expect(useSettingsStore.getState().defaultLongGamePresetId).toBe('21/7')
    })

    it('should accept any valid preset ID', () => {
      const presetIds = ['18/6', '21/7', '24/8', '27/9', '30/10']

      presetIds.forEach((presetId) => {
        act(() => {
          useSettingsStore.getState().setDefaultLongGamePreset(presetId)
        })
        expect(useSettingsStore.getState().defaultLongGamePresetId).toBe(presetId)
      })
    })
  })

  describe('setDefaultShortGamePreset', () => {
    it('should update the default short game preset', () => {
      act(() => {
        useSettingsStore.getState().setDefaultShortGamePreset('16/8')
      })

      expect(useSettingsStore.getState().defaultShortGamePresetId).toBe('16/8')
    })

    it('should accept any valid preset ID', () => {
      const presetIds = ['14/7', '16/8', '18/9', '20/10', '22/11']

      presetIds.forEach((presetId) => {
        act(() => {
          useSettingsStore.getState().setDefaultShortGamePreset(presetId)
        })
        expect(useSettingsStore.getState().defaultShortGamePresetId).toBe(presetId)
      })
    })
  })

  describe('setToneStyle', () => {
    it('should update tone style to voice', () => {
      act(() => {
        useSettingsStore.getState().setToneStyle('voice')
      })

      expect(useSettingsStore.getState().toneStyle).toBe('voice')
    })

    it('should update tone style to beep', () => {
      act(() => {
        useSettingsStore.getState().setToneStyle('voice')
        useSettingsStore.getState().setToneStyle('beep')
      })

      expect(useSettingsStore.getState().toneStyle).toBe('beep')
    })
  })

  describe('setKeepScreenAwake', () => {
    it('should update keep screen awake to false', () => {
      act(() => {
        useSettingsStore.getState().setKeepScreenAwake(false)
      })

      expect(useSettingsStore.getState().keepScreenAwake).toBe(false)
    })

    it('should update keep screen awake to true', () => {
      act(() => {
        useSettingsStore.getState().setKeepScreenAwake(false)
        useSettingsStore.getState().setKeepScreenAwake(true)
      })

      expect(useSettingsStore.getState().keepScreenAwake).toBe(true)
    })
  })

  describe('setVolume', () => {
    it('should update volume to a value between 0 and 1', () => {
      act(() => {
        useSettingsStore.getState().setVolume(0.5)
      })

      expect(useSettingsStore.getState().volume).toBe(0.5)
    })

    it('should set volume to 0', () => {
      act(() => {
        useSettingsStore.getState().setVolume(0)
      })

      expect(useSettingsStore.getState().volume).toBe(0)
    })

    it('should set volume to 1', () => {
      act(() => {
        useSettingsStore.getState().setVolume(0.5)
        useSettingsStore.getState().setVolume(1)
      })

      expect(useSettingsStore.getState().volume).toBe(1)
    })
  })

  describe('setDelayBetweenReps', () => {
    it('should update delay between reps', () => {
      act(() => {
        useSettingsStore.getState().setDelayBetweenReps(6)
      })

      expect(useSettingsStore.getState().delayBetweenReps).toBe(6)
    })

    it('should accept delay at minimum boundary (2 seconds)', () => {
      act(() => {
        useSettingsStore.getState().setDelayBetweenReps(2)
      })

      expect(useSettingsStore.getState().delayBetweenReps).toBe(2)
    })

    it('should accept delay at maximum boundary (10 seconds)', () => {
      act(() => {
        useSettingsStore.getState().setDelayBetweenReps(10)
      })

      expect(useSettingsStore.getState().delayBetweenReps).toBe(10)
    })
  })

  describe('completeOnboarding', () => {
    it('should mark onboarding as completed', () => {
      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(false)

      act(() => {
        useSettingsStore.getState().completeOnboarding()
      })

      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true)
    })
  })

  describe('resetToDefaults', () => {
    it('should reset all settings to default values', () => {
      // Change all settings
      act(() => {
        useSettingsStore.getState().setDefaultLongGamePreset('21/7')
        useSettingsStore.getState().setDefaultShortGamePreset('16/8')
        useSettingsStore.getState().setToneStyle('voice')
        useSettingsStore.getState().setKeepScreenAwake(false)
        useSettingsStore.getState().setVolume(0.5)
        useSettingsStore.getState().setDelayBetweenReps(8)
        useSettingsStore.getState().completeOnboarding()
      })

      // Verify changes
      expect(useSettingsStore.getState().defaultLongGamePresetId).toBe('21/7')
      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true)

      // Reset to defaults
      act(() => {
        useSettingsStore.getState().resetToDefaults()
      })

      // Verify reset
      const state = useSettingsStore.getState()
      expect(state.defaultLongGamePresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
      expect(state.defaultShortGamePresetId).toBe(DEFAULT_SHORT_GAME_PRESET_ID)
      expect(state.toneStyle).toBe(DEFAULT_TONE_STYLE)
      expect(state.keepScreenAwake).toBe(true)
      expect(state.volume).toBe(DEFAULT_VOLUME)
      expect(state.delayBetweenReps).toBe(DEFAULT_DELAY_BETWEEN_REPS)
      expect(state.hasCompletedOnboarding).toBe(false)
    })
  })
})
