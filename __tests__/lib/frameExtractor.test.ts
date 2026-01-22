// ABOUTME: Tests for frame extraction utilities used in swing analysis.
// ABOUTME: Validates frame extraction from videos at various time points.

import { extractFrames, extractFrameAt, getFrameCount } from '../../lib/frameExtractor'
import * as VideoThumbnails from 'expo-video-thumbnails'

// Get the mocked module
const mockedThumbnails = VideoThumbnails as jest.Mocked<typeof VideoThumbnails>

describe('frameExtractor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('extractFrameAt', () => {
    it('should extract a single frame at specified time', async () => {
      mockedThumbnails.getThumbnailAsync.mockResolvedValueOnce({
        uri: 'file:///mock/frame_500.jpg',
        width: 1920,
        height: 1080,
      })

      const result = await extractFrameAt('file:///mock/video.mp4', 500)

      expect(mockedThumbnails.getThumbnailAsync).toHaveBeenCalledWith('file:///mock/video.mp4', {
        time: 500,
        quality: 0.8,
      })
      expect(result).toEqual({
        uri: 'file:///mock/frame_500.jpg',
        timeMs: 500,
        width: 1920,
        height: 1080,
      })
    })

    it('should use custom quality when specified', async () => {
      mockedThumbnails.getThumbnailAsync.mockResolvedValueOnce({
        uri: 'file:///mock/frame.jpg',
        width: 1920,
        height: 1080,
      })

      await extractFrameAt('file:///mock/video.mp4', 1000, { quality: 0.5 })

      expect(mockedThumbnails.getThumbnailAsync).toHaveBeenCalledWith('file:///mock/video.mp4', {
        time: 1000,
        quality: 0.5,
      })
    })

    it('should throw error if extraction fails', async () => {
      mockedThumbnails.getThumbnailAsync.mockRejectedValueOnce(new Error('Extraction failed'))

      await expect(extractFrameAt('file:///mock/invalid.mp4', 0)).rejects.toThrow(
        'Failed to extract frame at 0ms: Extraction failed'
      )
    })
  })

  describe('extractFrames', () => {
    it('should extract multiple frames evenly distributed', async () => {
      // Mock 5 frame extractions
      for (let i = 0; i < 5; i++) {
        mockedThumbnails.getThumbnailAsync.mockResolvedValueOnce({
          uri: `file:///mock/frame_${i}.jpg`,
          width: 1920,
          height: 1080,
        })
      }

      const result = await extractFrames('file:///mock/video.mp4', 5, 5000)

      expect(result).toHaveLength(5)
      expect(mockedThumbnails.getThumbnailAsync).toHaveBeenCalledTimes(5)

      // Verify times are evenly distributed (0, 1250, 2500, 3750, 5000)
      expect(result[0].timeMs).toBe(0)
      expect(result[1].timeMs).toBe(1250)
      expect(result[2].timeMs).toBe(2500)
      expect(result[3].timeMs).toBe(3750)
      expect(result[4].timeMs).toBe(5000)
    })

    it('should handle single frame extraction', async () => {
      mockedThumbnails.getThumbnailAsync.mockResolvedValueOnce({
        uri: 'file:///mock/frame_0.jpg',
        width: 1920,
        height: 1080,
      })

      const result = await extractFrames('file:///mock/video.mp4', 1, 5000)

      expect(result).toHaveLength(1)
      expect(result[0].timeMs).toBe(0)
    })

    it('should throw error if count is less than 1', async () => {
      await expect(extractFrames('file:///mock/video.mp4', 0, 5000)).rejects.toThrow(
        'Frame count must be at least 1'
      )
    })

    it('should throw error if duration is invalid', async () => {
      await expect(extractFrames('file:///mock/video.mp4', 5, -1)).rejects.toThrow(
        'Duration must be positive'
      )
    })

    it('should continue extracting even if some frames fail', async () => {
      mockedThumbnails.getThumbnailAsync
        .mockResolvedValueOnce({
          uri: 'file:///mock/frame_0.jpg',
          width: 1920,
          height: 1080,
        })
        .mockRejectedValueOnce(new Error('Frame extraction failed'))
        .mockResolvedValueOnce({
          uri: 'file:///mock/frame_2.jpg',
          width: 1920,
          height: 1080,
        })

      const result = await extractFrames('file:///mock/video.mp4', 3, 2000, {
        continueOnError: true,
      })

      expect(result).toHaveLength(2)
      expect(result[0].timeMs).toBe(0)
      expect(result[1].timeMs).toBe(2000)
    })
  })

  describe('getFrameCount', () => {
    it('should calculate frame count from duration and fps', () => {
      expect(getFrameCount(5000, 30)).toBe(150) // 5 seconds at 30fps
      expect(getFrameCount(3000, 60)).toBe(180) // 3 seconds at 60fps
      expect(getFrameCount(2500, 240)).toBe(600) // 2.5 seconds at 240fps
    })

    it('should handle fractional frames by flooring', () => {
      expect(getFrameCount(1000, 29.97)).toBe(29) // floor(29.97)
      expect(getFrameCount(1500, 60)).toBe(90)
    })

    it('should return 0 for zero duration', () => {
      expect(getFrameCount(0, 30)).toBe(0)
    })
  })
})
