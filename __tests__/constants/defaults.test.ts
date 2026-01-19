// ABOUTME: Unit tests for default values and settings.
// ABOUTME: Verifies all defaults match PRD specifications.

import {
  DEFAULT_LONG_GAME_PRESET_ID,
  DEFAULT_SHORT_GAME_PRESET_ID,
  DEFAULT_DELAY_BETWEEN_REPS,
  MIN_DELAY_BETWEEN_REPS,
  MAX_DELAY_BETWEEN_REPS,
  DEFAULT_TONE_STYLE,
  DEFAULT_VOLUME,
  DEFAULT_PLAYBACK_MODE,
  DEFAULT_SETTINGS,
  DEFAULT_LONG_GAME_SESSION,
  DEFAULT_SHORT_GAME_SESSION,
} from '../../constants/defaults'
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS, getPresetById } from '../../constants/tempos'

describe('Default Constants', () => {
  describe('Preset ID Defaults', () => {
    it('should default long game to 24/8 (tour average)', () => {
      expect(DEFAULT_LONG_GAME_PRESET_ID).toBe('24/8')
    })

    it('should default short game to 18/9 (medium pitch)', () => {
      expect(DEFAULT_SHORT_GAME_PRESET_ID).toBe('18/9')
    })

    it('should reference valid long game preset', () => {
      const preset = getPresetById(LONG_GAME_PRESETS, DEFAULT_LONG_GAME_PRESET_ID)
      expect(preset).toBeDefined()
    })

    it('should reference valid short game preset', () => {
      const preset = getPresetById(SHORT_GAME_PRESETS, DEFAULT_SHORT_GAME_PRESET_ID)
      expect(preset).toBeDefined()
    })
  })

  describe('Delay Settings', () => {
    it('should default delay to 4 seconds', () => {
      expect(DEFAULT_DELAY_BETWEEN_REPS).toBe(4)
    })

    it('should have minimum delay of 2 seconds', () => {
      expect(MIN_DELAY_BETWEEN_REPS).toBe(2)
    })

    it('should have maximum delay of 10 seconds', () => {
      expect(MAX_DELAY_BETWEEN_REPS).toBe(10)
    })

    it('should have default within min/max range', () => {
      expect(DEFAULT_DELAY_BETWEEN_REPS).toBeGreaterThanOrEqual(MIN_DELAY_BETWEEN_REPS)
      expect(DEFAULT_DELAY_BETWEEN_REPS).toBeLessThanOrEqual(MAX_DELAY_BETWEEN_REPS)
    })
  })

  describe('Audio Settings', () => {
    it('should default tone style to beep', () => {
      expect(DEFAULT_TONE_STYLE).toBe('beep')
    })

    it('should default volume to 1.0 (full volume)', () => {
      expect(DEFAULT_VOLUME).toBe(1.0)
    })

    it('should have volume in valid range 0-1', () => {
      expect(DEFAULT_VOLUME).toBeGreaterThanOrEqual(0)
      expect(DEFAULT_VOLUME).toBeLessThanOrEqual(1)
    })
  })

  describe('Playback Settings', () => {
    it('should default playback mode to continuous', () => {
      expect(DEFAULT_PLAYBACK_MODE).toBe('continuous')
    })
  })

  describe('DEFAULT_SETTINGS', () => {
    it('should have correct default long game preset', () => {
      expect(DEFAULT_SETTINGS.defaultLongGamePresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
    })

    it('should have correct default short game preset', () => {
      expect(DEFAULT_SETTINGS.defaultShortGamePresetId).toBe(DEFAULT_SHORT_GAME_PRESET_ID)
    })

    it('should have correct default tone style', () => {
      expect(DEFAULT_SETTINGS.toneStyle).toBe(DEFAULT_TONE_STYLE)
    })

    it('should have keep screen awake enabled by default', () => {
      expect(DEFAULT_SETTINGS.keepScreenAwake).toBe(true)
    })

    it('should have correct default volume', () => {
      expect(DEFAULT_SETTINGS.volume).toBe(DEFAULT_VOLUME)
    })

    it('should have correct default delay', () => {
      expect(DEFAULT_SETTINGS.delayBetweenReps).toBe(DEFAULT_DELAY_BETWEEN_REPS)
    })

    it('should have onboarding not completed by default', () => {
      expect(DEFAULT_SETTINGS.hasCompletedOnboarding).toBe(false)
    })
  })

  describe('DEFAULT_LONG_GAME_SESSION', () => {
    it('should not be playing by default', () => {
      expect(DEFAULT_LONG_GAME_SESSION.isPlaying).toBe(false)
    })

    it('should not be paused by default', () => {
      expect(DEFAULT_LONG_GAME_SESSION.isPaused).toBe(false)
    })

    it('should start with 0 reps', () => {
      expect(DEFAULT_LONG_GAME_SESSION.repCount).toBe(0)
    })

    it('should use correct default preset', () => {
      expect(DEFAULT_LONG_GAME_SESSION.currentPresetId).toBe(DEFAULT_LONG_GAME_PRESET_ID)
    })

    it('should use correct default delay', () => {
      expect(DEFAULT_LONG_GAME_SESSION.delayBetweenReps).toBe(DEFAULT_DELAY_BETWEEN_REPS)
    })

    it('should use correct default playback mode', () => {
      expect(DEFAULT_LONG_GAME_SESSION.playbackMode).toBe(DEFAULT_PLAYBACK_MODE)
    })

    it('should be long game mode', () => {
      expect(DEFAULT_LONG_GAME_SESSION.gameMode).toBe('longGame')
    })
  })

  describe('DEFAULT_SHORT_GAME_SESSION', () => {
    it('should not be playing by default', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.isPlaying).toBe(false)
    })

    it('should not be paused by default', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.isPaused).toBe(false)
    })

    it('should start with 0 reps', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.repCount).toBe(0)
    })

    it('should use correct default preset', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.currentPresetId).toBe(DEFAULT_SHORT_GAME_PRESET_ID)
    })

    it('should use correct default delay', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.delayBetweenReps).toBe(DEFAULT_DELAY_BETWEEN_REPS)
    })

    it('should use correct default playback mode', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.playbackMode).toBe(DEFAULT_PLAYBACK_MODE)
    })

    it('should be short game mode', () => {
      expect(DEFAULT_SHORT_GAME_SESSION.gameMode).toBe('shortGame')
    })
  })
})
