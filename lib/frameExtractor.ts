// ABOUTME: Utilities for extracting frames from video files.
// ABOUTME: Uses expo-video-thumbnails to extract images at specific time points.

import * as VideoThumbnails from 'expo-video-thumbnails'

/**
 * Represents a single extracted frame from a video.
 */
export interface ExtractedFrame {
  /** File URI of the extracted frame image */
  uri: string
  /** Time position in the video (milliseconds) */
  timeMs: number
  /** Width of the extracted frame in pixels */
  width: number
  /** Height of the extracted frame in pixels */
  height: number
}

/**
 * Options for frame extraction.
 */
export interface FrameExtractionOptions {
  /** Quality of the extracted image (0-1, default: 0.8) */
  quality?: number
  /** Continue extracting frames even if some fail (default: false) */
  continueOnError?: boolean
}

/**
 * Default quality for extracted frames.
 * 0.8 provides good balance between quality and file size.
 */
const DEFAULT_QUALITY = 0.8

/**
 * Extract a single frame at a specific time point in a video.
 *
 * @param videoUri - File path to the video
 * @param timeMs - Time position in milliseconds
 * @param options - Extraction options
 * @returns Extracted frame with URI and metadata
 * @throws Error if extraction fails
 *
 * @example
 * ```typescript
 * const frame = await extractFrameAt('file:///video.mp4', 1000)
 * console.log(frame.uri) // Path to extracted image
 * ```
 */
export async function extractFrameAt(
  videoUri: string,
  timeMs: number,
  options: FrameExtractionOptions = {}
): Promise<ExtractedFrame> {
  const quality = options.quality ?? DEFAULT_QUALITY

  try {
    const result = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality,
    })

    return {
      uri: result.uri,
      timeMs,
      width: result.width,
      height: result.height,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to extract frame at ${timeMs}ms: ${message}`)
  }
}

/**
 * Extract multiple frames evenly distributed across a video.
 *
 * Frames are extracted at regular intervals from start (0ms) to end (durationMs).
 * For count=5 and duration=5000ms, frames are extracted at: 0, 1250, 2500, 3750, 5000ms
 *
 * @param videoUri - File path to the video
 * @param count - Number of frames to extract (minimum 1)
 * @param durationMs - Total duration of the video in milliseconds
 * @param options - Extraction options
 * @returns Array of extracted frames
 * @throws Error if count < 1 or duration is invalid
 *
 * @example
 * ```typescript
 * // Extract 10 frames from a 5-second video
 * const frames = await extractFrames('file:///video.mp4', 10, 5000)
 * ```
 */
export async function extractFrames(
  videoUri: string,
  count: number,
  durationMs: number,
  options: FrameExtractionOptions = {}
): Promise<ExtractedFrame[]> {
  if (count < 1) {
    throw new Error('Frame count must be at least 1')
  }

  if (durationMs < 0) {
    throw new Error('Duration must be positive')
  }

  const continueOnError = options.continueOnError ?? false
  const frames: ExtractedFrame[] = []

  // Calculate time interval between frames
  // For count=1, just extract at time 0
  // For count=n, distribute n frames from 0 to durationMs
  const interval = count > 1 ? durationMs / (count - 1) : 0

  for (let i = 0; i < count; i++) {
    const timeMs = Math.round(i * interval)

    try {
      const frame = await extractFrameAt(videoUri, timeMs, options)
      frames.push(frame)
    } catch (error) {
      if (!continueOnError) {
        throw error
      }
      // Skip failed frames when continueOnError is true
    }
  }

  return frames
}

/**
 * Calculate the total number of frames in a video given duration and FPS.
 *
 * @param durationMs - Duration of the video in milliseconds
 * @param fps - Frames per second
 * @returns Total frame count (floored)
 *
 * @example
 * ```typescript
 * const totalFrames = getFrameCount(5000, 60) // 300 frames
 * ```
 */
export function getFrameCount(durationMs: number, fps: number): number {
  return Math.floor((durationMs / 1000) * fps)
}

/**
 * Calculate the time in milliseconds for a specific frame number.
 *
 * @param frameNumber - Frame number (0-indexed)
 * @param fps - Frames per second
 * @returns Time position in milliseconds
 *
 * @example
 * ```typescript
 * const timeMs = frameToTime(30, 60) // 500ms (frame 30 at 60fps)
 * ```
 */
export function frameToTime(frameNumber: number, fps: number): number {
  return Math.round((frameNumber / fps) * 1000)
}

/**
 * Calculate the frame number for a specific time position.
 *
 * @param timeMs - Time position in milliseconds
 * @param fps - Frames per second
 * @returns Frame number (0-indexed, floored)
 *
 * @example
 * ```typescript
 * const frame = timeToFrame(500, 60) // frame 30
 * ```
 */
export function timeToFrame(timeMs: number, fps: number): number {
  return Math.floor((timeMs / 1000) * fps)
}
