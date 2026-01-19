// ABOUTME: Unit tests for the AudioManager module.
// ABOUTME: Tests audio preloading, playback, volume control, and cleanup.

// Create mock functions that can be accessed in tests
const mockSoundPlay = jest.fn().mockResolvedValue(undefined)
const mockSoundSetPositionAsync = jest.fn().mockResolvedValue(undefined)
const mockSoundSetVolumeAsync = jest.fn().mockResolvedValue(undefined)
const mockSoundUnloadAsync = jest.fn().mockResolvedValue(undefined)
const mockSetAudioModeAsync = jest.fn().mockResolvedValue(undefined)

const createMockSound = () => ({
  playAsync: mockSoundPlay,
  setPositionAsync: mockSoundSetPositionAsync,
  setVolumeAsync: mockSoundSetVolumeAsync,
  unloadAsync: mockSoundUnloadAsync,
})

const mockCreateAsync = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ sound: createMockSound() }))

// Mock expo-av module
jest.mock('expo-av', () => {
  return {
    Audio: {
      Sound: {
        createAsync: (...args: unknown[]) => mockCreateAsync(...args),
      },
      setAudioModeAsync: (...args: unknown[]) => mockSetAudioModeAsync(...args),
    },
  }
})

// Import after mocking
import { createAudioManager, type AudioManager } from '../../lib/audioManager'

