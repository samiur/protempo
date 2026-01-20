// ABOUTME: Tests for camera utility functions.
// ABOUTME: Verifies FPS formatting, video quality selection, and time formatting.

import {
  formatRecordingTime,
  getBestVideoQuality,
  type CameraCapabilities,
} from '../../lib/cameraUtils'
import { TARGET_FPS, MIN_FPS } from '../../constants/videoSettings'

describe('cameraUtils', () => {
  describe('formatRecordingTime', () => {
    it('should format 0 milliseconds as "0:00"', () => {
      expect(formatRecordingTime(0)).toBe('0:00')
    })

    it('should format 1 second as "0:01"', () => {
      expect(formatRecordingTime(1000)).toBe('0:01')
    })

    it('should format 5 seconds as "0:05"', () => {
      expect(formatRecordingTime(5000)).toBe('0:05')
    })

    it('should format 10 seconds as "0:10"', () => {
      expect(formatRecordingTime(10000)).toBe('0:10')
    })

    it('should format 59 seconds as "0:59"', () => {
      expect(formatRecordingTime(59000)).toBe('0:59')
    })

    it('should format 60 seconds as "1:00"', () => {
      expect(formatRecordingTime(60000)).toBe('1:00')
    })

    it('should format 90 seconds as "1:30"', () => {
      expect(formatRecordingTime(90000)).toBe('1:30')
    })

    it('should handle millisecond rounding by flooring', () => {
      expect(formatRecordingTime(1500)).toBe('0:01')
      expect(formatRecordingTime(1999)).toBe('0:01')
    })
  })

  describe('getBestVideoQuality', () => {
    it('should return 2160p for 240fps capable cameras', () => {
      const capabilities: CameraCapabilities = {
        maxFps: 240,
        supportsSlowMotion: true,
        supportedRatios: ['16:9', '4:3'],
      }

      const quality = getBestVideoQuality(capabilities)

      expect(quality).toBe('2160p')
    })

    it('should return 1080p for 120fps capable cameras', () => {
      const capabilities: CameraCapabilities = {
        maxFps: 120,
        supportsSlowMotion: true,
        supportedRatios: ['16:9', '4:3'],
      }

      const quality = getBestVideoQuality(capabilities)

      expect(quality).toBe('1080p')
    })

    it('should return 1080p for 60fps capable cameras', () => {
      const capabilities: CameraCapabilities = {
        maxFps: 60,
        supportsSlowMotion: false,
        supportedRatios: ['16:9', '4:3'],
      }

      const quality = getBestVideoQuality(capabilities)

      expect(quality).toBe('1080p')
    })

    it('should return 720p for cameras below minimum FPS', () => {
      const capabilities: CameraCapabilities = {
        maxFps: 30,
        supportsSlowMotion: false,
        supportedRatios: ['16:9'],
      }

      const quality = getBestVideoQuality(capabilities)

      expect(quality).toBe('720p')
    })

    it('should return 1080p when maxFps equals MIN_FPS', () => {
      const capabilities: CameraCapabilities = {
        maxFps: MIN_FPS,
        supportsSlowMotion: false,
        supportedRatios: ['16:9'],
      }

      const quality = getBestVideoQuality(capabilities)

      expect(quality).toBe('1080p')
    })

    it('should return 2160p when maxFps equals TARGET_FPS', () => {
      const capabilities: CameraCapabilities = {
        maxFps: TARGET_FPS,
        supportsSlowMotion: true,
        supportedRatios: ['16:9', '4:3'],
      }

      const quality = getBestVideoQuality(capabilities)

      expect(quality).toBe('2160p')
    })
  })
})
