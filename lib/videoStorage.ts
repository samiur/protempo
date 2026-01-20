// ABOUTME: Storage layer for video metadata using AsyncStorage.
// ABOUTME: Provides CRUD operations for swing videos with an index for efficient listing.

import AsyncStorage from '@react-native-async-storage/async-storage'
import { SwingVideo, SwingAnalysis } from '../types/video'
import { VIDEO_STORAGE_KEY_PREFIX, VIDEO_INDEX_KEY } from '../constants/videoSettings'

/**
 * Get the storage key for a video by ID.
 */
function getVideoKey(id: string): string {
  return `${VIDEO_STORAGE_KEY_PREFIX}${id}`
}

/**
 * Load the video index (list of all video IDs).
 */
async function loadVideoIndex(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(VIDEO_INDEX_KEY)
    if (!data) {
      return []
    }
    return JSON.parse(data) as string[]
  } catch (error) {
    console.error('Failed to load video index:', error)
    return []
  }
}

/**
 * Save the video index.
 */
async function saveVideoIndex(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(VIDEO_INDEX_KEY, JSON.stringify(ids))
  } catch (error) {
    console.error('Failed to save video index:', error)
  }
}

export const videoStorage = {
  /**
   * Save a video's metadata to storage.
   * Also updates the video index.
   */
  async saveVideo(video: SwingVideo): Promise<void> {
    try {
      // Save the video metadata
      await AsyncStorage.setItem(getVideoKey(video.id), JSON.stringify(video))

      // Update the index
      const index = await loadVideoIndex()
      if (!index.includes(video.id)) {
        index.push(video.id)
        await saveVideoIndex(index)
      } else {
        // ID already exists, just update the index to ensure consistency
        await saveVideoIndex(index)
      }
    } catch (error) {
      console.error('Failed to save video:', error)
    }
  },

  /**
   * Get a video by its ID.
   * Returns null if not found.
   */
  async getVideo(id: string): Promise<SwingVideo | null> {
    try {
      const data = await AsyncStorage.getItem(getVideoKey(id))
      if (!data) {
        return null
      }
      return JSON.parse(data) as SwingVideo
    } catch (error) {
      console.error('Failed to get video:', error)
      return null
    }
  },

  /**
   * Get all videos from storage.
   * Returns an empty array if none exist or on error.
   */
  async getAllVideos(): Promise<SwingVideo[]> {
    try {
      const index = await loadVideoIndex()
      if (index.length === 0) {
        return []
      }

      const keys = index.map(getVideoKey)
      const results = await AsyncStorage.multiGet(keys)

      const videos: SwingVideo[] = []
      for (const [, value] of results) {
        if (value) {
          try {
            videos.push(JSON.parse(value) as SwingVideo)
          } catch (parseError) {
            console.error('Failed to parse video data:', parseError)
          }
        }
      }

      return videos
    } catch (error) {
      console.error('Failed to get all videos:', error)
      return []
    }
  },

  /**
   * Delete a video from storage.
   * Also removes from the video index.
   */
  async deleteVideo(id: string): Promise<void> {
    try {
      // Remove from storage
      await AsyncStorage.removeItem(getVideoKey(id))

      // Update index
      const index = await loadVideoIndex()
      const updatedIndex = index.filter((videoId) => videoId !== id)
      await saveVideoIndex(updatedIndex)
    } catch (error) {
      console.error('Failed to delete video:', error)
    }
  },

  /**
   * Update a video's analysis data.
   * Does nothing if the video is not found.
   */
  async updateVideoAnalysis(id: string, analysis: SwingAnalysis): Promise<void> {
    try {
      const video = await this.getVideo(id)
      if (!video) {
        console.error('Cannot update analysis: video not found:', id)
        return
      }

      const updatedVideo: SwingVideo = { ...video, analysis }
      await AsyncStorage.setItem(getVideoKey(id), JSON.stringify(updatedVideo))
    } catch (error) {
      console.error('Failed to update video analysis:', error)
    }
  },

  /**
   * Calculate the total storage size of video metadata.
   * Returns the combined size of all video JSON strings in bytes.
   * Note: This is metadata size only, not actual video file sizes.
   */
  async getVideoStorageSize(): Promise<number> {
    try {
      const index = await loadVideoIndex()
      if (index.length === 0) {
        return 0
      }

      const keys = index.map(getVideoKey)
      const results = await AsyncStorage.multiGet(keys)

      let totalSize = 0
      for (const [, value] of results) {
        if (value) {
          totalSize += value.length
        }
      }

      return totalSize
    } catch (error) {
      console.error('Failed to calculate video storage size:', error)
      return 0
    }
  },

  /**
   * Get the list of all video IDs.
   */
  async getVideoIndex(): Promise<string[]> {
    return loadVideoIndex()
  },
}
