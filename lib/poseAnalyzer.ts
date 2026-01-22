// ABOUTME: Motion analysis utilities for detecting swing phases from video frames.
// ABOUTME: Uses motion scores to identify takeaway, top, and impact positions.

import type { ExtractedFrame } from './frameExtractor'

/**
 * Result of motion analysis for a single frame.
 */
export interface MotionAnalysisResult {
  /** Index of the frame in the sequence (0-indexed) */
  frameIndex: number
  /** Time position in milliseconds */
  timeMs: number
  /** Motion score relative to previous frame (0-1, higher = more motion) */
  motionScore: number
}

/**
 * Default motion threshold for detecting significant movement.
 * Values below this are considered "still" or "minimal motion".
 */
const DEFAULT_MOTION_THRESHOLD = 0.1

/**
 * Analyze motion between consecutive video frames.
 *
 * This function takes extracted frames and pre-computed motion scores,
 * combining them into a structured analysis result for further processing.
 *
 * In a real ML implementation, motion scores would be computed from
 * image differencing or pose estimation. For now, they are provided
 * externally (from ML or heuristics).
 *
 * @param frames - Array of extracted frames
 * @param motionScores - Motion score for each frame (0-1)
 * @returns Array of motion analysis results
 * @throws Error if frames and scores length mismatch
 *
 * @example
 * ```typescript
 * const frames = await extractFrames(videoUri, 30, durationMs)
 * const scores = await computeMotionScores(frames) // ML or heuristic
 * const analysis = analyzeMotion(frames, scores)
 * ```
 */
export function analyzeMotion(
  frames: ExtractedFrame[],
  motionScores: number[]
): MotionAnalysisResult[] {
  if (frames.length !== motionScores.length) {
    throw new Error('Frames and motion scores must have the same length')
  }

  return frames.map((frame, index) => ({
    frameIndex: index,
    timeMs: frame.timeMs,
    motionScore: motionScores[index],
  }))
}

/**
 * Find the frame with the highest motion score.
 *
 * @param analysis - Array of motion analysis results
 * @returns The frame with peak motion, or null if empty
 *
 * @example
 * ```typescript
 * const peak = detectPeakMotion(analysis)
 * console.log(`Peak motion at frame ${peak.frameIndex}`)
 * ```
 */
export function detectPeakMotion(
  analysis: MotionAnalysisResult[]
): MotionAnalysisResult | null {
  if (analysis.length === 0) {
    return null
  }

  return analysis.reduce((max, current) =>
    current.motionScore > max.motionScore ? current : max
  )
}

/**
 * Find the first frame where motion exceeds a threshold.
 *
 * This is useful for detecting the start of a swing (takeaway),
 * where the golfer begins moving from a static address position.
 *
 * @param analysis - Array of motion analysis results
 * @param threshold - Minimum motion score to consider (default: 0.1)
 * @returns First frame exceeding threshold, or null if none found
 *
 * @example
 * ```typescript
 * const takeaway = findMotionStart(analysis, 0.1)
 * console.log(`Takeaway at frame ${takeaway.frameIndex}`)
 * ```
 */
export function findMotionStart(
  analysis: MotionAnalysisResult[],
  threshold: number = DEFAULT_MOTION_THRESHOLD
): MotionAnalysisResult | null {
  return analysis.find((result) => result.motionScore > threshold) ?? null
}

/**
 * Find the frame with maximum motion within a specified range.
 *
 * @param analysis - Array of motion analysis results
 * @param startIndex - Start of search range (inclusive)
 * @param endIndex - End of search range (exclusive)
 * @returns Frame with peak motion in range, or null if range is empty
 *
 * @example
 * ```typescript
 * // Find peak motion between frames 10 and 50
 * const peak = findMotionPeak(analysis, 10, 50)
 * ```
 */
export function findMotionPeak(
  analysis: MotionAnalysisResult[],
  startIndex: number,
  endIndex: number
): MotionAnalysisResult | null {
  const range = analysis.slice(startIndex, endIndex)
  return detectPeakMotion(range)
}

