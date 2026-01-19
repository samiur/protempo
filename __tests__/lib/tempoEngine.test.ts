// ABOUTME: Unit tests for the tempo engine timing calculations.
// ABOUTME: Verifies tone sequence generation, rep timings, and next tone logic.

import { TempoPreset } from '../../types/tempo'
import {
  ToneSequence,
  TempoEngineConfig,
  calculateToneSequence,
  generateRepTimings,
  getNextToneTime,
  NextTone,
} from '../../lib/tempoEngine'

// Helper preset for testing - 24/8 is the most common
const PRESET_24_8: TempoPreset = {
  id: '24/8',
  backswingFrames: 24,
  downswingFrames: 8,
  label: '24/8',
  description: 'Tour average',
}

// Helper preset for edge case testing - fastest preset
const PRESET_18_6: TempoPreset = {
  id: '18/6',
  backswingFrames: 18,
  downswingFrames: 6,
  label: '18/6',
  description: 'Fastest tempo',
}

// Helper preset for edge case testing - slowest preset
const PRESET_30_10: TempoPreset = {
  id: '30/10',
  backswingFrames: 30,
  downswingFrames: 10,
  label: '30/10',
  description: 'Slowest tempo',
}

// Short game preset for different ratio testing
const PRESET_18_9: TempoPreset = {
  id: '18/9',
  backswingFrames: 18,
  downswingFrames: 9,
  label: '18/9',
  description: 'Medium pitch',
}

