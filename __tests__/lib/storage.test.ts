// ABOUTME: Unit tests for the storage layer.
// ABOUTME: Tests AsyncStorage save/load operations and error handling.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { storage, STORAGE_KEYS } from '../../lib/storage'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

describe('storage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('STORAGE_KEYS', () => {
    it('should have a settings key', () => {
      expect(STORAGE_KEYS.settings).toBe('protempo:settings')
    })
  })

  describe('saveSettings', () => {
    it('should save settings to AsyncStorage', async () => {
      const settings = {
        defaultLongGamePresetId: '21/7',
        toneStyle: 'voice' as const,
        volume: 0.8,
      }

      mockedAsyncStorage.setItem.mockResolvedValue(undefined)

      await storage.saveSettings(settings)

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.settings,
        JSON.stringify(settings)
      )
    })

    it('should handle save errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'))

      await expect(storage.saveSettings({ volume: 0.5 })).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('loadSettings', () => {
    it('should load settings from AsyncStorage', async () => {
      const savedSettings = {
        defaultLongGamePresetId: '21/7',
        toneStyle: 'voice',
        volume: 0.8,
      }

      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(savedSettings))

      const result = await storage.loadSettings()

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.settings)
      expect(result).toEqual(savedSettings)
    })

    it('should return null when no settings are saved', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const result = await storage.loadSettings()

      expect(result).toBeNull()
    })

    it('should handle invalid JSON gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockResolvedValue('invalid json {{{')

      const result = await storage.loadSettings()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle load errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const result = await storage.loadSettings()

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('clearAll', () => {
    it('should remove settings from AsyncStorage', async () => {
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined)

      await storage.clearAll()

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.settings)
    })

    it('should handle clear errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.removeItem.mockRejectedValue(new Error('Clear error'))

      await expect(storage.clearAll()).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
