// ABOUTME: Pure utility functions for swing analysis calculations.
// ABOUTME: Includes ratio calculation, tempo comparison, and preset matching.

import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS } from '../constants/tempos'
import type { TempoComparison } from '../types/swingDetection'
import type { SwingAnalysis } from '../types/video'
import type { TempoPreset } from '../types/tempo'

/**
 * Tolerance for considering tempos as "similar" (within 5%).
 */
const SIMILARITY_TOLERANCE_PERCENT = 5

/**
 * Calculate the backswing to downswing ratio from frame positions.
 *
 * @param takeawayFrame - Frame number where takeaway begins
 * @param topFrame - Frame number at top of backswing
 * @param impactFrame - Frame number at impact
 * @returns Ratio of backswing frames to downswing frames
 *
 * @example
 * ```typescript
 * // Takeaway at 10, top at 40, impact at 50
 * // Backswing: 30 frames, Downswing: 10 frames
 * const ratio = calculateRatioFromFrames(10, 40, 50) // 3.0
 * ```
 */
export function calculateRatioFromFrames(
  takeawayFrame: number,
  topFrame: number,
  impactFrame: number
): number {
  const backswingFrames = topFrame - takeawayFrame
  const downswingFrames = impactFrame - topFrame

  if (downswingFrames === 0) {
    return Infinity
  }

  return backswingFrames / downswingFrames
}

/**
 * Compare detected swing analysis to a target tempo preset.
 *
 * @param analysis - The detected swing analysis
 * @param target - The target tempo preset to compare against
 * @returns Comparison result with ratio difference and classification
 *
 * @example
 * ```typescript
 * const comparison = compareToTargetTempo(analysis, LONG_GAME_PRESETS[2])
 * if (comparison.comparison === 'faster') {
 *   console.log(`${comparison.percentDifference}% faster than target`)
 * }
 * ```
 */
export function compareToTargetTempo(
  analysis: SwingAnalysis,
  target: TempoPreset
): TempoComparison {
  const detectedRatio = analysis.ratio
  const targetRatio = target.backswingFrames / target.downswingFrames

  // Calculate percent difference
  // Positive = faster (higher ratio), Negative = slower (lower ratio)
  const percentDifference = ((detectedRatio - targetRatio) / targetRatio) * 100

  // Determine comparison category
  let comparison: 'faster' | 'slower' | 'similar'

  if (Math.abs(percentDifference) <= SIMILARITY_TOLERANCE_PERCENT) {
    comparison = 'similar'
  } else if (percentDifference > 0) {
    comparison = 'faster'
  } else {
    comparison = 'slower'
  }

  return {
    detectedRatio,
    targetRatio,
    percentDifference: Math.round(percentDifference * 100) / 100,
    comparison,
  }
}

/**
 * Generate human-readable feedback text for a tempo comparison.
 *
 * @param comparison - The tempo comparison result
 * @returns Feedback message describing how detected tempo compares to target
 *
 * @example
 * ```typescript
 * const feedback = getTempoFeedback(comparison)
 * // "Your tempo is 17% faster than target"
 * // "Your tempo matches the target!"
 * ```
 */
export function getTempoFeedback(comparison: TempoComparison): string {
  if (comparison.comparison === 'similar') {
    return 'Your tempo matches the target!'
  }

  const absPercent = Math.abs(Math.round(comparison.percentDifference))
  const direction = comparison.comparison === 'faster' ? 'faster' : 'slower'
  return `Your tempo is ${absPercent}% ${direction} than target`
}

/**
 * Find the closest preset to a detected ratio.
 *
 * For mode 'long', searches LONG_GAME_PRESETS.
 * For mode 'short', searches SHORT_GAME_PRESETS.
 *
 * Since all presets in each mode have the same ratio (3:1 or 2:1),
 * returns the middle preset (24/8 for long, 18/9 for short) as the
 * "standard" recommendation.
 *
 * @param ratio - The detected backswing/downswing ratio
 * @param mode - Game mode ('long' or 'short')
 * @returns The closest matching tempo preset
 *
 * @example
 * ```typescript
 * const preset = findClosestPreset(2.8, 'long')
 * console.log(`Recommended: ${preset.label}`) // "24/8"
 * ```
 */
export function findClosestPreset(_ratio: number, mode: 'long' | 'short'): TempoPreset {
  const presets = mode === 'long' ? LONG_GAME_PRESETS : SHORT_GAME_PRESETS
  const middleIndex = Math.floor(presets.length / 2)

  // All presets in each mode have the same ratio (3:1 for long, 2:1 for short).
  // Return middle preset as the standard recommendation.
  // When variable-ratio presets are added, this can be extended to find closest match.
  return presets[middleIndex]
}
