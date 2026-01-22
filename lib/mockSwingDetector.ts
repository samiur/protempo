// ABOUTME: Mock implementation of SwingDetector for development and testing.
// ABOUTME: Simulates ML detection with realistic timing and confidence values.

import type { SwingDetector, SwingDetectionResult } from '../types/swingDetection'

/**
 * Default video duration in milliseconds for mock detection.
 * Used when actual duration cannot be determined from video.
 */
const DEFAULT_VIDEO_DURATION_MS = 5000

/**
 * Frame position percentages for realistic swing timing.
 * Based on typical golf swing phases.
 */
const TAKEAWAY_PERCENT = 0.1 // Club starts moving at ~10% of video
const TOP_PERCENT = 0.6 // Top of backswing at ~60% of video
const IMPACT_PERCENT = 0.8 // Impact at ~80% of video

/**
 * Confidence range for mock detection results.
 * Real ML would have varying confidence based on video quality.
 */
const MIN_CONFIDENCE = 0.7
const MAX_CONFIDENCE = 0.95

/**
 * Simulated processing delay in milliseconds.
 * Makes the mock feel more realistic.
 */
const INIT_DELAY_MS = 100
const DETECTION_DELAY_MS = 500

/**
 * Create a mock swing detector for development.
 * Simulates ML detection with delays and realistic frame positions.
 *
 * @returns SwingDetector implementation using mock logic
 */
export function createMockSwingDetector(): SwingDetector {
  let ready = false

  return {
    isReady(): boolean {
      return ready
    },

    async initialize(): Promise<void> {
      // Simulate model loading delay
      await delay(INIT_DELAY_MS)
      ready = true
    },

    async detectSwingPhases(_videoUri: string, fps: number): Promise<SwingDetectionResult> {
      if (!ready) {
        throw new Error('Detector not initialized')
      }

      const startTime = Date.now()

      // Simulate processing delay
      await delay(DETECTION_DELAY_MS)

      // Calculate total frames based on assumed video duration
      // In a real implementation, we'd extract this from the video
      const totalFrames = Math.floor((DEFAULT_VIDEO_DURATION_MS / 1000) * fps)

      // Calculate frame positions with slight randomization
      // This simulates natural variation in swing timing
      const takeawayFrame = Math.floor(totalFrames * TAKEAWAY_PERCENT * jitter())
      const topFrame = Math.floor(totalFrames * TOP_PERCENT * jitter())
      const impactFrame = Math.floor(totalFrames * IMPACT_PERCENT * jitter())

      // Ensure frames are in correct order
      const orderedFrames = ensureFrameOrder(takeawayFrame, topFrame, impactFrame)

      // Generate random confidence within range
      const confidence = MIN_CONFIDENCE + Math.random() * (MAX_CONFIDENCE - MIN_CONFIDENCE)

      const processingTimeMs = Date.now() - startTime

      return {
        takeawayFrame: orderedFrames.takeaway,
        topFrame: orderedFrames.top,
        impactFrame: orderedFrames.impact,
        confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
        processingTimeMs,
      }
    },

    dispose(): void {
      ready = false
    },
  }
}

/**
 * Create a promise that resolves after a delay.
 * @param ms - Milliseconds to wait
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Generate a random jitter multiplier for natural variation.
 * Returns a value between 0.9 and 1.1 (±10% variation).
 */
function jitter(): number {
  return 0.9 + Math.random() * 0.2
}

/**
 * Ensure frame positions are in correct chronological order.
 * Adjusts frames if they end up out of order due to jitter.
 *
 * @param takeaway - Initial takeaway frame
 * @param top - Initial top frame
 * @param impact - Initial impact frame
 * @returns Object with ordered frame numbers
 */
function ensureFrameOrder(
  takeaway: number,
  top: number,
  impact: number
): { takeaway: number; top: number; impact: number } {
  const minGap = 5
  const [orderedTakeaway, sortedTop, sortedImpact] = [takeaway, top, impact].sort((a, b) => a - b)

  // Ensure minimum gaps between frames (at least 5 frames apart)
  const orderedTop = Math.max(sortedTop, orderedTakeaway + minGap)
  const orderedImpact = Math.max(sortedImpact, orderedTop + minGap)

  return { takeaway: orderedTakeaway, top: orderedTop, impact: orderedImpact }
}
