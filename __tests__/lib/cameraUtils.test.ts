// ABOUTME: Tests for camera utility functions.
// ABOUTME: Verifies time formatting for recording duration display.

import { formatRecordingTime } from '../../lib/cameraUtils'

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
})
