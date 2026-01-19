// ABOUTME: Default values for app settings and session state.
// ABOUTME: These are used when no persisted settings exist.

import { Settings, SessionState, ToneStyle, PlaybackMode } from '../types/tempo'

/**
 * Default preset ID for Long Game mode.
 * 24/8 is the most common tour tempo.
 */
export const DEFAULT_LONG_GAME_PRESET_ID = '24/8'

/**
 * Default preset ID for Short Game mode.
 * 18/9 is a versatile medium pitch tempo.
 */
export const DEFAULT_SHORT_GAME_PRESET_ID = '18/9'

/**
 * Default delay between reps in seconds.
 * 4 seconds gives time to reset without losing rhythm.
 */
export const DEFAULT_DELAY_BETWEEN_REPS = 4

/**
 * Minimum delay between reps in seconds.
 */
export const MIN_DELAY_BETWEEN_REPS = 2

/**
 * Maximum delay between reps in seconds.
 */
export const MAX_DELAY_BETWEEN_REPS = 10

/**
 * Default tone style for audio cues.
 */
export const DEFAULT_TONE_STYLE: ToneStyle = 'beep'

/**
 * Default volume level (0-1).
 */
export const DEFAULT_VOLUME = 1.0

/**
 * Default playback mode.
 */
export const DEFAULT_PLAYBACK_MODE: PlaybackMode = 'continuous'

/**
 * Default settings for the app.
 * Used on first launch before any user customization.
 */
export const DEFAULT_SETTINGS: Settings = {
  defaultLongGamePresetId: DEFAULT_LONG_GAME_PRESET_ID,
  defaultShortGamePresetId: DEFAULT_SHORT_GAME_PRESET_ID,
  toneStyle: DEFAULT_TONE_STYLE,
  keepScreenAwake: true,
  volume: DEFAULT_VOLUME,
  delayBetweenReps: DEFAULT_DELAY_BETWEEN_REPS,
  hasCompletedOnboarding: false,
}

/**
 * Default session state for Long Game.
 */
export const DEFAULT_LONG_GAME_SESSION: SessionState = {
  isPlaying: false,
  isPaused: false,
  repCount: 0,
  currentPresetId: DEFAULT_LONG_GAME_PRESET_ID,
  delayBetweenReps: DEFAULT_DELAY_BETWEEN_REPS,
  playbackMode: DEFAULT_PLAYBACK_MODE,
  gameMode: 'longGame',
}

/**
 * Default session state for Short Game.
 */
export const DEFAULT_SHORT_GAME_SESSION: SessionState = {
  isPlaying: false,
  isPaused: false,
  repCount: 0,
  currentPresetId: DEFAULT_SHORT_GAME_PRESET_ID,
  delayBetweenReps: DEFAULT_DELAY_BETWEEN_REPS,
  playbackMode: DEFAULT_PLAYBACK_MODE,
  gameMode: 'shortGame',
}
