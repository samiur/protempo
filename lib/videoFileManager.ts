// ABOUTME: File management layer for video storage using expo-file-system.
// ABOUTME: Handles saving, deleting, and thumbnail generation for swing videos.

import { File, Directory, Paths } from 'expo-file-system'
import * as VideoThumbnails from 'expo-video-thumbnails'
import { VideoMetadata } from '../types/video'
import { VIDEO_DIRECTORY, THUMBNAIL_DIRECTORY, THUMBNAIL_QUALITY } from '../constants/videoSettings'

/**
 * Get the directory for video storage.
 */
function getVideoDirectory(): Directory {
  return new Directory(Paths.document, VIDEO_DIRECTORY)
}

/**
 * Get the directory for thumbnail storage.
 */
function getThumbnailDirectory(): Directory {
  return new Directory(Paths.document, THUMBNAIL_DIRECTORY)
}

export const videoFileManager = {
  /**
   * Ensure the video and thumbnail directories exist.
   * Creates them if they don't.
   */
  async ensureDirectoriesExist(): Promise<void> {
    try {
      const videoDir = getVideoDirectory()
      const thumbDir = getThumbnailDirectory()

      if (!videoDir.exists) {
        videoDir.create()
      }

      if (!thumbDir.exists) {
        thumbDir.create()
      }
    } catch (error) {
      console.error('Failed to ensure directories exist:', error)
    }
  },

  /**
   * Save a video file from a temporary URI to permanent storage.
   * Returns the permanent URI, or null on failure.
   */
  async saveVideoFile(tempUri: string, videoId: string): Promise<string | null> {
    try {
      await this.ensureDirectoriesExist()

      const tempFile = new File(tempUri)
      const permanentFile = new File(getVideoDirectory(), `${videoId}.mp4`)

      tempFile.copy(permanentFile)

      return permanentFile.uri
    } catch (error) {
      console.error('Failed to save video file:', error)
      return null
    }
  },

  /**
   * Delete a video file from storage.
   */
  async deleteVideoFile(uri: string): Promise<void> {
    try {
      const file = new File(uri)
      if (file.exists) {
        file.delete()
      }
    } catch (error) {
      console.error('Failed to delete video file:', error)
    }
  },

  /**
   * Generate a thumbnail image from a video.
   * Returns the thumbnail URI, or null on failure.
   */
  async generateThumbnail(
    videoUri: string,
    videoId: string,
    timeMs: number = 0
  ): Promise<string | null> {
    try {
      await this.ensureDirectoriesExist()

      // Generate thumbnail at specified time
      const result = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: timeMs,
        quality: THUMBNAIL_QUALITY,
      })

      // Copy from temp to permanent location
      const tempFile = new File(result.uri)
      const permanentFile = new File(getThumbnailDirectory(), `${videoId}.jpg`)

      tempFile.copy(permanentFile)

      return permanentFile.uri
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)
      return null
    }
  },

  /**
   * Get video metadata from a video file.
   * Note: This is a placeholder implementation. Full metadata extraction
   * requires expo-av or similar native module access.
   */
  async getVideoMetadata(_uri: string): Promise<VideoMetadata> {
    // Note: Full implementation would use expo-av to get actual video properties.
    // For now, return defaults that will be overwritten by the camera capture hook.
    try {
      // Placeholder: In real implementation, we'd use AVMetadataReader or similar
      return {
        duration: 0,
        fps: 30,
        width: 0,
        height: 0,
      }
    } catch (error) {
      console.error('Failed to get video metadata:', error)
      return {
        duration: 0,
        fps: 30,
        width: 0,
        height: 0,
      }
    }
  },

  /**
   * Get the expected file path for a video by ID.
   */
  getVideoFilePath(videoId: string): string {
    return new File(getVideoDirectory(), `${videoId}.mp4`).uri
  },

  /**
   * Get the expected file path for a thumbnail by video ID.
   */
  getThumbnailFilePath(videoId: string): string {
    return new File(getThumbnailDirectory(), `${videoId}.jpg`).uri
  },

  /**
   * Check if a file exists at the given URI.
   */
  async fileExists(uri: string): Promise<boolean> {
    try {
      const file = new File(uri)
      return file.exists
    } catch (error) {
      console.error('Failed to check file existence:', error)
      return false
    }
  },
}
