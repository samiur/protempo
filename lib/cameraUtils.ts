// ABOUTME: Utility functions for camera and video capture operations.
// ABOUTME: Provides video quality selection and time formatting helpers.

import { MIN_FPS, TARGET_FPS } from '../constants/videoSettings'

/**
 * Camera capabilities detected from the device.
 */
export interface CameraCapabilities {
  /** Maximum frames per second the camera supports */
  maxFps: number
  /** Whether the camera supports slow motion recording */
  supportsSlowMotion: boolean
  /** Supported aspect ratios (e.g., '16:9', '4:3') */
  supportedRatios: string[]
}

/**
 * Video quality preset options.
 */
export type VideoQuality = '2160p' | '1080p' | '720p' | '480p'

/**
 * Selects the best video quality based on camera capabilities.
 *
 * Higher FPS capabilities allow for higher quality recording because:
 * - 240fps cameras (slow-motion) can record at 4K
 * - 60-120fps cameras work best at 1080p
 * - Lower FPS cameras should use 720p to maintain performance
 *
 * @param capabilities - The detected camera capabilities
 * @returns The recommended video quality preset
 */
export function getBestVideoQuality(capabilities: CameraCapabilities): VideoQuality {
  const { maxFps } = capabilities

  if (maxFps >= TARGET_FPS) {
    return '2160p'
  }

  if (maxFps >= MIN_FPS) {
    return '1080p'
  }

  return '720p'
}

/**
 * Formats a duration in milliseconds as a recording time string.
 *
 * @param ms - Duration in milliseconds
 * @returns Formatted string in "M:SS" format (e.g., "0:05", "1:30")
 */
export function formatRecordingTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