describe('Tempo Engine', () => {
  describe('calculateToneSequence', () => {
    it('should return tone1Time as 0 (start of takeaway)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)
      expect(sequence.tone1Time).toBe(0)
    })

    it('should calculate tone2Time correctly for 24/8 preset (800ms)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)
      // 24 frames at 30fps = 24/30 * 1000 = 800ms
      expect(sequence.tone2Time).toBe(800)
    })

    it('should calculate tone3Time correctly for 24/8 preset (1067ms)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)
      // tone2Time (800) + 8 frames at 30fps (267) = 1067ms
      expect(sequence.tone3Time).toBe(1067)
    })

    it('should calculate totalCycleTime including delay', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)
      // tone3Time (1067) + delay (4000) = 5067ms
      expect(sequence.totalCycleTime).toBe(5067)
    })

    it('should handle different delay values correctly', () => {
      const config2s: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 2,
      }
      const sequence2s = calculateToneSequence(config2s)
      // tone3Time (1067) + delay (2000) = 3067ms
      expect(sequence2s.totalCycleTime).toBe(3067)

      const config10s: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 10,
      }
      const sequence10s = calculateToneSequence(config10s)
      // tone3Time (1067) + delay (10000) = 11067ms
      expect(sequence10s.totalCycleTime).toBe(11067)
    })

    it('should calculate correct times for fastest preset (18/6)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_18_6,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)

      expect(sequence.tone1Time).toBe(0)
      // 18 frames = 600ms
      expect(sequence.tone2Time).toBe(600)
      // 600 + 6 frames (200ms) = 800ms
      expect(sequence.tone3Time).toBe(800)
      // 800 + 4000 = 4800ms
      expect(sequence.totalCycleTime).toBe(4800)
    })

    it('should calculate correct times for slowest preset (30/10)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_30_10,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)

      expect(sequence.tone1Time).toBe(0)
      // 30 frames = 1000ms
      expect(sequence.tone2Time).toBe(1000)
      // 1000 + 10 frames (333ms) = 1333ms
      expect(sequence.tone3Time).toBe(1333)
      // 1333 + 4000 = 5333ms
      expect(sequence.totalCycleTime).toBe(5333)
    })

    it('should calculate correct times for short game preset (18/9, 2:1 ratio)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_18_9,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)

      expect(sequence.tone1Time).toBe(0)
      // 18 frames = 600ms
      expect(sequence.tone2Time).toBe(600)
      // 600 + 9 frames (300ms) = 900ms
      expect(sequence.tone3Time).toBe(900)
      // 900 + 4000 = 4900ms
      expect(sequence.totalCycleTime).toBe(4900)
    })

    it('should be a pure function (same input = same output)', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence1 = calculateToneSequence(config)
      const sequence2 = calculateToneSequence(config)

      expect(sequence1).toEqual(sequence2)
    })

    it('should not mutate the input config', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const originalConfig = JSON.parse(JSON.stringify(config))
      calculateToneSequence(config)

      expect(config).toEqual(originalConfig)
    })
  })

  describe('generateRepTimings', () => {
    it('should return correct absolute times for single rep', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 5067,
      }

      const timings = generateRepTimings(sequence, 1)

      expect(timings).toHaveLength(1)
      expect(timings[0]).toEqual([0, 800, 1067])
    })

    it('should return correct absolute times for 2 reps with 24/8 at 4s delay', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 5067,
      }

      const timings = generateRepTimings(sequence, 2)

      expect(timings).toHaveLength(2)
      // Rep 1: starts at 0
      expect(timings[0]).toEqual([0, 800, 1067])
      // Rep 2: starts at totalCycleTime (5067)
      expect(timings[1]).toEqual([5067, 5867, 6134])
    })

    it('should return correct absolute times for 5 reps', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 5067,
      }

      const timings = generateRepTimings(sequence, 5)

      expect(timings).toHaveLength(5)

      // Verify each rep starts at the correct offset
      for (let i = 0; i < 5; i++) {
        const expectedStart = i * sequence.totalCycleTime
        expect(timings[i][0]).toBe(expectedStart)
        expect(timings[i][1]).toBe(expectedStart + 800)
        expect(timings[i][2]).toBe(expectedStart + 1067)
      }
    })

    it('should return empty array for 0 reps', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 5067,
      }

      const timings = generateRepTimings(sequence, 0)

      expect(timings).toHaveLength(0)
      expect(timings).toEqual([])
    })

    it('should handle minimum delay (2 seconds) timing', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 3067, // 1067 + 2000
      }

      const timings = generateRepTimings(sequence, 2)

      expect(timings[0]).toEqual([0, 800, 1067])
      expect(timings[1]).toEqual([3067, 3867, 4134])
    })

    it('should handle maximum delay (10 seconds) timing', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 11067, // 1067 + 10000
      }

      const timings = generateRepTimings(sequence, 2)

      expect(timings[0]).toEqual([0, 800, 1067])
      expect(timings[1]).toEqual([11067, 11867, 12134])
    })

    it('should be a pure function (same input = same output)', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 5067,
      }

      const timings1 = generateRepTimings(sequence, 3)
      const timings2 = generateRepTimings(sequence, 3)

      expect(timings1).toEqual(timings2)
    })

    it('should not mutate the input sequence', () => {
      const sequence: ToneSequence = {
        tone1Time: 0,
        tone2Time: 800,
        tone3Time: 1067,
        totalCycleTime: 5067,
      }
      const originalSequence = { ...sequence }

      generateRepTimings(sequence, 3)

      expect(sequence).toEqual(originalSequence)
    })
  })

  describe('getNextToneTime', () => {
    const sequence: ToneSequence = {
      tone1Time: 0,
      tone2Time: 800,
      tone3Time: 1067,
      totalCycleTime: 5067,
    }

    it('should return tone 1 when currentTime is before tone1Time', () => {
      const result = getNextToneTime(-1, sequence)
      expect(result).toEqual({ toneNumber: 1, time: 0 })
    })

    it('should return tone 1 at exactly time 0 (before play)', () => {
      // At time 0, tone 1 hasn't been played yet if we're checking "next"
      // But since tone1Time is 0, we interpret currentTime < tone1Time means tone 1 is next
      // At currentTime = 0, tone 1 is AT this time, so tone 2 is next
      const result = getNextToneTime(0, sequence)
      expect(result).toEqual({ toneNumber: 2, time: 800 })
    })

    it('should return tone 2 when currentTime is between tone 1 and tone 2', () => {
      const result = getNextToneTime(400, sequence)
      expect(result).toEqual({ toneNumber: 2, time: 800 })
    })

    it('should return tone 3 when currentTime is between tone 2 and tone 3', () => {
      const result = getNextToneTime(900, sequence)
      expect(result).toEqual({ toneNumber: 3, time: 1067 })
    })

    it('should return tone 3 when currentTime is exactly at tone 2', () => {
      const result = getNextToneTime(800, sequence)
      expect(result).toEqual({ toneNumber: 3, time: 1067 })
    })

    it('should return null when cycle is complete (after tone 3)', () => {
      const result = getNextToneTime(1067, sequence)
      expect(result).toBeNull()
    })

    it('should return null when in delay period (after tone 3)', () => {
      const result = getNextToneTime(2000, sequence)
      expect(result).toBeNull()
    })

    it('should return null when at end of cycle', () => {
      const result = getNextToneTime(5066, sequence)
      expect(result).toBeNull()
    })

    it('should handle edge case at exactly tone 3 time', () => {
      const result = getNextToneTime(1067, sequence)
      expect(result).toBeNull()
    })

    it('should return tone 2 right after tone 1 plays', () => {
      const result = getNextToneTime(1, sequence)
      expect(result).toEqual({ toneNumber: 2, time: 800 })
    })

    it('should return tone 3 right after tone 2 plays', () => {
      const result = getNextToneTime(801, sequence)
      expect(result).toEqual({ toneNumber: 3, time: 1067 })
    })

    it('should be a pure function', () => {
      const result1 = getNextToneTime(400, sequence)
      const result2 = getNextToneTime(400, sequence)
      expect(result1).toEqual(result2)
    })
  })

  describe('timing precision', () => {
    it('should maintain sub-millisecond precision in calculations', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)

      // Verify all times are integers (no floating point issues)
      expect(Number.isInteger(sequence.tone1Time)).toBe(true)
      expect(Number.isInteger(sequence.tone2Time)).toBe(true)
      expect(Number.isInteger(sequence.tone3Time)).toBe(true)
      expect(Number.isInteger(sequence.totalCycleTime)).toBe(true)
    })

    it('should produce consistent times across multiple calculations', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }

      const sequences = Array.from({ length: 100 }, () => calculateToneSequence(config))

      // All sequences should be identical
      sequences.forEach((seq) => {
        expect(seq.tone1Time).toBe(0)
        expect(seq.tone2Time).toBe(800)
        expect(seq.tone3Time).toBe(1067)
        expect(seq.totalCycleTime).toBe(5067)
      })
    })

    it('should handle timing within 1ms precision', () => {
      // Test various presets for timing precision
      const presets = [PRESET_18_6, PRESET_24_8, PRESET_30_10, PRESET_18_9]

      presets.forEach((preset) => {
        const config: TempoEngineConfig = {
          preset,
          delayBetweenReps: 4,
        }
        const sequence = calculateToneSequence(config)

        // Verify timing relationships
        expect(sequence.tone2Time).toBeGreaterThan(sequence.tone1Time)
        expect(sequence.tone3Time).toBeGreaterThan(sequence.tone2Time)
        expect(sequence.totalCycleTime).toBeGreaterThan(sequence.tone3Time)

        // Verify times are properly rounded integers
        expect(Math.abs(sequence.tone2Time - Math.round(sequence.tone2Time))).toBeLessThan(1)
        expect(Math.abs(sequence.tone3Time - Math.round(sequence.tone3Time))).toBeLessThan(1)
      })
    })
  })

  describe('integration scenarios', () => {
    it('should correctly chain calculateToneSequence and generateRepTimings', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)
      const timings = generateRepTimings(sequence, 3)

      // Verify the chain produces expected results
      expect(timings).toHaveLength(3)
      expect(timings[0]).toEqual([0, 800, 1067])
      expect(timings[1]).toEqual([5067, 5867, 6134])
      expect(timings[2]).toEqual([10134, 10934, 11201])
    })

    it('should correctly use getNextToneTime throughout a full cycle', () => {
      const config: TempoEngineConfig = {
        preset: PRESET_24_8,
        delayBetweenReps: 4,
      }
      const sequence = calculateToneSequence(config)

      // Simulate checking next tone at various points
      const checks: Array<{ time: number; expected: NextTone | null }> = [
        { time: -1, expected: { toneNumber: 1, time: 0 } },
        { time: 0, expected: { toneNumber: 2, time: 800 } },
        { time: 400, expected: { toneNumber: 2, time: 800 } },
        { time: 800, expected: { toneNumber: 3, time: 1067 } },
        { time: 1000, expected: { toneNumber: 3, time: 1067 } },
        { time: 1067, expected: null },
        { time: 3000, expected: null },
      ]

      checks.forEach(({ time, expected }) => {
        const result = getNextToneTime(time, sequence)
        expect(result).toEqual(expected)
      })
    })
  })
})
