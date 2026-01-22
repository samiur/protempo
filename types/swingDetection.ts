// ABOUTME: TypeScript type definitions for swing detection ML interface.
// ABOUTME: Defines interfaces for detector, results, and frame analysis.

/**
 * Raw result from swing phase detection.
 * Contains the frame numbers for key swing positions and processing metadata.
 */
export interface SwingDetectionResult {
  /** Frame number where the takeaway begins (club starts moving) */
  takeawayFrame: number
  /** Frame number at the top of the backswing */
  topFrame: number
  /** Frame number at impact (ball strike) */
  impactFrame: number
  /** Confidence score from detection (0-1, higher is better) */
  confidence: number
  /** Time taken to process the video in milliseconds */
  processingTimeMs: number
}

/**
 * Interface for swing detection implementations.
 * Allows swapping between mock and real ML implementations.
 */
export interface SwingDetector {
  /**
   * Check if the detector is initialized and ready for use.
   * @returns true if ready, false if initialization needed
   */
  isReady(): boolean

  /**
   * Initialize the detector (e.g., load ML model).
   * Call this before detectSwingPhases.
   */
  initialize(): Promise<void>

  /**
   * Detect swing phases in a video.
   * @param videoUri - File path to the video
   * @param fps - Frames per second of the video
   * @returns Detection result with frame numbers and confidence
   */
  detectSwingPhases(videoUri: string, fps: number): Promise<SwingDetectionResult>

  /**
   * Clean up resources (e.g., unload ML model).
   * Call when detector is no longer needed.
   */
  dispose(): void
}

/**
 * Position of a detected object in a frame.
 * Coordinates are normalized (0-1) relative to frame dimensions.
 */
export interface FramePosition {
  /** Horizontal position (0 = left, 1 = right) */
  x: number
  /** Vertical position (0 = top, 1 = bottom) */
  y: number
}

/**
 * Body pose keypoints detected in a frame.
 * Used for tracking body position during swing.
 */
export interface BodyPose {
  /** Left shoulder position */
  leftShoulder: FramePosition | null
  /** Right shoulder position */
  rightShoulder: FramePosition | null
  /** Left hip position */
  leftHip: FramePosition | null
  /** Right hip position */
  rightHip: FramePosition | null
  /** Left wrist position (hands) */
  leftWrist: FramePosition | null
  /** Right wrist position (hands) */
  rightWrist: FramePosition | null
}

/**
 * Analysis result for a single video frame.
 * Contains detected positions and confidence score.
 */
export interface FrameAnalysis {
  /** Frame number in the video (0-indexed) */
  frame: number
  /** Detected club head position, or null if not detected */
  clubHeadPosition: FramePosition | null
  /** Detected body pose keypoints, or null if not detected */
  bodyPose: BodyPose | null
  /** Confidence score for this frame's detection (0-1) */
  confidence: number
}

/**
 * Result of comparing detected tempo to a target preset.
 */
export interface TempoComparison {
  /** Detected ratio (backswing / downswing) */
  detectedRatio: number
  /** Target ratio from preset */
  targetRatio: number
  /** Difference as a percentage (positive = faster, negative = slower) */
  percentDifference: number
  /** Whether detected tempo is faster, slower, or similar to target */
  comparison: 'faster' | 'slower' | 'similar'
}
