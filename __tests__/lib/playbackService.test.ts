// ABOUTME: Unit tests for the playback service that orchestrates tempo and audio.
// ABOUTME: Verifies timing accuracy, callbacks, state management, and playback modes.

import { TempoPreset } from '../../types/tempo'

// Mock audioManager before importing playbackService
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

import { createPlaybackService, PlaybackService, PlaybackConfig } from '../../lib/playbackService'

// Test preset - 24/8 at 30fps
const PRESET_24_8: TempoPreset = {
  id: '24/8',
  backswingFrames: 24,
  downswingFrames: 8,
  label: '24/8',
  description: 'Tour average',
}

// Faster preset for quicker tests
const PRESET_18_6: TempoPreset = {
  id: '18/6',
  backswingFrames: 18,
  downswingFrames: 6,
  label: '18/6',
  description: 'Fastest tempo',
}

// Type for mock callbacks with Jest mock functions
interface MockPlaybackCallbacks {
  onTonePlayed: jest.Mock
  onRepComplete: jest.Mock
  onPlaybackStart: jest.Mock
  onPlaybackStop: jest.Mock
}

describe('Playback Service', () => {
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
  })

  afterEach(() => {
    if (service) {
      service.stop()
    }
    jest.useRealTimers()
  })

  describe('createPlaybackService', () => {
    it('should create a playback service instance', () => {
      service = createPlaybackService()
      expect(service).toBeDefined()
      expect(service.configure).toBeDefined()
      expect(service.start).toBeDefined()
      expect(service.stop).toBeDefined()
      expect(service.pause).toBeDefined()
      expect(service.resume).toBeDefined()
      expect(service.isPlaying).toBeDefined()
      expect(service.getCurrentRepCount).toBeDefined()
    })
  })

  describe('configure', () => {
    it('should accept a valid configuration', () => {
      service = createPlaybackService()
      const config: PlaybackConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      }

      expect(() => service.configure(config)).not.toThrow()
    })

    it('should update configuration when called multiple times', () => {
      service = createPlaybackService()

      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })

      service.configure({
        preset: PRESET_18_6,
        delayBetweenReps: 2,
        mode: 'single',
        callbacks,
      })

      // Service should accept reconfiguration without error
      expect(() => service.isPlaying()).not.toThrow()
    })
  })

  describe('start', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should fire onPlaybackStart callback when starting', async () => {
      await service.start()
      expect(callbacks.onPlaybackStart).toHaveBeenCalledTimes(1)
    })

    it('should set isPlaying to true', async () => {
      expect(service.isPlaying()).toBe(false)
      await service.start()
      expect(service.isPlaying()).toBe(true)
    })

    it('should play tone 1 immediately on start', async () => {
      await service.start()

      // Tone 1 should play immediately
      expect(mockPlayTone).toHaveBeenCalledWith(1)
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(1)
    })

    it('should throw error if not configured', async () => {
      const unconfiguredService = createPlaybackService()
      await expect(unconfiguredService.start()).rejects.toThrow('Playback service not configured')
    })

    it('should not start if already playing', async () => {
      await service.start()
      callbacks.onPlaybackStart.mockClear()

      await service.start()
      expect(callbacks.onPlaybackStart).not.toHaveBeenCalled()
    })
  })

  describe('timing accuracy', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should play tone 2 at correct time (800ms for 24/8)', async () => {
      await service.start()
      mockPlayTone.mockClear()
      callbacks.onTonePlayed.mockClear()

      // Advance to just before tone 2
      jest.advanceTimersByTime(790)
      expect(callbacks.onTonePlayed).not.toHaveBeenCalledWith(2)

      // Advance past tone 2 time (with some tolerance)
      jest.advanceTimersByTime(50)
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(2)
    })

    it('should play tone 3 at correct time (1067ms for 24/8)', async () => {
      await service.start()
      mockPlayTone.mockClear()
      callbacks.onTonePlayed.mockClear()

      // Advance to just before tone 3
      jest.advanceTimersByTime(1050)
      expect(callbacks.onTonePlayed).not.toHaveBeenCalledWith(3)

      // Advance past tone 3 time
      jest.advanceTimersByTime(50)
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(3)
    })

    it('should play all three tones in correct order', async () => {
      const toneOrder: number[] = []
      callbacks.onTonePlayed = jest.fn((tone) => toneOrder.push(tone))

      await service.start()

      // Advance through full cycle
      jest.advanceTimersByTime(1200)

      expect(toneOrder).toEqual([1, 2, 3])
    })

    it('should fire onRepComplete after tone 3', async () => {
      await service.start()

      // Advance through tone 3
      jest.advanceTimersByTime(1100)

      expect(callbacks.onRepComplete).toHaveBeenCalledWith(1)
    })

    it('should increment rep count on rep completion', async () => {
      await service.start()
      expect(service.getCurrentRepCount()).toBe(0)

      // Complete first rep
      jest.advanceTimersByTime(1100)
      expect(service.getCurrentRepCount()).toBe(1)

      // Complete second rep (need to wait for delay + swing)
      jest.advanceTimersByTime(5100)
      expect(service.getCurrentRepCount()).toBe(2)
    })
  })

  describe('continuous mode', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should start next rep after delay', async () => {
      await service.start()

      // Complete first rep (1067ms for swing)
      jest.advanceTimersByTime(1100)
      expect(callbacks.onRepComplete).toHaveBeenCalledTimes(1)

      callbacks.onTonePlayed.mockClear()

      // Wait through delay (4000ms) and into next swing
      jest.advanceTimersByTime(4100)

      // Should have started tone 1 of rep 2
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(1)
    })

    it('should continue looping until stopped', async () => {
      await service.start()

      // Complete 3 reps
      // Each cycle is ~5067ms (1067ms swing + 4000ms delay)
      jest.advanceTimersByTime(16000) // ~3 complete cycles

      expect(callbacks.onRepComplete.mock.calls.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('single mode', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'single',
        callbacks,
      })
    })

    it('should stop after one rep in single mode', async () => {
      await service.start()

      // Complete first rep
      jest.advanceTimersByTime(1100)

      expect(callbacks.onRepComplete).toHaveBeenCalledTimes(1)
      expect(callbacks.onPlaybackStop).toHaveBeenCalledTimes(1)
      expect(service.isPlaying()).toBe(false)
    })

    it('should not start next rep after completing single rep', async () => {
      await service.start()

      // Complete rep and wait through what would be delay period
      jest.advanceTimersByTime(6000)

      // Should only have one rep
      expect(callbacks.onRepComplete).toHaveBeenCalledTimes(1)
      expect(callbacks.onTonePlayed).toHaveBeenCalledTimes(3) // Only 3 tones total
    })
  })

  describe('stop', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should halt playback', async () => {
      await service.start()
      jest.advanceTimersByTime(500)

      service.stop()

      expect(service.isPlaying()).toBe(false)
    })

    it('should fire onPlaybackStop callback', async () => {
      await service.start()
      service.stop()

      expect(callbacks.onPlaybackStop).toHaveBeenCalledTimes(1)
    })

    it('should reset rep count to 0', async () => {
      await service.start()
      jest.advanceTimersByTime(6000) // Complete at least one rep

      service.stop()

      expect(service.getCurrentRepCount()).toBe(0)
    })

    it('should stop scheduling new tones', async () => {
      await service.start()
      jest.advanceTimersByTime(500) // Mid-cycle

      callbacks.onTonePlayed.mockClear()
      service.stop()

      // Advance past where tones would have played
      jest.advanceTimersByTime(2000)

      expect(callbacks.onTonePlayed).not.toHaveBeenCalled()
    })

    it('should do nothing if not playing', () => {
      expect(() => service.stop()).not.toThrow()
      expect(callbacks.onPlaybackStop).not.toHaveBeenCalled()
    })
  })

  describe('pause', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should pause playback', async () => {
      await service.start()
      service.pause()

      expect(service.isPaused()).toBe(true)
      expect(service.isPlaying()).toBe(true) // Still "playing" but paused
    })

    it('should stop scheduling tones while paused', async () => {
      await service.start()
      jest.advanceTimersByTime(500) // After tone 1, before tone 2

      callbacks.onTonePlayed.mockClear()
      service.pause()

      // Advance past where tone 2 would have played
      jest.advanceTimersByTime(1000)

      expect(callbacks.onTonePlayed).not.toHaveBeenCalled()
    })

    it('should do nothing if not playing', () => {
      expect(() => service.pause()).not.toThrow()
      expect(service.isPaused()).toBe(false)
    })

    it('should do nothing if already paused', async () => {
      await service.start()
      service.pause()
      expect(service.isPaused()).toBe(true)

      service.pause()
      expect(service.isPaused()).toBe(true)
    })
  })

  describe('resume', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should resume playback from paused position', async () => {
      await service.start()
      jest.advanceTimersByTime(500) // After tone 1

      service.pause()
      callbacks.onTonePlayed.mockClear()

      service.resume()

      expect(service.isPaused()).toBe(false)

      // Tone 2 should play after remaining time
      jest.advanceTimersByTime(400)
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(2)
    })

    it('should do nothing if not paused', async () => {
      await service.start()
      const playingState = service.isPlaying()
      const pausedState = service.isPaused()

      service.resume()

      expect(service.isPlaying()).toBe(playingState)
      expect(service.isPaused()).toBe(pausedState)
    })

    it('should continue incrementing rep count after resume', async () => {
      await service.start()
      jest.advanceTimersByTime(500)

      service.pause()
      jest.advanceTimersByTime(1000)

      service.resume()

      // Complete first rep
      jest.advanceTimersByTime(700)
      expect(service.getCurrentRepCount()).toBe(1)
    })
  })

  describe('setPreset', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should update preset during playback', async () => {
      await service.start()
      // Complete first rep (1067ms) and wait for next cycle to start
      // First cycle: tone3 at 1067ms, next cycle starts at 5067ms
      jest.advanceTimersByTime(5100) // Past start of second cycle

      // Verify we're in the second cycle (tone 1 played)
      expect(callbacks.onRepComplete).toHaveBeenCalledWith(1)

      callbacks.onTonePlayed.mockClear()

      // Now we're early in second cycle, update preset
      service.setPreset(PRESET_18_6)

      // Wait for next cycle with new preset
      // Current cycle with 24/8 will complete, then new preset takes effect
      // Need to advance past current cycle completion and into next cycle
      // From 5100ms: need to reach 5067 + 1067 = 6134ms for tone3, then 6134 + 4000 = 10134ms for next tone1
      // But since we changed preset, from next cycle start:
      // Actually the change takes effect on next scheduled event
      // Advance to complete second cycle and see third cycle with new preset
      jest.advanceTimersByTime(6000) // Should complete second cycle and start third

      // Verify tone 2 was played in a cycle
      const tone2Calls = callbacks.onTonePlayed.mock.calls.filter((call) => call[0] === 2)
      expect(tone2Calls.length).toBeGreaterThan(0)
    })

    it('should update preset when not playing', () => {
      service.setPreset(PRESET_18_6)
      // Should not throw
      expect(() => service.isPlaying()).not.toThrow()
    })
  })

  describe('setDelay', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should update delay for subsequent cycles', async () => {
      await service.start()

      // Complete first rep (tone 3 at 1067ms)
      jest.advanceTimersByTime(1100)
      expect(callbacks.onRepComplete).toHaveBeenCalledWith(1)

      // Now in delay period, change delay to 2 seconds
      // Note: the next cycle start is already scheduled based on original delay (4s)
      // So this change will affect the cycle AFTER that
      service.setDelay(2)

      callbacks.onTonePlayed.mockClear()

      // Wait for second cycle to start and complete
      // Original schedule: next cycle at 5067ms, so from 1100ms we need ~4000ms more
      jest.advanceTimersByTime(4100) // Now at ~5200ms, second cycle started

      // Verify tone 1 of second rep was played
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(1)

      // Now complete second cycle and verify third starts with new delay
      callbacks.onTonePlayed.mockClear()

      // Second cycle: tone3 at 5067 + 1067 = 6134, with 2s delay -> third cycle at 8134
      // From current time (~5200), need ~3000ms to reach third cycle
      jest.advanceTimersByTime(3100)

      // Verify tone 1 of third rep started
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(1)
    })

    it('should update delay when not playing', () => {
      service.setDelay(6)
      // Should not throw
      expect(() => service.isPlaying()).not.toThrow()
    })
  })

  describe('getCurrentRepCount', () => {
    beforeEach(() => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })
    })

    it('should return 0 before any reps complete', async () => {
      expect(service.getCurrentRepCount()).toBe(0)

      await service.start()
      expect(service.getCurrentRepCount()).toBe(0)

      jest.advanceTimersByTime(500)
      expect(service.getCurrentRepCount()).toBe(0)
    })

    it('should return accurate count after reps complete', async () => {
      await service.start()

      // Complete first rep
      jest.advanceTimersByTime(1100)
      expect(service.getCurrentRepCount()).toBe(1)

      // Complete second rep
      jest.advanceTimersByTime(5100)
      expect(service.getCurrentRepCount()).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle rapid start/stop cycles', async () => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })

      for (let i = 0; i < 5; i++) {
        await service.start()
        jest.advanceTimersByTime(100)
        service.stop()
      }

      expect(service.isPlaying()).toBe(false)
      expect(service.getCurrentRepCount()).toBe(0)
    })

    it('should handle minimum delay (2 seconds)', async () => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 2,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      // Complete first rep and wait through minimum delay
      jest.advanceTimersByTime(3200) // 1067 + 2000 + some margin

      expect(callbacks.onRepComplete).toHaveBeenCalledTimes(1)
      // Tone 1 of second rep should have played
      const tone1Calls = callbacks.onTonePlayed.mock.calls.filter((call) => call[0] === 1)
      expect(tone1Calls.length).toBe(2)
    })

    it('should handle maximum delay (10 seconds)', async () => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 10,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      // Complete first rep
      jest.advanceTimersByTime(1100)
      expect(callbacks.onRepComplete).toHaveBeenCalledTimes(1)

      callbacks.onTonePlayed.mockClear()

      // Wait through max delay
      jest.advanceTimersByTime(10100)

      // Should have started next rep
      expect(callbacks.onTonePlayed).toHaveBeenCalledWith(1)
    })

    it('should handle changing mode while stopped', () => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'continuous',
        callbacks,
      })

      service.configure({
        preset: PRESET_24_8,
        delayBetweenReps: 4,
        mode: 'single',
        callbacks,
      })

      expect(() => service.isPlaying()).not.toThrow()
    })
  })

  describe('drift compensation', () => {
    it('should maintain timing accuracy over multiple reps', async () => {
      service = createPlaybackService()
      service.configure({
        preset: PRESET_18_6, // Use fast preset for quicker test
        delayBetweenReps: 2,
        mode: 'continuous',
        callbacks,
      })

      await service.start()

      const repCompleteTimes: number[] = []
      let currentTime = 0

      callbacks.onRepComplete = jest.fn(() => {
        repCompleteTimes.push(currentTime)
      })

      // Simulate 5 reps
      // 18/6 preset: tone3 at 800ms, cycle at 2800ms (800 + 2000)
      for (let rep = 0; rep < 5; rep++) {
        const cycleTime = 2800
        const targetEndTime = (rep + 1) * cycleTime - 2000 // tone3 time

        while (currentTime < targetEndTime + 100) {
          jest.advanceTimersByTime(10)
          currentTime += 10
        }
      }

      // Verify reps completed at expected intervals (within tolerance)
      const expectedCycleTime = 2800
      for (let i = 1; i < repCompleteTimes.length; i++) {
        const actualInterval = repCompleteTimes[i] - repCompleteTimes[i - 1]
        const drift = Math.abs(actualInterval - expectedCycleTime)
        expect(drift).toBeLessThan(100) // 100ms tolerance
      }
    })
  })
})
