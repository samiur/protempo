// ABOUTME: Tests for swing detector factory function.
// ABOUTME: Validates detector creation, initialization, and detection behavior.

import { createSwingDetector, isMLDetectionAvailable } from '../../lib/swingDetector'
import type { SwingDetector } from '../../types/swingDetection'

describe('Swing Detector', () => {
  let detector: SwingDetector

  beforeEach(() => {
    detector = createSwingDetector()
  })

  afterEach(() => {
    detector.dispose()
  })

  describe('createSwingDetector', () => {
    it('should create a detector instance', () => {
      expect(detector).toBeDefined()
      expect(typeof detector.isReady).toBe('function')
      expect(typeof detector.initialize).toBe('function')
      expect(typeof detector.detectSwingPhases).toBe('function')
      expect(typeof detector.dispose).toBe('function')
    })
  })

  describe('isReady', () => {
    it('should return false before initialization', () => {
      expect(detector.isReady()).toBe(false)
    })

    it('should return true after initialization', async () => {
      await detector.initialize()
      expect(detector.isReady()).toBe(true)
    })
  })

  describe('initialize', () => {
    it('should initialize without errors', async () => {
      await expect(detector.initialize()).resolves.not.toThrow()
    })

    it('should allow multiple initializations', async () => {
      await detector.initialize()
      await expect(detector.initialize()).resolves.not.toThrow()
    })
  })

  describe('detectSwingPhases', () => {
    beforeEach(async () => {
      await detector.initialize()
    })

    it('should return a valid detection result', async () => {
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      expect(result).toBeDefined()
      expect(typeof result.takeawayFrame).toBe('number')
      expect(typeof result.topFrame).toBe('number')
      expect(typeof result.impactFrame).toBe('number')
      expect(typeof result.confidence).toBe('number')
      expect(typeof result.processingTimeMs).toBe('number')
    })

    it('should throw error when not initialized', async () => {
      const uninitializedDetector = createSwingDetector()

      await expect(
        uninitializedDetector.detectSwingPhases('file:///path/to/video.mp4', 240)
      ).rejects.toThrow('Detector not initialized')
    })

    it('should return frames in correct order (takeaway < top < impact)', async () => {
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      expect(result.takeawayFrame).toBeLessThan(result.topFrame)
      expect(result.topFrame).toBeLessThan(result.impactFrame)
    })

    it('should return confidence in valid range (0-1)', async () => {
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should return non-negative processing time', async () => {
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('dispose', () => {
    it('should dispose without errors', () => {
      expect(() => detector.dispose()).not.toThrow()
    })

    it('should mark detector as not ready after dispose', async () => {
      await detector.initialize()
      expect(detector.isReady()).toBe(true)

      detector.dispose()
      expect(detector.isReady()).toBe(false)
    })

    it('should allow re-initialization after dispose', async () => {
      await detector.initialize()
      detector.dispose()

      await expect(detector.initialize()).resolves.not.toThrow()
      expect(detector.isReady()).toBe(true)
    })
  })

  describe('isMLDetectionAvailable', () => {
    it('should return a boolean', () => {
      const result = isMLDetectionAvailable()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('detector type selection', () => {
    it('should allow creating ML detector explicitly', () => {
      const mlDetector = createSwingDetector({ type: 'ml' })
      expect(mlDetector).toBeDefined()
      expect(typeof mlDetector.detectSwingPhases).toBe('function')
    })

    it('should allow creating mock detector explicitly', () => {
      const mockDetector = createSwingDetector({ type: 'mock' })
      expect(mockDetector).toBeDefined()
      expect(typeof mockDetector.detectSwingPhases).toBe('function')
    })

    it('should use auto selection by default', () => {
      const autoDetector = createSwingDetector()
      expect(autoDetector).toBeDefined()
    })
  })
})
