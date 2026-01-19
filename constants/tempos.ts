// ABOUTME: Defines tempo presets for Long Game and Short Game modes.
// ABOUTME: Includes helper functions for frame-to-time conversions.

import { TempoPreset } from '../types/tempo'

/**
 * Frame rate used for tempo calculations.
 * Standard video rate matching Tour Tempo methodology.
 */
export const FRAME_RATE = 30

/**
 * Convert frames to milliseconds at 30fps.
 * @param frames - Number of frames
 * @returns Time in milliseconds
 */
export function framesToMs(frames: number): number {
  return Math.round((frames / FRAME_RATE) * 1000)
}

/**
 * Calculate total swing time for a preset in milliseconds.
 * Total time = backswing + downswing frames converted to ms.
 * @param preset - Tempo preset to calculate
 * @returns Total time in milliseconds
 */
export function getTotalTime(preset: TempoPreset): number {
  return framesToMs(preset.backswingFrames + preset.downswingFrames)
}

/**
 * Format milliseconds as seconds with 2 decimal places.
 * @param ms - Time in milliseconds
 * @returns Formatted string (e.g., "1.07s")
 */
export function formatTime(ms: number): string {
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Long Game presets with 3:1 backswing to downswing ratio.
 * Used for full swings (driver through mid-irons).
 */
export const LONG_GAME_PRESETS: readonly TempoPreset[] = [
  {
    id: '18/6',
    backswingFrames: 18,
    downswingFrames: 6,
    label: '18/6',
    description: 'Fastest tempo - aggressive swingers',
  },
  {
    id: '21/7',
    backswingFrames: 21,
    downswingFrames: 7,
    label: '21/7',
    description: 'Fast tempo - athletic players',
  },
  {
    id: '24/8',
    backswingFrames: 24,
    downswingFrames: 8,
    label: '24/8',
    description: 'Tour average - most common tempo',
  },
  {
    id: '27/9',
    backswingFrames: 27,
    downswingFrames: 9,
    label: '27/9',
    description: 'Smooth tempo - deliberate swingers',
  },
  {
    id: '30/10',
    backswingFrames: 30,
    downswingFrames: 10,
    label: '30/10',
    description: 'Slowest tempo - maximum control',
  },
] as const

/**
 * Short Game presets with 2:1 backswing to downswing ratio.
 * Used for chips, pitches, and partial swings.
 */
export const SHORT_GAME_PRESETS: readonly TempoPreset[] = [
  {
    id: '14/7',
    backswingFrames: 14,
    downswingFrames: 7,
    label: '14/7',
    description: 'Quick chip - bump and run',
  },
  {
    id: '16/8',
    backswingFrames: 16,
    downswingFrames: 8,
    label: '16/8',
    description: 'Standard chip - versatile',
  },
  {
    id: '18/9',
    backswingFrames: 18,
    downswingFrames: 9,
    label: '18/9',
    description: 'Medium pitch - most common',
  },
  {
    id: '20/10',
    backswingFrames: 20,
    downswingFrames: 10,
    label: '20/10',
    description: 'Longer pitch - more loft',
  },
  {
    id: '22/11',
    backswingFrames: 22,
    downswingFrames: 11,
    label: '22/11',
    description: 'Full pitch - maximum height',
  },
] as const

/**
 * Get a preset by ID from a list of presets.
 * @param presets - Array of presets to search
 * @param id - Preset ID to find
 * @returns Matching preset or undefined
 */
export function getPresetById(
  presets: readonly TempoPreset[],
  id: string
): TempoPreset | undefined {
  return presets.find((p) => p.id === id)
}

/**
 * Get all preset IDs from a list.
 * @param presets - Array of presets
 * @returns Array of preset IDs
 */
export function getPresetIds(presets: readonly TempoPreset[]): string[] {
  return presets.map((p) => p.id)
}