/**
 * Find the first frame where motion drops below a threshold after a starting point.
 *
 * This is useful for detecting the end of a swing phase,
 * such as finding the impact point after the downswing.
 *
 * @param analysis - Array of motion analysis results
 * @param startIndex - Index to start searching from
 * @param threshold - Motion score threshold (default: 0.1)
 * @returns First frame below threshold after start, last frame if none, or null if start is invalid
 *
 * @example
 * ```typescript
 * // Find where motion ends after the peak at frame 30
 * const end = findMotionEnd(analysis, 30, 0.15)
 * ```
 */
export function findMotionEnd(
  analysis: MotionAnalysisResult[],
  startIndex: number,
  threshold: number = DEFAULT_MOTION_THRESHOLD
): MotionAnalysisResult | null {
  if (startIndex >= analysis.length) {
    return null
  }

  const searchRange = analysis.slice(startIndex)
  const found = searchRange.find((result) => result.motionScore < threshold)

  // Return the found frame, or the last frame in the range if none found
  return found ?? searchRange[searchRange.length - 1] ?? null
}

/**
 * Detect key swing phases from motion analysis.
 *
 * This function implements a heuristic algorithm to identify:
 * - Takeaway: First significant motion (club starts moving)
 * - Top: Direction change (maximum backswing position)
 * - Impact: Peak speed during downswing
 *
 * The algorithm assumes a typical golf swing pattern:
 * 1. Still period (address)
 * 2. Gradual motion increase (backswing)
 * 3. Brief pause/direction change (top)
 * 4. Rapid motion increase (downswing)
 * 5. Peak motion (impact)
 * 6. Follow-through
 *
 * @param analysis - Array of motion analysis results
 * @param options - Detection options
 * @returns Detected swing phases with frame numbers
 *
 * @example
 * ```typescript
 * const phases = detectSwingPhases(analysis)
 * console.log(`Takeaway: ${phases.takeawayFrame}`)
 * console.log(`Top: ${phases.topFrame}`)
 * console.log(`Impact: ${phases.impactFrame}`)
 * ```
 */
export function detectSwingPhases(
  analysis: MotionAnalysisResult[],
  options: {
    takeawayThreshold?: number
    topSearchRangePercent?: number
    impactSearchStartPercent?: number
  } = {}
): {
  takeawayFrame: number
  topFrame: number
  impactFrame: number
  confidence: number
} | null {
  if (analysis.length < 3) {
    return null
  }

  const {
    takeawayThreshold = 0.1,
    topSearchRangePercent = 0.7, // Search for top in first 70% of video
    impactSearchStartPercent = 0.5, // Search for impact in last 50% of video
  } = options

  const totalFrames = analysis.length

  // 1. Find takeaway (first significant motion)
  const takeaway = findMotionStart(analysis, takeawayThreshold)
  if (!takeaway) {
    return null
  }

  // 2. Find top of backswing
  // Look for a local minimum (pause) between takeaway and ~70% of video
  // This represents the direction change at the top
  const topSearchEnd = Math.floor(totalFrames * topSearchRangePercent)
  const backswingRange = analysis.slice(takeaway.frameIndex, topSearchEnd)

  // Find the local minimum (lowest motion) in the backswing range
  // This represents the pause at the top of the swing
  const topCandidate = backswingRange.reduce((min, current) =>
    current.motionScore < min.motionScore ? current : min
  )

  // 3. Find impact (peak motion in the downswing)
  // Search from the top candidate to the end
  const impactSearchStart = Math.max(
    topCandidate.frameIndex,
    Math.floor(totalFrames * impactSearchStartPercent)
  )
  const impactCandidate = findMotionPeak(analysis, impactSearchStart, totalFrames)

  if (!impactCandidate) {
    return null
  }

  // 4. Calculate confidence based on motion pattern
  // Higher confidence if:
  // - Clear motion start (takeaway distinct from still)
  // - Clear pause at top (low motion at top)
  // - Clear peak at impact (high motion at impact)
  const takeawayClarity = Math.min(takeaway.motionScore / takeawayThreshold, 1)
  const topClarity = 1 - topCandidate.motionScore // Lower motion = clearer top
  const impactClarity = impactCandidate.motionScore

  const confidence = (takeawayClarity + topClarity + impactClarity) / 3

  return {
    takeawayFrame: takeaway.frameIndex,
    topFrame: topCandidate.frameIndex,
    impactFrame: impactCandidate.frameIndex,
    confidence: Math.round(confidence * 100) / 100,
  }
}
