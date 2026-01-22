import {
  calculateRatioFromFrames,
  compareToTargetTempo,
  getTempoFeedback,
  findClosestPreset,
} from '../../lib/swingAnalysisUtils'
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS } from '../../constants/tempos'
import type { TempoComparison } from '../../types/swingDetection'
import type { SwingAnalysis } from '../../types/video'
import type { TempoPreset } from '../../types/tempo'

describe('Swing Analysis Utils', () => {
  describe('calculateRatioFromFrames', () => {
    it('should calculate correct ratio for 3:1 timing', () => {
      // Takeaway at frame 10, top at frame 40, impact at frame 50
      // Backswing: 40 - 10 = 30 frames
      // Downswing: 50 - 40 = 10 frames
      // Ratio: 30 / 10 = 3.0
      const ratio = calculateRatioFromFrames(10, 40, 50)
      expect(ratio).toBe(3.0)
    })

    it('should calculate correct ratio for 2:1 timing', () => {
      // Takeaway at frame 5, top at frame 25, impact at frame 35
      // Backswing: 25 - 5 = 20 frames
      // Downswing: 35 - 25 = 10 frames
      // Ratio: 20 / 10 = 2.0
      const ratio = calculateRatioFromFrames(5, 25, 35)
      expect(ratio).toBe(2.0)
    })

    it('should handle decimal ratios', () => {
      // Backswing: 25 - 5 = 20 frames
      // Downswing: 32 - 25 = 7 frames
      // Ratio: 20 / 7 = ~2.857
      const ratio = calculateRatioFromFrames(5, 25, 32)
      expect(ratio).toBeCloseTo(2.857, 2)
    })

    it('should handle edge case where frames are close together', () => {
      // Backswing: 11 - 10 = 1 frame
      // Downswing: 12 - 11 = 1 frame
      // Ratio: 1 / 1 = 1.0
      const ratio = calculateRatioFromFrames(10, 11, 12)
      expect(ratio).toBe(1.0)
    })

    it('should return Infinity when downswing is zero frames', () => {
      // This shouldn't happen in practice, but handle gracefully
      const ratio = calculateRatioFromFrames(10, 20, 20)
      expect(ratio).toBe(Infinity)
    })

    it('should return valid positive ratio for normal inputs', () => {
      const ratio = calculateRatioFromFrames(0, 24, 32)
      expect(ratio).toBeGreaterThan(0)
      expect(Number.isFinite(ratio)).toBe(true)
    })
  })

  describe('compareToTargetTempo', () => {
    // Use the 24/8 preset (3:1 ratio) as target
    const target: TempoPreset = {
      id: '24/8',
      backswingFrames: 24,
      downswingFrames: 8,
      label: '24/8',
      description: 'Tour average',
    }

    it('should detect slower tempo (lower ratio)', () => {
      // Detected ratio of 2.5:1 vs target 3:1
      const analysis: SwingAnalysis = {
        takeawayFrame: 10,
        topFrame: 35,
        impactFrame: 45,
        backswingFrames: 25,
        downswingFrames: 10,
        ratio: 2.5,
        confidence: 0.85,
        manuallyAdjusted: false,
      }

      const comparison = compareToTargetTempo(analysis, target)

      expect(comparison.detectedRatio).toBe(2.5)
      expect(comparison.targetRatio).toBe(3.0)
      expect(comparison.comparison).toBe('slower')
      // 2.5 is about 16.7% slower than 3.0
      expect(comparison.percentDifference).toBeCloseTo(-16.67, 0)
    })

    it('should detect faster tempo (higher ratio)', () => {
      // Detected ratio of 3.5:1 vs target 3:1
      const analysis: SwingAnalysis = {
        takeawayFrame: 10,
        topFrame: 45,
        impactFrame: 55,
        backswingFrames: 35,
        downswingFrames: 10,
        ratio: 3.5,
        confidence: 0.85,
        manuallyAdjusted: false,
      }

      const comparison = compareToTargetTempo(analysis, target)

      expect(comparison.detectedRatio).toBe(3.5)
      expect(comparison.targetRatio).toBe(3.0)
      expect(comparison.comparison).toBe('faster')
      // 3.5 is about 16.7% faster than 3.0
      expect(comparison.percentDifference).toBeCloseTo(16.67, 0)
    })

    it('should detect similar tempo (within 5% tolerance)', () => {
      // Detected ratio of 3.1:1 vs target 3:1 (about 3.3% difference)
      const analysis: SwingAnalysis = {
        takeawayFrame: 10,
        topFrame: 41,
        impactFrame: 51,
        backswingFrames: 31,
        downswingFrames: 10,
        ratio: 3.1,
        confidence: 0.85,
        manuallyAdjusted: false,
      }

      const comparison = compareToTargetTempo(analysis, target)

      expect(comparison.detectedRatio).toBe(3.1)
      expect(comparison.targetRatio).toBe(3.0)
      expect(comparison.comparison).toBe('similar')
    })

    it('should detect similar tempo at exact match', () => {
      const analysis: SwingAnalysis = {
        takeawayFrame: 0,
        topFrame: 24,
        impactFrame: 32,
        backswingFrames: 24,
        downswingFrames: 8,
        ratio: 3.0,
        confidence: 0.85,
        manuallyAdjusted: false,
      }

      const comparison = compareToTargetTempo(analysis, target)

      expect(comparison.comparison).toBe('similar')
      expect(comparison.percentDifference).toBe(0)
    })

    it('should calculate target ratio from preset frames', () => {
      // Use 21/7 preset (also 3:1 ratio)
      const preset: TempoPreset = LONG_GAME_PRESETS[1]
      const analysis: SwingAnalysis = {
        takeawayFrame: 0,
        topFrame: 21,
        impactFrame: 28,
        backswingFrames: 21,
        downswingFrames: 7,
        ratio: 3.0,
        confidence: 0.85,
        manuallyAdjusted: false,
      }

      const comparison = compareToTargetTempo(analysis, preset)

      expect(comparison.targetRatio).toBe(3.0)
    })

    it('should work with short game presets (2:1 ratio)', () => {
      // Use 18/9 preset (2:1 ratio)
      const preset: TempoPreset = SHORT_GAME_PRESETS[2]
      const analysis: SwingAnalysis = {
        takeawayFrame: 0,
        topFrame: 20,
        impactFrame: 30,
        backswingFrames: 20,
        downswingFrames: 10,
        ratio: 2.0,
        confidence: 0.85,
        manuallyAdjusted: false,
      }

      const comparison = compareToTargetTempo(analysis, preset)

      expect(comparison.targetRatio).toBe(2.0)
      expect(comparison.comparison).toBe('similar')
    })
  })

  describe('getTempoFeedback', () => {
    it('should return faster feedback message', () => {
      const comparison: TempoComparison = {
        detectedRatio: 3.5,
        targetRatio: 3.0,
        percentDifference: 16.67,
        comparison: 'faster',
      }

      const feedback = getTempoFeedback(comparison)

      expect(feedback).toContain('faster')
      expect(feedback.toLowerCase()).not.toContain('slower')
    })

    it('should return slower feedback message', () => {
      const comparison: TempoComparison = {
        detectedRatio: 2.5,
        targetRatio: 3.0,
        percentDifference: -16.67,
        comparison: 'slower',
      }

      const feedback = getTempoFeedback(comparison)

      expect(feedback).toContain('slower')
      expect(feedback.toLowerCase()).not.toContain('faster')
    })

    it('should return matching/similar feedback message', () => {
      const comparison: TempoComparison = {
        detectedRatio: 3.0,
        targetRatio: 3.0,
        percentDifference: 0,
        comparison: 'similar',
      }

      const feedback = getTempoFeedback(comparison)

      // Should indicate good match, not faster or slower
      expect(feedback.toLowerCase()).not.toContain('faster')
      expect(feedback.toLowerCase()).not.toContain('slower')
    })

    it('should include percentage in feedback for non-similar tempos', () => {
      const comparison: TempoComparison = {
        detectedRatio: 3.5,
        targetRatio: 3.0,
        percentDifference: 16.67,
        comparison: 'faster',
      }

      const feedback = getTempoFeedback(comparison)

      expect(feedback).toMatch(/\d+%/)
    })
  })

  describe('findClosestPreset', () => {
    describe('long game mode', () => {
      it('should return 24/8 for ratio of 3.0', () => {
        const preset = findClosestPreset(3.0, 'long')

        expect(preset).toBeDefined()
        expect(preset.id).toBe('24/8')
      })

      it('should return 24/8 for ratio close to 3.0', () => {
        const preset = findClosestPreset(2.9, 'long')

        expect(preset).toBeDefined()
        expect(preset.id).toBe('24/8')
      })

      it('should return first preset for very high ratio', () => {
        // All long game presets have 3:1 ratio, so should return first
        const preset = findClosestPreset(5.0, 'long')

        expect(preset).toBeDefined()
        // Should still find a match
        expect(LONG_GAME_PRESETS.map((p) => p.id)).toContain(preset.id)
      })

      it('should return a long game preset', () => {
        const preset = findClosestPreset(2.5, 'long')

        expect(LONG_GAME_PRESETS.map((p) => p.id)).toContain(preset.id)
      })
    })

    describe('short game mode', () => {
      it('should return 18/9 for ratio of 2.0', () => {
        const preset = findClosestPreset(2.0, 'short')

        expect(preset).toBeDefined()
        expect(preset.id).toBe('18/9')
      })

      it('should return a short game preset', () => {
        const preset = findClosestPreset(2.0, 'short')

        expect(SHORT_GAME_PRESETS.map((p) => p.id)).toContain(preset.id)
      })

      it('should find closest preset for intermediate ratio', () => {
        // All short game presets have 2:1 ratio
        const preset = findClosestPreset(1.8, 'short')

        expect(preset).toBeDefined()
        expect(SHORT_GAME_PRESETS.map((p) => p.id)).toContain(preset.id)
      })
    })

    it('should not return undefined for any valid input', () => {
      const ratios = [1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0]

      for (const ratio of ratios) {
        const longPreset = findClosestPreset(ratio, 'long')
        const shortPreset = findClosestPreset(ratio, 'short')

        expect(longPreset).toBeDefined()
        expect(shortPreset).toBeDefined()
      }
    })

    it('should prefer presets with similar frame counts for same ratio', () => {
      // When multiple presets have the same ratio, prefer middle one
      // This tests that we're selecting appropriately
      const preset = findClosestPreset(3.0, 'long')

      expect(preset).toBeDefined()
      // Should return 24/8 (middle preset) as the "standard" tour tempo
      expect(preset.id).toBe('24/8')
    })
  })
})
