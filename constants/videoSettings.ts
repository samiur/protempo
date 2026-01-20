// ABOUTME: Configuration constants for video recording and storage.
// ABOUTME: Defines limits, quality settings, and directory paths for video features.

/**
 * Maximum duration for recorded videos in milliseconds.
 * 10 seconds is enough to capture a full swing without excessive storage use.
 */
export const MAX_VIDEO_DURATION = 10000

/**
 * Target frames per second for recording.
 * 240fps allows for smooth slow-motion analysis.
 */
export const TARGET_FPS = 240

/**
 * Minimum acceptable frames per second.
 * Below 60fps, frame-by-frame analysis becomes difficult.
 */
export const MIN_FPS = 60

/**
 * Subdirectory within the document directory for storing videos.
 */
export const VIDEO_DIRECTORY = 'videos'

/**
 * Subdirectory within the document directory for storing thumbnails.
 */
export const THUMBNAIL_DIRECTORY = 'thumbnails'

/**
 * Storage key prefix for video metadata in AsyncStorage.
 */
export const VIDEO_STORAGE_KEY_PREFIX = 'protempo:video:'

/**
 * Storage key for the video index (list of all video IDs).
 */
export const VIDEO_INDEX_KEY = 'protempo:video:index'

/**
 * Quality setting for generated thumbnails (0-1).
 */
export const THUMBNAIL_QUALITY = 0.7

/**
 * Width of generated thumbnails in pixels.
 * Height is calculated to maintain aspect ratio.
 */
export const THUMBNAIL_WIDTH = 320
