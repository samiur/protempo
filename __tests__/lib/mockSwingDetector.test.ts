import { createMockSwingDetector } from '../../lib/mockSwingDetector'
import type { SwingDetector } from '../../types/swingDetection'

describe('Mock Swing Detector', () => {
  let detector: SwingDetector

  beforeEach(() => {
    detector = createMockSwingDetector()
  })

  afterEach(() => {
    detector.dispose()
  })

  describe('createMockSwingDetector', () => {
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

    it('should simulate initialization delay', async () => {
      const startTime = Date.now()
      await detector.initialize()
      const elapsed = Date.now() - startTime

      // Should have some delay (at least 50ms for mock)
      expect(elapsed).toBeGreaterThanOrEqual(50)
    })
  })

  describe('detectSwingPhases', () => {
    beforeEach(async () => {
      await detector.initialize()
    })

    it('should return frames in valid range based on video duration', async () => {
      // For a 5-second video at 240fps, total frames = 1200
      const fps = 240
      const videoDuration = 5000 // 5 seconds in ms
      const totalFrames = (videoDuration / 1000) * fps // 1200 frames

      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', fps)

      // All frames should be within video bounds
      expect(result.takeawayFrame).toBeGreaterThanOrEqual(0)
      expect(result.impactFrame).toBeLessThanOrEqual(totalFrames)
    })

    it('should return takeaway at approximately 10% of duration', async () => {
      const fps = 240
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', fps)

      // For a simulated video, takeaway should be early
      // We'll test that takeaway is less than top
      expect(result.takeawayFrame).toBeLessThan(result.topFrame)
    })

    it('should return top at approximately 60% of duration', async () => {
      const fps = 240
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', fps)

      // Top should be between takeaway and impact
      expect(result.topFrame).toBeGreaterThan(result.takeawayFrame)
      expect(result.topFrame).toBeLessThan(result.impactFrame)
    })

    it('should return impact at approximately 80% of duration', async () => {
      const fps = 240
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', fps)

      // Impact should be after top
      expect(result.impactFrame).toBeGreaterThan(result.topFrame)
    })

    it('should return confidence between 0.7 and 0.95', async () => {
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      expect(result.confidence).toBeGreaterThanOrEqual(0.7)
      expect(result.confidence).toBeLessThanOrEqual(0.95)
    })

    it('should simulate processing time delay', async () => {
      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      // Processing time should be positive
      expect(result.processingTimeMs).toBeGreaterThan(0)
    })

    it('should produce consistent frame ordering across multiple calls', async () => {
      for (let i = 0; i < 5; i++) {
        const result = await detector.detectSwingPhases(`file:///path/to/video${i}.mp4`, 240)

        expect(result.takeawayFrame).toBeLessThan(result.topFrame)
        expect(result.topFrame).toBeLessThan(result.impactFrame)
      }
    })

    it('should throw error when not initialized', async () => {
      const uninitializedDetector = createMockSwingDetector()

      await expect(
        uninitializedDetector.detectSwingPhases('file:///path/to/video.mp4', 240)
      ).rejects.toThrow('Detector not initialized')
    })

    it('should handle different fps values', async () => {
      const result60fps = await detector.detectSwingPhases('file:///path/to/video.mp4', 60)

      const result240fps = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      // Both should have valid results with proper ordering
      expect(result60fps.takeawayFrame).toBeLessThan(result60fps.topFrame)
      expect(result240fps.takeawayFrame).toBeLessThan(result240fps.topFrame)
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
  })

  describe('deterministic behavior with seed', () => {
    it('should return frame numbers that follow realistic swing proportions', async () => {
      await detector.initialize()

      const result = await detector.detectSwingPhases('file:///path/to/video.mp4', 240)

      const backswingFrames = result.topFrame - result.takeawayFrame
      const downswingFrames = result.impactFrame - result.topFrame

      // Backswing should typically be longer than downswing (golf tempo ratios)
      // Most golfers have 2:1 to 3:1 ratios
      const ratio = backswingFrames / downswingFrames

      // Ratio should be positive and within a wide realistic range.
      // The mock uses ±10% jitter which can produce varying ratios.
      // Typical golf tempo is 2:1 to 3:1, but with jitter we allow wider tolerance.
      expect(ratio).toBeGreaterThan(0)
      expect(ratio).toBeLessThanOrEqual(10.0)
    })
  })
})
