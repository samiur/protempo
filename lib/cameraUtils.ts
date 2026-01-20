// ABOUTME: Utility functions for camera and video capture operations.
// ABOUTME: Provides camera capability detection and time formatting helpers.

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
