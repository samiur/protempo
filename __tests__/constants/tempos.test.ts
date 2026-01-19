// ABOUTME: Unit tests for tempo constants and helper functions.
// ABOUTME: Verifies preset ratios, frame conversions, and time calculations.

import {
  FRAME_RATE,
  LONG_GAME_PRESETS,
  SHORT_GAME_PRESETS,
  framesToMs,
  getTotalTime,
  formatTime,
  getPresetById,
  getPresetIds,
} from '../../constants/tempos'
import { TempoPreset } from '../../types/tempo'

describe('Tempo Constants', () => {
  describe('FRAME_RATE', () => {
    it('should be 30fps', () => {
      expect(FRAME_RATE).toBe(30)
    })
  })

  describe('framesToMs', () => {
    it('should convert 30 frames to 1000ms (1 second)', () => {
      expect(framesToMs(30)).toBe(1000)
    })

    it('should convert 24 frames to 800ms', () => {
      expect(framesToMs(24)).toBe(800)
    })

    it('should convert 8 frames to 267ms (rounded)', () => {
      // 8 / 30 * 1000 = 266.666... rounds to 267
      expect(framesToMs(8)).toBe(267)
    })

    it('should convert 0 frames to 0ms', () => {
      expect(framesToMs(0)).toBe(0)
    })

    it('should handle fractional results by rounding', () => {
      // 1 frame = 33.333ms, rounds to 33
      expect(framesToMs(1)).toBe(33)
      // 7 frames = 233.333ms, rounds to 233
      expect(framesToMs(7)).toBe(233)
    })
  })

  describe('getTotalTime', () => {
    it('should calculate total time for 24/8 preset as 1067ms', () => {
      const preset: TempoPreset = {
        id: '24/8',
        backswingFrames: 24,
        downswingFrames: 8,
        label: '24/8',
        description: 'Test',
      }
      // 24 + 8 = 32 frames, 32 / 30 * 1000 = 1066.666... rounds to 1067
      expect(getTotalTime(preset)).toBe(1067)
    })

    it('should calculate total time for 18/6 preset as 800ms', () => {
      const preset: TempoPreset = {
        id: '18/6',
        backswingFrames: 18,
        downswingFrames: 6,
        label: '18/6',
        description: 'Test',
      }
      // 18 + 6 = 24 frames, 24 / 30 * 1000 = 800
      expect(getTotalTime(preset)).toBe(800)
    })

    it('should calculate total time for 30/10 preset as 1333ms', () => {
      const preset: TempoPreset = {
        id: '30/10',
        backswingFrames: 30,
        downswingFrames: 10,
        label: '30/10',
        description: 'Test',
      }
      // 30 + 10 = 40 frames, 40 / 30 * 1000 = 1333.333... rounds to 1333
      expect(getTotalTime(preset)).toBe(1333)
    })
  })

  describe('formatTime', () => {
    it('should format 1067ms as "1.07s"', () => {
      expect(formatTime(1067)).toBe('1.07s')
    })

    it('should format 800ms as "0.80s"', () => {
      expect(formatTime(800)).toBe('0.80s')
    })

    it('should format 1000ms as "1.00s"', () => {
      expect(formatTime(1000)).toBe('1.00s')
    })
  })

  describe('LONG_GAME_PRESETS', () => {
    it('should have exactly 5 presets', () => {
      expect(LONG_GAME_PRESETS).toHaveLength(5)
    })

    it('should have all presets with 3:1 backswing to downswing ratio', () => {
      LONG_GAME_PRESETS.forEach((preset) => {
        const ratio = preset.backswingFrames / preset.downswingFrames
        expect(ratio).toBe(3)
      })
    })

    it('should have unique IDs', () => {
      const ids = getPresetIds(LONG_GAME_PRESETS)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have the correct preset values', () => {
      const expectedPresets = [
        { id: '18/6', backswing: 18, downswing: 6 },
        { id: '21/7', backswing: 21, downswing: 7 },
        { id: '24/8', backswing: 24, downswing: 8 },
        { id: '27/9', backswing: 27, downswing: 9 },
        { id: '30/10', backswing: 30, downswing: 10 },
      ]

      expectedPresets.forEach((expected, index) => {
        const preset = LONG_GAME_PRESETS[index]
        expect(preset.id).toBe(expected.id)
        expect(preset.backswingFrames).toBe(expected.backswing)
        expect(preset.downswingFrames).toBe(expected.downswing)
        expect(preset.label).toBe(expected.id)
      })
    })

    it('should have correct total times per PRD', () => {
      const expectedTimes = [
        { id: '18/6', ms: 800 }, // 0.80s
        { id: '21/7', ms: 933 }, // 0.93s (28 frames)
        { id: '24/8', ms: 1067 }, // 1.07s (32 frames)
        { id: '27/9', ms: 1200 }, // 1.20s (36 frames)
        { id: '30/10', ms: 1333 }, // 1.33s (40 frames)
      ]

      expectedTimes.forEach((expected) => {
        const preset = getPresetById(LONG_GAME_PRESETS, expected.id)
        expect(preset).toBeDefined()
        expect(getTotalTime(preset!)).toBe(expected.ms)
      })
    })

    it('should have non-empty descriptions', () => {
      LONG_GAME_PRESETS.forEach((preset) => {
        expect(preset.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('SHORT_GAME_PRESETS', () => {
    it('should have exactly 5 presets', () => {
      expect(SHORT_GAME_PRESETS).toHaveLength(5)
    })

    it('should have all presets with 2:1 backswing to downswing ratio', () => {
      SHORT_GAME_PRESETS.forEach((preset) => {
        const ratio = preset.backswingFrames / preset.downswingFrames
        expect(ratio).toBe(2)
      })
    })

    it('should have unique IDs', () => {
      const ids = getPresetIds(SHORT_GAME_PRESETS)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have the correct preset values', () => {
      const expectedPresets = [
        { id: '14/7', backswing: 14, downswing: 7 },
        { id: '16/8', backswing: 16, downswing: 8 },
        { id: '18/9', backswing: 18, downswing: 9 },
        { id: '20/10', backswing: 20, downswing: 10 },
        { id: '22/11', backswing: 22, downswing: 11 },
      ]

      expectedPresets.forEach((expected, index) => {
        const preset = SHORT_GAME_PRESETS[index]
        expect(preset.id).toBe(expected.id)
        expect(preset.backswingFrames).toBe(expected.backswing)
        expect(preset.downswingFrames).toBe(expected.downswing)
        expect(preset.label).toBe(expected.id)
      })
    })

    it('should have correct total times per PRD', () => {
      const expectedTimes = [
        { id: '14/7', ms: 700 }, // 0.70s (21 frames)
        { id: '16/8', ms: 800 }, // 0.80s (24 frames)
        { id: '18/9', ms: 900 }, // 0.90s (27 frames)
        { id: '20/10', ms: 1000 }, // 1.00s (30 frames)
        { id: '22/11', ms: 1100 }, // 1.10s (33 frames)
      ]

      expectedTimes.forEach((expected) => {
        const preset = getPresetById(SHORT_GAME_PRESETS, expected.id)
        expect(preset).toBeDefined()
        expect(getTotalTime(preset!)).toBe(expected.ms)
      })
    })

    it('should have non-empty descriptions', () => {
      SHORT_GAME_PRESETS.forEach((preset) => {
        expect(preset.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Preset IDs are unique across both game modes', () => {
    it('should have no overlapping IDs between long and short game', () => {
      const longIds = new Set(getPresetIds(LONG_GAME_PRESETS))
      const shortIds = getPresetIds(SHORT_GAME_PRESETS)

      shortIds.forEach((id) => {
        expect(longIds.has(id)).toBe(false)
      })
    })
  })

  describe('getPresetById', () => {
    it('should find a preset by ID', () => {
      const preset = getPresetById(LONG_GAME_PRESETS, '24/8')
      expect(preset).toBeDefined()
      expect(preset?.id).toBe('24/8')
      expect(preset?.backswingFrames).toBe(24)
    })

    it('should return undefined for non-existent ID', () => {
      const preset = getPresetById(LONG_GAME_PRESETS, 'invalid')
      expect(preset).toBeUndefined()
    })

    it('should work with short game presets', () => {
      const preset = getPresetById(SHORT_GAME_PRESETS, '18/9')
      expect(preset).toBeDefined()
      expect(preset?.id).toBe('18/9')
    })
  })

  describe('getPresetIds', () => {
    it('should return all IDs from long game presets', () => {
      const ids = getPresetIds(LONG_GAME_PRESETS)
      expect(ids).toEqual(['18/6', '21/7', '24/8', '27/9', '30/10'])
    })

    it('should return all IDs from short game presets', () => {
      const ids = getPresetIds(SHORT_GAME_PRESETS)
      expect(ids).toEqual(['14/7', '16/8', '18/9', '20/10', '22/11'])
    })
  })
})
