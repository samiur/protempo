// ABOUTME: TypeScript type definitions for video-related concepts.
// ABOUTME: Defines interfaces for swing videos, analysis results, and video metadata.

/**
 * Analysis result for a golf swing video.
 * Frame numbers are relative to the video's frame rate.
 */
export interface SwingAnalysis {
  /** Frame number where the takeaway begins (club starts moving) */
  takeawayFrame: number
  /** Frame number at the top of the backswing */
  topFrame: number
  /** Frame number at impact (ball strike) */
  impactFrame: number
  /** Number of frames in the backswing phase (topFrame - takeawayFrame) */
  backswingFrames: number
  /** Number of frames in the downswing phase (impactFrame - topFrame) */
  downswingFrames: number
  /** Ratio of backswing to downswing (backswingFrames / downswingFrames) */
  ratio: number
  /** Confidence score from ML detection (0-1) */
  confidence: number
  /** Whether the frame markers were manually adjusted by user */
  manuallyAdjusted: boolean
}

/**
 * Metadata extracted from a video file.
 * These are the technical properties of the video.
 */
export interface VideoMetadata {
  /** Duration of the video in milliseconds */
  duration: number
  /** Frames per second of the video */
  fps: number
  /** Width of the video in pixels */
  width: number
  /** Height of the video in pixels */
  height: number
}

/**
 * A recorded swing video with optional analysis.
 * Videos are stored in the document directory with metadata in AsyncStorage.
 */
export interface SwingVideo {
  /** Unique identifier (UUID) */
  id: string
  /** File system path to the video (file:// URI) */
  uri: string
  /** File system path to the thumbnail image, or null if not generated */
  thumbnailUri: string | null
  /** Unix timestamp when the video was recorded */
  createdAt: number
  /** Duration of the video in milliseconds */
  duration: number
  /** Frames per second of the video */
  fps: number
  /** Width of the video in pixels */
  width: number
  /** Height of the video in pixels */
  height: number
  /** Analysis result if the video has been analyzed, or null */
  analysis: SwingAnalysis | null
  /** Optional link to a practice session ID */
  sessionId: string | null
}
