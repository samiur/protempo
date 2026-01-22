// ABOUTME: Tests for ML-based swing detector implementation.
// ABOUTME: Validates swing phase detection using motion analysis.

import { createMLSwingDetector, MLSwingDetectorError } from '../../lib/mlSwingDetector'
import * as VideoThumbnails from 'expo-video-thumbnails'

// Get the mocked module
const mockedThumbnails = VideoThumbnails as jest.Mocked<typeof VideoThumbnails>

describe('mlSwingDetector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock to return valid thumbnails by default
    mockedThumbnails.getThumbnailAsync.mockResolvedValue({
      uri: 'file:///mock/frame.jpg',
      width: 1920,
      height: 1080,
    })
  })

  describe('createMLSwingDetector', () => {
    it('should create a swing detector instance', () => {
      const detector = createMLSwingDetector()

      expect(detector).toBeDefined()
      expect(typeof detector.isReady).toBe('function')
      expect(typeof detector.initialize).toBe('function')
      expect(typeof detector.detectSwingPhases).toBe('function')
      expect(typeof detector.dispose).toBe('function')
    })
  })

  describe('isReady', () => {
    it('should return false before initialization', () => {
      const detector = createMLSwingDetector()

      expect(detector.isReady()).toBe(false)
    })

    it('should return true after initialization', async () => {
      const detector = createMLSwingDetector()

      await detector.initialize()

      expect(detector.isReady()).toBe(true)
    })

    it('should return false after dispose', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      detector.dispose()

      expect(detector.isReady()).toBe(false)
    })
  })

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const detector = createMLSwingDetector()

      await expect(detector.initialize()).resolves.toBeUndefined()
      expect(detector.isReady()).toBe(true)
    })

    it('should be idempotent (can initialize multiple times)', async () => {
      const detector = createMLSwingDetector()

      await detector.initialize()
      await detector.initialize()

      expect(detector.isReady()).toBe(true)
    })
  })

  describe('detectSwingPhases', () => {
    it('should throw error if not initialized', async () => {
      const detector = createMLSwingDetector()

      await expect(detector.detectSwingPhases('file:///mock/video.mp4', 60)).rejects.toThrow(
        'Detector not initialized'
      )
    })

    it('should detect swing phases and return valid result', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      const result = await detector.detectSwingPhases('file:///mock/video.mp4', 60)

      // Verify structure
      expect(result).toHaveProperty('takeawayFrame')
      expect(result).toHaveProperty('topFrame')
      expect(result).toHaveProperty('impactFrame')
      expect(result).toHaveProperty('confidence')
      expect(result).toHaveProperty('processingTimeMs')

      // Verify frame order (takeaway < top < impact)
      expect(result.takeawayFrame).toBeLessThan(result.topFrame)
      expect(result.topFrame).toBeLessThan(result.impactFrame)

      // Verify confidence is in valid range
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)

      // Verify processing time is non-negative
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('should extract frames from video', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      await detector.detectSwingPhases('file:///mock/video.mp4', 60)

      // Should have extracted multiple frames
      expect(mockedThumbnails.getThumbnailAsync).toHaveBeenCalled()
      expect(mockedThumbnails.getThumbnailAsync.mock.calls.length).toBeGreaterThan(5)
    })

    it('should handle different FPS values', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      const result30 = await detector.detectSwingPhases('file:///mock/video.mp4', 30)
      jest.clearAllMocks()

      mockedThumbnails.getThumbnailAsync.mockResolvedValue({
        uri: 'file:///mock/frame.jpg',
        width: 1920,
        height: 1080,
      })

      const result240 = await detector.detectSwingPhases('file:///mock/video.mp4', 240)

      // Both should return valid results
      expect(result30.takeawayFrame).toBeLessThan(result30.topFrame)
      expect(result240.takeawayFrame).toBeLessThan(result240.topFrame)
    })

    it('should handle frame extraction errors gracefully', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      // Simulate some frame extraction failures
      let callCount = 0
      mockedThumbnails.getThumbnailAsync.mockImplementation(() => {
        callCount++
        if (callCount % 3 === 0) {
          return Promise.reject(new Error('Frame extraction failed'))
        }
        return Promise.resolve({
          uri: `file:///mock/frame_${callCount}.jpg`,
          width: 1920,
          height: 1080,
        })
      })

      // Should still return a result even with some failed frames
      const result = await detector.detectSwingPhases('file:///mock/video.mp4', 60)

      expect(result.takeawayFrame).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should complete successfully with default options', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      const result = await detector.detectSwingPhases('file:///mock/video.mp4', 60)

      // Should complete without error
      expect(result).toBeDefined()
      expect(result.takeawayFrame).toBeGreaterThanOrEqual(0)
    })
  })

  describe('dispose', () => {
    it('should clean up resources', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      detector.dispose()

      expect(detector.isReady()).toBe(false)
    })

    it('should be safe to call multiple times', async () => {
      const detector = createMLSwingDetector()
      await detector.initialize()

      detector.dispose()
      detector.dispose()

      expect(detector.isReady()).toBe(false)
    })

    it('should be safe to call without initialization', () => {
      const detector = createMLSwingDetector()

      expect(() => detector.dispose()).not.toThrow()
    })
  })

  describe('MLSwingDetectorError', () => {
    it('should create error with custom message', () => {
      const error = new MLSwingDetectorError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.name).toBe('MLSwingDetectorError')
    })

    it('should include cause when provided', () => {
      const cause = new Error('Original error')
      const error = new MLSwingDetectorError('Test error', cause)

      expect(error.message).toBe('Test error')
      expect(error.cause).toBe(cause)
    })
  })
})
