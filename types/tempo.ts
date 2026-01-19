// ABOUTME: TypeScript type definitions for tempo-related concepts.
// ABOUTME: Defines interfaces for presets, session state, and settings.

/**
 * Game mode determines the tempo ratio used.
 * - longGame: Full swing with 3:1 backswing to downswing ratio
 * - shortGame: Chip/pitch with 2:1 backswing to downswing ratio
 */
export type GameMode = 'longGame' | 'shortGame'

/**
 * Audio style for tempo cues.
 * - beep: Simple tone sounds
 * - voice: Voice prompts ("back", "down", "hit")
 */
export type ToneStyle = 'beep' | 'voice'

/**
 * Playback mode for practice sessions.
 * - continuous: Repeats indefinitely until stopped
 * - single: Plays one complete rep then stops
 */
export type PlaybackMode = 'continuous' | 'single'

/**
 * A tempo preset defines the timing for a swing.
 * Frame rate is 30fps, so frames / 30 = seconds.
 */
export interface TempoPreset {
  /** Unique identifier matching the label format (e.g., "24/8") */
  id: string
  /** Number of frames for the backswing phase */
  backswingFrames: number
  /** Number of frames for the downswing phase */
  downswingFrames: number
  /** Display name shown to user (e.g., "24/8") */
  label: string
  /** Brief description of when to use this tempo */
  description: string
}

/**
 * Current state of a practice session.
 */
export interface SessionState {
  /** Whether audio is currently playing */
  isPlaying: boolean
  /** Whether playback is paused (can resume) */
  isPaused: boolean
  /** Number of completed reps in current session */
  repCount: number
  /** Currently selected tempo preset ID */
  currentPresetId: string
  /** Seconds to wait between reps (2-10) */
  delayBetweenReps: number
  /** Whether to loop continuously or stop after one rep */
  playbackMode: PlaybackMode
  /** Which game mode is active */
  gameMode: GameMode
}

/**
 * Persistent user settings.
 */
export interface Settings {
  /** Default tempo preset for Long Game screen */
  defaultLongGamePresetId: string
  /** Default tempo preset for Short Game screen */
  defaultShortGamePresetId: string
  /** Audio cue style preference */
  toneStyle: ToneStyle
  /** Prevent screen from sleeping during practice */
  keepScreenAwake: boolean
  /** Master volume level (0-1) */
  volume: number
  /** Default delay between reps in seconds */
  delayBetweenReps: number
  /** Whether user has completed onboarding */
  hasCompletedOnboarding: boolean
}
