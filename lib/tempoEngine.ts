// ABOUTME: Core timing calculation engine for tempo sequences.
// ABOUTME: Pure functions for calculating when to play each tone in a swing cycle.

import { TempoPreset } from '../types/tempo'
import { framesToMs } from '../constants/tempos'

/**
 * Represents the timing of all three tones in a single swing cycle.
 * All times are in milliseconds.
 */
export interface ToneSequence {
  /** Time for tone 1 (start of takeaway) - always 0 */
  tone1Time: number
  /** Time for tone 2 (top of backswing, start downswing) */
  tone2Time: number
  /** Time for tone 3 (impact) */
  tone3Time: number
  /** Total cycle time including delay between reps */
  totalCycleTime: number
}

/**
 * Configuration for the tempo engine calculations.
 */
export interface TempoEngineConfig {
  /** The tempo preset defining backswing/downswing frames */
  preset: TempoPreset
  /** Delay between reps in seconds (2-10) */
  delayBetweenReps: number
}

/**
 * Represents the next tone to play in a sequence.
 */
export interface NextTone {
  /** Which tone number (1, 2, or 3) */
  toneNumber: 1 | 2 | 3
  /** When to play this tone in milliseconds */
  time: number
}

/**
 * Calculate the tone sequence for a given tempo configuration.
 *
 * - Tone 1 is always at 0ms (start takeaway)
 * - Tone 2 is at (backswingFrames / 30) * 1000 ms (start downswing)
 * - Tone 3 is at tone2Time + (downswingFrames / 30) * 1000 ms (impact)
 * - totalCycleTime = tone3Time + (delayBetweenReps * 1000)
 *
 * @param config - The tempo engine configuration
 * @returns The calculated tone sequence
 */
export function calculateToneSequence(config: TempoEngineConfig): ToneSequence {
  const { preset, delayBetweenReps } = config

  const tone1Time = 0
  const tone2Time = framesToMs(preset.backswingFrames)
  const tone3Time = tone2Time + framesToMs(preset.downswingFrames)
  const totalCycleTime = tone3Time + delayBetweenReps * 1000

  return {
    tone1Time,
    tone2Time,
    tone3Time,
    totalCycleTime,
  }
}

/**
 * Generate absolute timing for multiple reps.
 *
 * Returns an array of [tone1, tone2, tone3] absolute times for each rep.
 * Each subsequent rep starts after the previous rep's totalCycleTime.
 *
 * @param sequence - The base tone sequence
 * @param repCount - Number of reps to generate timings for
 * @returns Array of timing arrays, one per rep
 */
export function generateRepTimings(sequence: ToneSequence, repCount: number): number[][] {
  if (repCount <= 0) {
    return []
  }

  const timings: number[][] = []

  for (let rep = 0; rep < repCount; rep++) {
    const offset = rep * sequence.totalCycleTime
    timings.push([
      offset + sequence.tone1Time,
      offset + sequence.tone2Time,
      offset + sequence.tone3Time,
    ])
  }

  return timings
}

/**
 * Get the next tone to play given the current time in a cycle.
 *
 * This function determines which tone should be played next based on the
 * current position within a single rep cycle.
 *
 * @param currentTime - Current time in milliseconds within the cycle
 * @param sequence - The tone sequence defining tone times
 * @returns The next tone to play, or null if the cycle is complete
 */
export function getNextToneTime(currentTime: number, sequence: ToneSequence): NextTone | null {
  // If we haven't reached tone 1 yet
  if (currentTime < sequence.tone1Time) {
    return { toneNumber: 1, time: sequence.tone1Time }
  }

  // If we're between tone 1 and tone 2 (tone 1 has played, tone 2 is next)
  if (currentTime < sequence.tone2Time) {
    return { toneNumber: 2, time: sequence.tone2Time }
  }

  // If we're between tone 2 and tone 3 (tone 2 has played, tone 3 is next)
  if (currentTime < sequence.tone3Time) {
    return { toneNumber: 3, time: sequence.tone3Time }
  }

  // Cycle is complete (tone 3 has played)
  return null
}
