// ABOUTME: Storage layer for persisting app data using AsyncStorage.
// ABOUTME: Provides utilities for saving and loading settings with error handling.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { ToneStyle } from '../types/tempo'

export const STORAGE_KEYS = {
  settings: 'protempo:settings',
} as const

export interface PersistedSettings {
  defaultLongGamePresetId?: string
  defaultShortGamePresetId?: string
  toneStyle?: ToneStyle
  keepScreenAwake?: boolean
  volume?: number
  delayBetweenReps?: number
  hasCompletedOnboarding?: boolean
}

export const storage = {
  async saveSettings(settings: Partial<PersistedSettings>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  },

  async loadSettings(): Promise<Partial<PersistedSettings> | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.settings)
      if (!data) {
        return null
      }
      return JSON.parse(data) as Partial<PersistedSettings>
    } catch (error) {
      console.error('Failed to load settings:', error)
      return null
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.settings)
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  },
}