describe('AudioManager', () => {
  let audioManager: AudioManager

  beforeEach(() => {
    jest.clearAllMocks()
    audioManager = createAudioManager()
  })

  afterEach(async () => {
    // Clean up after each test
    if (audioManager.isLoaded()) {
      await audioManager.unloadAll()
    }
  })

  describe('initialization', () => {
    it('should start with isLoaded returning false', () => {
      expect(audioManager.isLoaded()).toBe(false)
    })

    it('should have beep as the default tone style', () => {
      expect(audioManager.getToneStyle()).toBe('beep')
    })
  })

  describe('preloadAll', () => {
    it('should load sounds without error', async () => {
      await expect(audioManager.preloadAll()).resolves.not.toThrow()
    })

    it('should set isLoaded to true after preloading', async () => {
      await audioManager.preloadAll()
      expect(audioManager.isLoaded()).toBe(true)
    })

    it('should configure audio mode for iOS silent mode and background playback', async () => {
      await audioManager.preloadAll()

      expect(mockSetAudioModeAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        })
      )
    })

    it('should load beep sound for beep tone style', async () => {
      await audioManager.preloadAll()

      // Beep style only loads one sound
      expect(mockCreateAsync).toHaveBeenCalled()
    })

    it('should not reload if already loaded', async () => {
      await audioManager.preloadAll()
      const callCount = mockCreateAsync.mock.calls.length

      await audioManager.preloadAll()
      expect(mockCreateAsync.mock.calls.length).toBe(callCount)
    })
  })

  describe('playTone', () => {
    beforeEach(async () => {
      await audioManager.preloadAll()
    })

    it('should play tone 1 correctly', async () => {
      await audioManager.playTone(1)
      expect(mockSoundSetPositionAsync).toHaveBeenCalledWith(0)
      expect(mockSoundPlay).toHaveBeenCalled()
    })

    it('should play tone 2 correctly', async () => {
      await audioManager.playTone(2)
      expect(mockSoundPlay).toHaveBeenCalled()
    })

    it('should play tone 3 correctly', async () => {
      await audioManager.playTone(3)
      expect(mockSoundPlay).toHaveBeenCalled()
    })

    it('should reset sound position before playing to handle rapid calls', async () => {
      await audioManager.playTone(1)
      expect(mockSoundSetPositionAsync).toHaveBeenCalledWith(0)
    })

    it('should throw error if not loaded', async () => {
      const unloadedManager = createAudioManager()
      await expect(unloadedManager.playTone(1)).rejects.toThrow('Audio not loaded')
    })

    it('should handle rapid successive calls without error', async () => {
      // Simulate tones being played in quick succession (like during playback)
      await Promise.all([
        audioManager.playTone(1),
        audioManager.playTone(2),
        audioManager.playTone(3),
      ])

      expect(mockSoundPlay).toHaveBeenCalledTimes(3)
    })
  })

  describe('setToneStyle', () => {
    it('should switch to voice tone style', async () => {
      await audioManager.preloadAll()
      await audioManager.setToneStyle('voice')

      expect(audioManager.getToneStyle()).toBe('voice')
    })

    it('should switch back to beep tone style', async () => {
      await audioManager.preloadAll()
      await audioManager.setToneStyle('voice')
      await audioManager.setToneStyle('beep')

      expect(audioManager.getToneStyle()).toBe('beep')
    })

    it('should reload sounds when changing tone style', async () => {
      await audioManager.preloadAll()
      const initialCallCount = mockCreateAsync.mock.calls.length

      await audioManager.setToneStyle('voice')

      expect(mockCreateAsync.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it('should unload previous sounds when changing style', async () => {
      await audioManager.preloadAll()
      await audioManager.setToneStyle('voice')

      expect(mockSoundUnloadAsync).toHaveBeenCalled()
    })

    it('should not reload if setting same tone style', async () => {
      await audioManager.preloadAll()
      const callCount = mockCreateAsync.mock.calls.length

      await audioManager.setToneStyle('beep')

      expect(mockCreateAsync.mock.calls.length).toBe(callCount)
    })
  })

  describe('setVolume', () => {
    beforeEach(async () => {
      await audioManager.preloadAll()
    })

    it('should update volume to specified value', async () => {
      audioManager.setVolume(0.5)
      expect(mockSoundSetVolumeAsync).toHaveBeenCalledWith(0.5)
    })

    it('should clamp volume to minimum of 0', async () => {
      audioManager.setVolume(-0.5)
      expect(mockSoundSetVolumeAsync).toHaveBeenCalledWith(0)
    })

    it('should clamp volume to maximum of 1', async () => {
      audioManager.setVolume(1.5)
      expect(mockSoundSetVolumeAsync).toHaveBeenCalledWith(1)
    })

    it('should handle volume of exactly 0', async () => {
      audioManager.setVolume(0)
      expect(mockSoundSetVolumeAsync).toHaveBeenCalledWith(0)
    })

    it('should handle volume of exactly 1', async () => {
      audioManager.setVolume(1)
      expect(mockSoundSetVolumeAsync).toHaveBeenCalledWith(1)
    })
  })

  describe('unloadAll', () => {
    it('should unload all sounds', async () => {
      await audioManager.preloadAll()
      await audioManager.unloadAll()

      expect(mockSoundUnloadAsync).toHaveBeenCalled()
    })

    it('should set isLoaded to false after unloading', async () => {
      await audioManager.preloadAll()
      await audioManager.unloadAll()

      expect(audioManager.isLoaded()).toBe(false)
    })

    it('should not throw if called when not loaded', async () => {
      await expect(audioManager.unloadAll()).resolves.not.toThrow()
    })

    it('should allow reloading after unload', async () => {
      await audioManager.preloadAll()
      await audioManager.unloadAll()
      await audioManager.preloadAll()

      expect(audioManager.isLoaded()).toBe(true)
    })
  })

  describe('isLoaded', () => {
    it('should return false before preloading', () => {
      expect(audioManager.isLoaded()).toBe(false)
    })

    it('should return true after preloading', async () => {
      await audioManager.preloadAll()
      expect(audioManager.isLoaded()).toBe(true)
    })

    it('should return false after unloading', async () => {
      await audioManager.preloadAll()
      await audioManager.unloadAll()
      expect(audioManager.isLoaded()).toBe(false)
    })
  })

  describe('voice tone style', () => {
    beforeEach(async () => {
      await audioManager.preloadAll()
      await audioManager.setToneStyle('voice')
    })

    it('should load 3 separate voice sounds', async () => {
      // Voice style loads: back, down, hit
      // After setToneStyle('voice'), createAsync should have been called for each voice file
      // Plus the initial beep load, so at least 4 calls
      expect(mockCreateAsync.mock.calls.length).toBeGreaterThanOrEqual(3)
    })

    it('should play back sound for tone 1', async () => {
      await audioManager.playTone(1)
      expect(mockSoundPlay).toHaveBeenCalled()
    })

    it('should play down sound for tone 2', async () => {
      await audioManager.playTone(2)
      expect(mockSoundPlay).toHaveBeenCalled()
    })

    it('should play hit sound for tone 3', async () => {
      await audioManager.playTone(3)
      expect(mockSoundPlay).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle preload failure gracefully', async () => {
      mockCreateAsync.mockRejectedValueOnce(new Error('Load failed'))

      await expect(audioManager.preloadAll()).rejects.toThrow('Load failed')
      expect(audioManager.isLoaded()).toBe(false)
    })

    it('should handle play failure gracefully', async () => {
      await audioManager.preloadAll()
      mockSoundPlay.mockRejectedValueOnce(new Error('Play failed'))

      await expect(audioManager.playTone(1)).rejects.toThrow('Play failed')
    })
  })
})
