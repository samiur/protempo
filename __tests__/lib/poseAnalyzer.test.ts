// ABOUTME: Tests for pose analysis and motion detection utilities.
// ABOUTME: Validates motion analysis for swing phase detection.

import {
  analyzeMotion,
  detectPeakMotion,
  findMotionStart,
  findMotionPeak,
  findMotionEnd,
  MotionAnalysisResult,
} from '../../lib/poseAnalyzer'
import type { ExtractedFrame } from '../../lib/frameExtractor'

describe('poseAnalyzer', () => {
  describe('analyzeMotion', () => {
    it('should analyze motion between consecutive frames', () => {
      const frames: ExtractedFrame[] = [
        { uri: 'frame1.jpg', timeMs: 0, width: 100, height: 100 },
        { uri: 'frame2.jpg', timeMs: 100, width: 100, height: 100 },
        { uri: 'frame3.jpg', timeMs: 200, width: 100, height: 100 },
      ]

      // Mock motion scores (in real impl, these come from image analysis)
      const mockMotionScores = [0, 0.3, 0.8]

      const result = analyzeMotion(frames, mockMotionScores)

      expect(result).toHaveLength(3)
      expect(result[0].frameIndex).toBe(0)
      expect(result[0].motionScore).toBe(0)
      expect(result[1].frameIndex).toBe(1)
      expect(result[1].motionScore).toBe(0.3)
      expect(result[2].frameIndex).toBe(2)
      expect(result[2].motionScore).toBe(0.8)
    })

    it('should throw error if frames and scores length mismatch', () => {
      const frames: ExtractedFrame[] = [
        { uri: 'frame1.jpg', timeMs: 0, width: 100, height: 100 },
        { uri: 'frame2.jpg', timeMs: 100, width: 100, height: 100 },
      ]
      const scores = [0.1] // Mismatch

      expect(() => analyzeMotion(frames, scores)).toThrow(
        'Frames and motion scores must have the same length'
      )
    })

    it('should handle empty frames array', () => {
      expect(analyzeMotion([], [])).toEqual([])
    })
  })

  describe('detectPeakMotion', () => {
    it('should find the frame with highest motion', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.1 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.5 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.9 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.3 },
      ]

      const peak = detectPeakMotion(analysis)

      expect(peak).toEqual({ frameIndex: 2, timeMs: 200, motionScore: 0.9 })
    })

    it('should return first maximum if multiple frames have same peak', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.5 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.9 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.9 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.5 },
      ]

      const peak = detectPeakMotion(analysis)

      expect(peak?.frameIndex).toBe(1)
    })

    it('should return null for empty analysis', () => {
      expect(detectPeakMotion([])).toBeNull()
    })
  })

  describe('findMotionStart', () => {
    it('should find first frame where motion exceeds threshold', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.05 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.08 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.15 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.4 },
        { frameIndex: 4, timeMs: 400, motionScore: 0.7 },
      ]

      const start = findMotionStart(analysis, 0.1)

      expect(start?.frameIndex).toBe(2)
    })

    it('should return null if no motion exceeds threshold', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.05 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.08 },
      ]

      expect(findMotionStart(analysis, 0.1)).toBeNull()
    })

    it('should use default threshold of 0.1', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.05 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.12 },
      ]

      const start = findMotionStart(analysis)

      expect(start?.frameIndex).toBe(1)
    })
  })

  describe('findMotionPeak', () => {
    it('should find the frame with maximum motion in a range', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.1 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.5 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.8 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.6 },
        { frameIndex: 4, timeMs: 400, motionScore: 0.3 },
      ]

      const peak = findMotionPeak(analysis, 1, 3)

      expect(peak?.frameIndex).toBe(2)
    })

    it('should respect the search range', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.9 }, // Highest but outside range
        { frameIndex: 1, timeMs: 100, motionScore: 0.5 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.6 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.4 },
      ]

      const peak = findMotionPeak(analysis, 1, 3)

      expect(peak?.frameIndex).toBe(2)
    })

    it('should return null for empty range', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.5 },
      ]

      expect(findMotionPeak(analysis, 5, 10)).toBeNull()
    })
  })

  describe('findMotionEnd', () => {
    it('should find first frame where motion drops below threshold after peak', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.2 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.5 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.8 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.4 },
        { frameIndex: 4, timeMs: 400, motionScore: 0.1 },
        { frameIndex: 5, timeMs: 500, motionScore: 0.05 },
      ]

      const end = findMotionEnd(analysis, 2, 0.15)

      expect(end?.frameIndex).toBe(4)
    })

    it('should return last frame if motion never drops below threshold', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.2 },
        { frameIndex: 1, timeMs: 100, motionScore: 0.5 },
        { frameIndex: 2, timeMs: 200, motionScore: 0.8 },
        { frameIndex: 3, timeMs: 300, motionScore: 0.6 },
      ]

      const end = findMotionEnd(analysis, 2, 0.1)

      expect(end?.frameIndex).toBe(3)
    })

    it('should return null if startIndex is out of bounds', () => {
      const analysis: MotionAnalysisResult[] = [
        { frameIndex: 0, timeMs: 0, motionScore: 0.5 },
      ]

      expect(findMotionEnd(analysis, 5, 0.1)).toBeNull()
    })
  })
})
