// ABOUTME: Integration tests for playback service with real tempo engine.
// ABOUTME: Verifies that tempo calculations and playback orchestration work together.

// TempoPreset used by getPresetById and other functions
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, getPresetById } from '../../constants/tempos'
import { calculateToneSequence, TempoEngineConfig } from '../../lib/tempoEngine'

// Mock audioManager
const mockPlayTone = jest.fn().mockResolvedValue(undefined)
const mockPreloadAll = jest.fn().mockResolvedValue(undefined)
const mockIsLoaded = jest.fn().mockReturnValue(true)
const mockUnloadAll = jest.fn().mockResolvedValue(undefined)
const mockSetVolume = jest.fn()
const mockSetToneStyle = jest.fn().mockResolvedValue(undefined)
const mockGetToneStyle = jest.fn().mockReturnValue('beep')

jest.mock('../../lib/audioManager', () => ({
  createAudioManager: jest.fn(() => ({
    playTone: mockPlayTone,
    preloadAll: mockPreloadAll,
    isLoaded: mockIsLoaded,
    unloadAll: mockUnloadAll,
    setVolume: mockSetVolume,
    setToneStyle: mockSetToneStyle,
    getToneStyle: mockGetToneStyle,
  })),
}))

import { createPlaybackService, PlaybackService } from '../../lib/playbackService'

// Type for mock callbacks with Jest mock functions
interface MockPlaybackCallbacks {
  onTonePlayed: jest.Mock
  onRepComplete: jest.Mock
  onPlaybackStart: jest.Mock
  onPlaybackStop: jest.Mock
}

