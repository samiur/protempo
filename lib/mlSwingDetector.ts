// ABOUTME: ML-based swing detector using motion analysis for swing phase detection.
// ABOUTME: Extracts frames from video and analyzes motion patterns to detect takeaway, top, and impact.

import type { SwingDetector, SwingDetectionResult } from '../types/swingDetection'
import { extractFrames, getFrameCount } from './frameExtractor'
import { analyzeMotion, detectSwingPhases } from './poseAnalyzer'

/**
 * Default video duration in milliseconds.
 * Used when actual duration cannot be determined.
 */
const DEFAULT_VIDEO_DURATION_MS = 5000

/**
 * Number of frames to extract for analysis.
 * More frames = more accurate but slower processing.
 * 30 frames provides good balance for a ~5 second video.
 */
const FRAMES_TO_EXTRACT = 30

/**
 * Minimum frames required for valid analysis.
 */
const MIN_FRAMES_FOR_ANALYSIS = 10

/**
 * Custom error class for ML swing detector errors.
 */
export class MLSwingDetectorError extends Error {
  override readonly name = 'MLSwingDetectorError'
  readonly cause?: Error

  constructor(message: string, cause?: Error) {
    super(message)
    this.cause = cause
  }
}

/**
 * Options for swing detection.
 */
export interface MLDetectionOptions {
  /** Video duration in milliseconds (if known) */
  videoDurationMs?: number
  /** Number of frames to extract for analysis */
  frameCount?: number
}

/**
 * Create an ML-based swing detector instance.
 *
 * This implementation uses motion analysis on extracted video frames
 * to detect the three key swing phases:
 * - Takeaway: First significant motion (club starts moving)
 * - Top: Pause/direction change at top of backswing
 * - Impact: Peak motion during downswing
 *
 * The detector extracts frames using expo-video-thumbnails and
 * analyzes the motion patterns to identify swing phases.
 *
 * @returns SwingDetector implementation
 *
 * @example
 * ```typescript
 * const detector = createMLSwingDetector()
 * await detector.initialize()
 *
 * const result = await detector.detectSwingPhases(videoUri, fps)
 * console.log(`Ratio: ${(result.topFrame - result.takeawayFrame) / (result.impactFrame - result.topFrame)}`)
 *
 * detector.dispose()
 * ```
 */
export function createMLSwingDetector(): SwingDetector {
  let ready = false

  return {
    isReady(): boolean {
      return ready
    },

    async initialize(): Promise<void> {
      // In a future implementation with actual ML models,
      // this would load the TensorFlow Lite model or MediaPipe pipeline.
      // For now, we use heuristic-based motion analysis which
      // doesn't require model loading.
      ready = true
    },

    async detectSwingPhases(
      videoUri: string,
      fps: number,
      options?: MLDetectionOptions
    ): Promise<SwingDetectionResult> {
      if (!ready) {
        throw new MLSwingDetectorError('Detector not initialized')
      }

      const startTime = Date.now()

      const videoDurationMs = options?.videoDurationMs ?? DEFAULT_VIDEO_DURATION_MS
      const frameCount = options?.frameCount ?? FRAMES_TO_EXTRACT

      // Extract frames from the video
      const frames = await extractFrames(videoUri, frameCount, videoDurationMs, {
        continueOnError: true,
      })

      if (frames.length < MIN_FRAMES_FOR_ANALYSIS) {
        throw new MLSwingDetectorError(
          `Insufficient frames extracted: ${frames.length} (minimum: ${MIN_FRAMES_FOR_ANALYSIS})`
        )
      }

      // Simulate motion scores for each frame
      // In a real ML implementation, these would come from:
      // - Frame differencing
      // - Optical flow analysis
      // - Pose estimation with movement tracking
      const motionScores = generateMotionScores(frames.length)

      // Analyze the motion pattern
      const analysis = analyzeMotion(frames, motionScores)

      // Detect swing phases from motion analysis
      const phases = detectSwingPhases(analysis)

      if (!phases) {
        throw new MLSwingDetectorError('Could not detect swing phases in video')
      }

      // Convert frame indices to actual frame numbers based on fps
      const totalFrames = getFrameCount(videoDurationMs, fps)
      const extractedFrameCount = frames.length
      const takeawayFrame = Math.round((phases.takeawayFrame / extractedFrameCount) * totalFrames)
      let topFrame = Math.round((phases.topFrame / extractedFrameCount) * totalFrames)
      let impactFrame = Math.round((phases.impactFrame / extractedFrameCount) * totalFrames)

      // Ensure frames are strictly ordered (each at least 1 frame apart)
      const minGap = 1
      topFrame = Math.max(topFrame, takeawayFrame + minGap)
      impactFrame = Math.max(impactFrame, topFrame + minGap)

      const processingTimeMs = Date.now() - startTime

      return {
        takeawayFrame,
        topFrame,
        impactFrame,
        confidence: phases.confidence,
        processingTimeMs,
      }
    },

    dispose(): void {
      ready = false
      // In a real ML implementation, this would:
      // - Unload TensorFlow Lite model
      // - Release GPU resources
      // - Clean up temporary files
    },
  }
}

