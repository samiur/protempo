// ABOUTME: Unit tests for the video storage layer.
// ABOUTME: Tests AsyncStorage CRUD operations for video metadata.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { SwingVideo, SwingAnalysis } from '../../types/video'
import { VIDEO_STORAGE_KEY_PREFIX, VIDEO_INDEX_KEY } from '../../constants/videoSettings'

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  multiGet: jest.fn(),
  multiRemove: jest.fn(),
}))

const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>

// Import after mock setup
import { videoStorage } from '../../lib/videoStorage'

const createMockVideo = (overrides: Partial<SwingVideo> = {}): SwingVideo => ({
  id: 'test-video-1',
  uri: 'file:///path/to/video.mp4',
  thumbnailUri: 'file:///path/to/thumb.jpg',
  createdAt: 1704067200000,
  duration: 5000,
  fps: 240,
  width: 1920,
  height: 1080,
  analysis: null,
  sessionId: null,
  ...overrides,
})

const createMockAnalysis = (overrides: Partial<SwingAnalysis> = {}): SwingAnalysis => ({
  takeawayFrame: 10,
  topFrame: 40,
  impactFrame: 55,
  backswingFrames: 30,
  downswingFrames: 15,
  ratio: 2.0,
  confidence: 0.85,
  manuallyAdjusted: false,
  ...overrides,
})

describe('videoStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveVideo', () => {
    it('should save video metadata to AsyncStorage', async () => {
      const video = createMockVideo()
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      await videoStorage.saveVideo(video)

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        `${VIDEO_STORAGE_KEY_PREFIX}${video.id}`,
        JSON.stringify(video)
      )
    })

    it('should update the video index', async () => {
      const video = createMockVideo()
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      await videoStorage.saveVideo(video)

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        VIDEO_INDEX_KEY,
        JSON.stringify([video.id])
      )
    })

    it('should append to existing video index', async () => {
      const video = createMockVideo({ id: 'video-2' })
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1']))

      await videoStorage.saveVideo(video)

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        VIDEO_INDEX_KEY,
        JSON.stringify(['video-1', 'video-2'])
      )
    })

    it('should not duplicate ID in index if video already exists', async () => {
      const video = createMockVideo({ id: 'video-1' })
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1']))

      await videoStorage.saveVideo(video)

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        VIDEO_INDEX_KEY,
        JSON.stringify(['video-1'])
      )
    })

    it('should handle save errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockResolvedValue(null)
      mockedAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'))

      await expect(videoStorage.saveVideo(createMockVideo())).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getVideo', () => {
    it('should return video by ID', async () => {
      const video = createMockVideo()
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(video))

      const result = await videoStorage.getVideo(video.id)

      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
        `${VIDEO_STORAGE_KEY_PREFIX}${video.id}`
      )
      expect(result).toEqual(video)
    })

    it('should return null for non-existent video', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const result = await videoStorage.getVideo('non-existent')

      expect(result).toBeNull()
    })

    it('should handle invalid JSON gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockResolvedValue('invalid json {{{')

      const result = await videoStorage.getVideo('test-id')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle load errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const result = await videoStorage.getVideo('test-id')

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getAllVideos', () => {
    it('should return all videos from index', async () => {
      const video1 = createMockVideo({ id: 'video-1' })
      const video2 = createMockVideo({ id: 'video-2' })

      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1', 'video-2']))
      mockedAsyncStorage.multiGet.mockResolvedValue([
        [`${VIDEO_STORAGE_KEY_PREFIX}video-1`, JSON.stringify(video1)],
        [`${VIDEO_STORAGE_KEY_PREFIX}video-2`, JSON.stringify(video2)],
      ])

      const result = await videoStorage.getAllVideos()

      expect(result).toEqual([video1, video2])
    })

    it('should return empty array when no videos exist', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const result = await videoStorage.getAllVideos()

      expect(result).toEqual([])
    })

    it('should filter out corrupted video entries', async () => {
      const video1 = createMockVideo({ id: 'video-1' })

      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1', 'video-2']))
      mockedAsyncStorage.multiGet.mockResolvedValue([
        [`${VIDEO_STORAGE_KEY_PREFIX}video-1`, JSON.stringify(video1)],
        [`${VIDEO_STORAGE_KEY_PREFIX}video-2`, null],
      ])

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = await videoStorage.getAllVideos()

      expect(result).toEqual([video1])
      consoleSpy.mockRestore()
    })

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const result = await videoStorage.getAllVideos()

      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('deleteVideo', () => {
    it('should remove video from AsyncStorage', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1', 'video-2']))
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined)
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)

      await videoStorage.deleteVideo('video-1')

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
        `${VIDEO_STORAGE_KEY_PREFIX}video-1`
      )
    })

    it('should update video index after deletion', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1', 'video-2']))
      mockedAsyncStorage.removeItem.mockResolvedValue(undefined)
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)

      await videoStorage.deleteVideo('video-1')

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        VIDEO_INDEX_KEY,
        JSON.stringify(['video-2'])
      )
    })

    it('should handle delete errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1']))
      mockedAsyncStorage.removeItem.mockRejectedValue(new Error('Delete error'))

      await expect(videoStorage.deleteVideo('video-1')).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('updateVideoAnalysis', () => {
    it('should update video with analysis', async () => {
      const video = createMockVideo()
      const analysis = createMockAnalysis()

      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(video))
      mockedAsyncStorage.setItem.mockResolvedValue(undefined)

      await videoStorage.updateVideoAnalysis(video.id, analysis)

      const expectedVideo = { ...video, analysis }
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        `${VIDEO_STORAGE_KEY_PREFIX}${video.id}`,
        JSON.stringify(expectedVideo)
      )
    })

    it('should do nothing if video not found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      await videoStorage.updateVideoAnalysis('non-existent', createMockAnalysis())

      expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle update errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Read error'))

      await expect(
        videoStorage.updateVideoAnalysis('test-id', createMockAnalysis())
      ).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getVideoStorageSize', () => {
    it('should calculate total storage size', async () => {
      const video1 = createMockVideo({ id: 'video-1' })
      const video2 = createMockVideo({ id: 'video-2' })

      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1', 'video-2']))
      mockedAsyncStorage.multiGet.mockResolvedValue([
        [`${VIDEO_STORAGE_KEY_PREFIX}video-1`, JSON.stringify(video1)],
        [`${VIDEO_STORAGE_KEY_PREFIX}video-2`, JSON.stringify(video2)],
      ])

      const result = await videoStorage.getVideoStorageSize()

      // Size is based on JSON string length (approximation for metadata)
      const expectedSize = JSON.stringify(video1).length + JSON.stringify(video2).length
      expect(result).toBe(expectedSize)
    })

    it('should return 0 when no videos exist', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const result = await videoStorage.getVideoStorageSize()

      expect(result).toBe(0)
    })

    it('should handle errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockedAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'))

      const result = await videoStorage.getVideoStorageSize()

      expect(result).toBe(0)
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('getVideoIndex', () => {
    it('should return video IDs from index', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['video-1', 'video-2']))

      const result = await videoStorage.getVideoIndex()

      expect(result).toEqual(['video-1', 'video-2'])
    })

    it('should return empty array when index is empty', async () => {
      mockedAsyncStorage.getItem.mockResolvedValue(null)

      const result = await videoStorage.getVideoIndex()

      expect(result).toEqual([])
    })
  })
})