describe('Playback Service Integration', () => {
  let service: PlaybackService
  let callbacks: MockPlaybackCallbacks

  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks()

    callbacks = {
      onTonePlayed: jest.fn(),
      onRepComplete: jest.fn(),
      onPlaybackStart: jest.fn(),
      onPlaybackStop: jest.fn(),
    }

    service = createPlaybackService()
  })

  afterEach(() => {
    service.stop()
    jest.useRealTimers()
  })

  describe('timing accuracy with real tempo engine', () => {
    it('should play 24/8 preset with correct timing', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '24/8')!
      const toneTimes: number[] = []
      let startTime = 0

      callbacks.onTonePlayed = jest.fn((_tone) => {
        const elapsed = Date.now() - startTime
        toneTimes.push(elapsed)
      })

      service.configure({
        preset,
        delayBetweenReps: 4,
        mode: 'single',
        callbacks,
      })

      startTime = Date.now()
      await service.start()

      // Advance through the full cycle
      jest.advanceTimersByTime(1200)

      // Verify timing
      expect(toneTimes).toHaveLength(3)
      expect(toneTimes[0]).toBe(0) // Tone 1 at 0ms
      expect(toneTimes[1]).toBeCloseTo(800, -2) // Tone 2 at ~800ms (within 100ms)
      expect(toneTimes[2]).toBeCloseTo(1067, -2) // Tone 3 at ~1067ms (within 100ms)
    })

    it('should play all Long Game presets with correct 3:1 ratio', async () => {
      for (const preset of LONG_GAME_PRESETS) {
        const config: TempoEngineConfig = {
          preset,
          delayBetweenReps: 4,
        }
        const sequence = calculateToneSequence(config)

        // Verify 3:1 ratio
        const backswingTime = sequence.tone2Time - sequence.tone1Time
        const downswingTime = sequence.tone3Time - sequence.tone2Time
        const ratio = backswingTime / downswingTime

        expect(ratio).toBeCloseTo(3, 1) // Within 0.1 of 3:1
      }
    })

    it('should play all Short Game presets with correct 2:1 ratio', async () => {
      for (const preset of SHORT_GAME_PRESETS) {
        const config: TempoEngineConfig = {
          preset,
          delayBetweenReps: 4,
        }
        const sequence = calculateToneSequence(config)

        // Verify 2:1 ratio
        const backswingTime = sequence.tone2Time - sequence.tone1Time
        const downswingTime = sequence.tone3Time - sequence.tone2Time
        const ratio = backswingTime / downswingTime

        expect(ratio).toBeCloseTo(2, 1) // Within 0.1 of 2:1
      }
    })
  })

  describe('playback over multiple reps', () => {
    it('should maintain accurate timing over 5 reps', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '18/6')! // Fast preset
      const repCompleteTimes: number[] = []
      let startTime = 0

      callbacks.onRepComplete = jest.fn((_repCount) => {
        repCompleteTimes.push(Date.now() - startTime)
      })

      service.configure({
        preset,
        delayBetweenReps: 2,
        mode: 'continuous',
        callbacks,
      })

      startTime = Date.now()
      await service.start()

      // 18/6 preset: tone3 at 800ms, cycle time 2800ms
      // Run for 5 reps
      jest.advanceTimersByTime(14500) // ~5 cycles

      expect(repCompleteTimes.length).toBeGreaterThanOrEqual(5)

      // Verify consistent cycle times
      for (let i = 1; i < repCompleteTimes.length; i++) {
        const cycleTime = repCompleteTimes[i] - repCompleteTimes[i - 1]
        // Should be close to 2800ms (800ms swing + 2000ms delay)
        expect(cycleTime).toBeGreaterThan(2700)
        expect(cycleTime).toBeLessThan(2900)
      }
    })

    it('should call all callbacks in correct order', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '24/8')!
      const callOrder: string[] = []

      callbacks.onPlaybackStart = jest.fn(() => callOrder.push('start'))
      callbacks.onTonePlayed = jest.fn((tone) => callOrder.push(`tone${tone}`))
      callbacks.onRepComplete = jest.fn((rep) => callOrder.push(`rep${rep}`))
      callbacks.onPlaybackStop = jest.fn(() => callOrder.push('stop'))

      service.configure({
        preset,
        delayBetweenReps: 4,
        mode: 'single',
        callbacks,
      })

      await service.start()
      jest.advanceTimersByTime(1200)

      expect(callOrder).toEqual(['start', 'tone1', 'tone2', 'tone3', 'rep1', 'stop'])
    })
  })

  describe('audio integration', () => {
    it('should call playTone for each tone', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '24/8')!

      service.configure({
        preset,
        delayBetweenReps: 4,
        mode: 'single',
        callbacks,
      })

      await service.start()
      jest.advanceTimersByTime(1200)

      expect(mockPlayTone).toHaveBeenCalledWith(1)
      expect(mockPlayTone).toHaveBeenCalledWith(2)
      expect(mockPlayTone).toHaveBeenCalledWith(3)
      expect(mockPlayTone).toHaveBeenCalledTimes(3)
    })

    it('should preload audio if not loaded', async () => {
      mockIsLoaded.mockReturnValue(false)
      const preset = getPresetById(LONG_GAME_PRESETS, '24/8')!

      service.configure({
        preset,
        delayBetweenReps: 4,
        mode: 'single',
        callbacks,
      })

      await service.start()

      expect(mockPreloadAll).toHaveBeenCalled()
    })
  })

  describe('switching presets mid-session', () => {
    it('should correctly handle switching from Long Game to Short Game preset', async () => {
      const longPreset = getPresetById(LONG_GAME_PRESETS, '24/8')!
      const shortPreset = getPresetById(SHORT_GAME_PRESETS, '18/9')!

      service.configure({
        preset: longPreset,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      // Complete first rep with long game preset
      jest.advanceTimersByTime(5200)
      expect(callbacks.onRepComplete).toHaveBeenCalledWith(1)

      // Switch to short game preset
      service.setPreset(shortPreset)

      // Advance to complete more reps
      jest.advanceTimersByTime(10000)

      // Should have multiple reps completed
      expect(callbacks.onRepComplete.mock.calls.length).toBeGreaterThan(2)
    })
  })

  describe('delay boundary conditions', () => {
    it('should work with minimum delay (2 seconds)', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '18/6')! // Fast preset

      service.configure({
        preset,
        delayBetweenReps: 2,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      // 800ms swing + 2000ms delay = 2800ms cycle
      jest.advanceTimersByTime(5700)

      // Should have completed at least 2 reps
      expect(callbacks.onRepComplete.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('should work with maximum delay (10 seconds)', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '18/6')!

      service.configure({
        preset,
        delayBetweenReps: 10,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      // 800ms swing + 10000ms delay = 10800ms cycle
      jest.advanceTimersByTime(11000)

      expect(callbacks.onRepComplete).toHaveBeenCalledWith(1)

      // Should start second rep
      jest.advanceTimersByTime(100)
      expect(mockPlayTone).toHaveBeenLastCalledWith(1) // Tone 1 of rep 2
    })
  })

  describe('state consistency', () => {
    it('should maintain rep count across pause/resume', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '18/6')!

      service.configure({
        preset,
        delayBetweenReps: 2,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      // Complete 2 reps
      jest.advanceTimersByTime(5700)
      const countBeforePause = service.getCurrentRepCount()
      expect(countBeforePause).toBe(2)

      // Pause
      service.pause()
      jest.advanceTimersByTime(1000) // Time passes while paused

      // Rep count should be unchanged
      expect(service.getCurrentRepCount()).toBe(countBeforePause)

      // Resume and complete more reps
      service.resume()
      jest.advanceTimersByTime(3000)

      // Should have more reps now
      expect(service.getCurrentRepCount()).toBeGreaterThan(countBeforePause)
    })

    it('should reset rep count on stop', async () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '18/6')!

      service.configure({
        preset,
        delayBetweenReps: 2,
        mode: 'continuous',
        callbacks,
      })

      await service.start()
      jest.advanceTimersByTime(5700)
      expect(service.getCurrentRepCount()).toBeGreaterThan(0)

      service.stop()
      expect(service.getCurrentRepCount()).toBe(0)
    })
  })
})