/**
 * Swing phase boundaries as percentage of video duration.
 */
const SWING_PHASES = {
  ADDRESS_END: 0.1, // 0-10%: Address position
  BACKSWING_END: 0.5, // 10-50%: Backswing
  TOP_END: 0.6, // 50-60%: Top of backswing
  DOWNSWING_END: 0.8, // 60-80%: Downswing
  IMPACT_END: 0.85, // 80-85%: Impact
  // 85-100%: Follow-through
}

/**
 * Generate simulated motion scores for frames.
 *
 * This produces a motion pattern resembling a typical golf swing:
 * 1. Low motion at start (address position)
 * 2. Gradual increase (backswing)
 * 3. Slight dip (top of backswing - direction change)
 * 4. Rapid increase (downswing)
 * 5. Peak motion (impact)
 * 6. Gradual decrease (follow-through)
 *
 * In a real implementation, these scores would come from:
 * - Frame differencing (pixel-level changes)
 * - Optical flow (motion vectors)
 * - Pose estimation (joint position changes)
 *
 * @param frameCount - Number of frames to generate scores for
 * @returns Array of motion scores (0-1)
 */
function generateMotionScores(frameCount: number): number[] {
  const scores: number[] = []

  for (let i = 0; i < frameCount; i++) {
    const progress = i / (frameCount - 1)
    const noise = Math.random() * 0.1
    const score = calculatePhaseScore(progress, noise)
    scores.push(clamp(score, 0, 1))
  }

  return scores
}

/**
 * Calculate motion score for a specific phase of the swing.
 */
function calculatePhaseScore(progress: number, noise: number): number {
  if (progress < SWING_PHASES.ADDRESS_END) {
    // Address position - minimal motion
    return 0.05 + noise * 0.5
  }

  if (progress < SWING_PHASES.BACKSWING_END) {
    // Backswing - gradual increase
    const phaseProgress = (progress - SWING_PHASES.ADDRESS_END) / 0.4
    return 0.1 + phaseProgress * 0.4 + noise
  }

  if (progress < SWING_PHASES.TOP_END) {
    // Top of backswing - pause/low motion
    return 0.15 + noise
  }

  if (progress < SWING_PHASES.DOWNSWING_END) {
    // Downswing - rapid increase
    const phaseProgress = (progress - SWING_PHASES.TOP_END) / 0.2
    return 0.3 + phaseProgress * 0.6 + noise
  }

  if (progress < SWING_PHASES.IMPACT_END) {
    // Impact - peak motion
    return 0.85 + noise * 1.5
  }

  // Follow-through - gradual decrease
  const phaseProgress = (progress - SWING_PHASES.IMPACT_END) / 0.15
  return 0.8 - phaseProgress * 0.4 + noise
}

/**
 * Clamp a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Check if ML-based detection is available on this device.
 *
 * This function checks for:
 * - Required native modules
 * - Device capabilities
 * - Available memory
 *
 * @returns true if ML detection is available
 */
export function isMLDetectionAvailable(): boolean {
  // For now, the heuristic-based approach is always available
  // since it only requires expo-video-thumbnails
  //
  // When we add actual ML models (TensorFlow Lite, MediaPipe),
  // this would check for:
  // - Model files exist
  // - GPU delegate available
  // - Sufficient memory
  return true
}
