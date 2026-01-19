// ABOUTME: Integration tests for settings store persistence.
// ABOUTME: Tests that settings are saved to and loaded from AsyncStorage correctly.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { act } from '@testing-library/react-native'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  DEFAULT_LONG_GAME_PRESET_ID,
  DEFAULT_SHORT_GAME_PRESET_ID,
  DEFAULT_TONE_STYLE,
  DEFAULT_VOLUME,
  DEFAULT_DELAY_BETWEEN_REPS,
} from '../../constants/defaults'

const STORAGE_KEY = 'protempo:settings'

function waitForPersist(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 50))
}

async function getPersistedState(): Promise<Record<string, unknown>> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY)
  return JSON.parse(stored!).state
}

describe('settingsStore persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear()
    // Reset store to initial state
    act(() => {
      useSettingsStore.getState().resetToDefaults()
      useSettingsStore.getState().setHasHydrated(false)
    })
  })

  afterEach(async () => {
    await AsyncStorage.clear()
  })

  describe('hydration state', () => {
    it('should have _hasHydrated flag in state', () => {
      const state = useSettingsStore.getState()
      expect(state).toHaveProperty('_hasHydrated')
    })

    it('should have setHasHydrated action', () => {
      const state = useSettingsStore.getState()
      expect(typeof state.setHasHydrated).toBe('function')
    })

    it('should update _hasHydrated when setHasHydrated is called', () => {
      act(() => {
        useSettingsStore.getState().setHasHydrated(true)
      })

      expect(useSettingsStore.getState()._hasHydrated).toBe(true)

      act(() => {
        useSettingsStore.getState().setHasHydrated(false)
      })

      expect(useSettingsStore.getState()._hasHydrated).toBe(false)
    })
  })

  describe('persist middleware', () => {
    it('should save settings to AsyncStorage when changed', async () => {
      act(() => {
        useSettingsStore.getState().setToneStyle('voice')
      })

      await waitForPersist()

      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const persisted = await getPersistedState()
      expect(persisted.toneStyle).toBe('voice')
    })

    it('should save defaultLongGamePresetId to storage', async () => {
      act(() => {
        useSettingsStore.getState().setDefaultLongGamePreset('21/7')
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted.defaultLongGamePresetId).toBe('21/7')
    })

    it('should save defaultShortGamePresetId to storage', async () => {
      act(() => {
        useSettingsStore.getState().setDefaultShortGamePreset('16/8')
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted.defaultShortGamePresetId).toBe('16/8')
    })

    it('should save keepScreenAwake to storage', async () => {
      act(() => {
        useSettingsStore.getState().setKeepScreenAwake(false)
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted.keepScreenAwake).toBe(false)
    })

    it('should save volume to storage', async () => {
      act(() => {
        useSettingsStore.getState().setVolume(0.5)
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted.volume).toBe(0.5)
    })

    it('should save delayBetweenReps to storage', async () => {
      act(() => {
        useSettingsStore.getState().setDelayBetweenReps(6)
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted.delayBetweenReps).toBe(6)
    })

    it('should save hasCompletedOnboarding to storage', async () => {
      act(() => {
        useSettingsStore.getState().completeOnboarding()
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted.hasCompletedOnboarding).toBe(true)
    })

    it('should NOT save _hasHydrated to storage (excluded via partialize)', async () => {
      act(() => {
        useSettingsStore.getState().setHasHydrated(true)
        useSettingsStore.getState().setToneStyle('voice') // Trigger persist
      })

      await waitForPersist()

      const persisted = await getPersistedState()
      expect(persisted._hasHydrated).toBeUndefined()
    })
  })

  describe('rehydration', () => {
    it('should have persist.rehydrate method available', () => {
      expect(typeof useSettingsStore.persist.rehydrate).toBe('function')
    })

    it('should have persist.clearStorage method available', () => {
      expect(typeof useSettingsStore.persist.clearStorage).toBe('function')
    })

    it('should have persist.hasHydrated method available', () => {
      expect(typeof useSettingsStore.persist.hasHydrated).toBe('function')
    })

    it('should use correct persist configuration name', () => {
      const options = useSettingsStore.persist.getOptions()
      expect(options.name).toBe(STORAGE_KEY)
    })

    it('should keep default values when storage is empty after rehydrate', async () => {
      await AsyncStorage.clear()

      act(() => {
        useSettingsStore.getState().resetToDefaults()
      })

      await useSettingsStore.persist.rehydrate()

      const state = useSettingsStore.getState()
      expect(state.defaultLongGamePresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
      expect(state.defaultShortGamePresetId).toBe(DEFAULT_SHORT_GAME_PRESET_ID)
      expect(state.toneStyle).toBe(DEFAULT_TONE_STYLE)
      expect(state.keepScreenAwake).toBe(true)
      expect(state.volume).toBe(DEFAULT_VOLUME)
      expect(state.delayBetweenReps).toBe(DEFAULT_DELAY_BETWEEN_REPS)
      expect(state.hasCompletedOnboarding).toBe(false)
    })

    it('should clear storage when clearStorage is called', async () => {
      act(() => {
        useSettingsStore.getState().setVolume(0.5)
      })

      await waitForPersist()

      let stored = await AsyncStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      useSettingsStore.persist.clearStorage()

      stored = await AsyncStorage.getItem(STORAGE_KEY)
      expect(stored).toBeNull()
    })
  })

  describe('reset to defaults', () => {
    it('should reset to defaults and persist the reset state', async () => {
      act(() => {
        useSettingsStore.getState().setToneStyle('voice')
        useSettingsStore.getState().setVolume(0.3)
        useSettingsStore.getState().completeOnboarding()
      })

      expect(useSettingsStore.getState().toneStyle).toBe('voice')
      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true)

      act(() => {
        useSettingsStore.getState().resetToDefaults()
      })

      await waitForPersist()

      const state = useSettingsStore.getState()
      expect(state.toneStyle).toBe('beep')
      expect(state.volume).toBe(1.0)
      expect(state.hasCompletedOnboarding).toBe(false)

      const persisted = await getPersistedState()
      expect(persisted.toneStyle).toBe('beep')
      expect(persisted.volume).toBe(1.0)
    })
  })

  describe('storage key', () => {
    it('should use the correct storage key', async () => {
      act(() => {
        useSettingsStore.getState().setVolume(0.8)
      })

      await waitForPersist()

      const stored = await AsyncStorage.getItem(STORAGE_KEY)
      expect(stored).not.toBeNull()

      const wrongKey = await AsyncStorage.getItem('wrong-key')
      expect(wrongKey).toBeNull()
    })
  })
})
