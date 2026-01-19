// ABOUTME: Playback service that orchestrates tempo timing and audio playback.
// ABOUTME: Manages the timing loop, state, and callbacks for tempo practice sessions.

import { TempoPreset, PlaybackMode } from '../types/tempo'
import { calculateToneSequence, ToneSequence, TempoEngineConfig } from './tempoEngine'

/**
 * Callbacks fired during playback for UI updates.
 */
export interface PlaybackCallbacks {
  /** Called when a tone is played (1=back, 2=down, 3=hit) */
  onTonePlayed: (toneNumber: 1 | 2 | 3) => void
  /** Called when a rep completes (after tone 3) */
  onRepComplete: (repCount: number) => void
  /** Called when playback starts */
  onPlaybackStart: () => void
  /** Called when playback stops */
  onPlaybackStop: () => void
}

/**
 * Function to play a tone. Provided by the audio hook.
 */
export type PlayToneFunction = (toneNumber: 1 | 2 | 3) => Promise<void>

/**
 * Configuration for the playback service.
 */
export interface PlaybackConfig {
  /** The tempo preset to use */
  preset: TempoPreset
  /** Delay between reps in seconds (2-10) */
  delayBetweenReps: number
  /** Playback mode - continuous loops, single stops after one rep */
  mode: PlaybackMode
  /** Callbacks for UI updates */
  callbacks: PlaybackCallbacks
  /** Function to play a tone (provided by useAudioManager hook) */
  playTone: PlayToneFunction
}

/**
 * Playback service interface for tempo playback control.
 */
export interface PlaybackService {
  /** Configure the service with preset, delay, mode, and callbacks */
  configure(config: PlaybackConfig): void
  /** Start playback */
  start(): Promise<void>
  /** Stop playback completely (resets rep count) */
  stop(): void
  /** Pause playback (can resume) */
  pause(): void
  /** Resume from paused state */
  resume(): void
  /** Check if currently playing (includes paused state) */
  isPlaying(): boolean
  /** Check if currently paused */
  isPaused(): boolean
  /** Get current rep count */
  getCurrentRepCount(): number
  /** Update preset during or before playback */
  setPreset(preset: TempoPreset): void
  /** Update delay during or before playback */
  setDelay(delay: number): void
}

/**
 * Creates a new PlaybackService instance.
 * Each instance manages its own playback state and audio.
 */
export function createPlaybackService(): PlaybackService {
  let config: PlaybackConfig | null = null
  let sequence: ToneSequence | null = null

  let playing = false
  let paused = false
  let repCount = 0

  let cycleStartTime = 0
  let pausedAtTime = 0
  let currentToneIndex = 0 // 0=tone1, 1=tone2, 2=tone3

  let timerId: ReturnType<typeof setTimeout> | null = null

  /**
   * Calculate the tone sequence from current config.
   */
  function updateSequence(): void {
    if (!config) return

    const engineConfig: TempoEngineConfig = {
      preset: config.preset,
      delayBetweenReps: config.delayBetweenReps,
    }
    sequence = calculateToneSequence(engineConfig)
  }

  /**
   * Get tone time by index (0, 1, or 2).
   */
  function getToneTime(index: number): number {
    if (!sequence) return 0
    switch (index) {
      case 0:
        return sequence.tone1Time
      case 1:
        return sequence.tone2Time
      case 2:
        return sequence.tone3Time
      default:
        return 0
    }
  }

  /**
   * Get tone number from index (0->1, 1->2, 2->3).
   */
  function getToneNumber(index: number): 1 | 2 | 3 {
    return (index + 1) as 1 | 2 | 3
  }

  /**
   * Clear any pending timer.
   */
  function clearTimer(): void {
    if (timerId !== null) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  /**
   * Play the current tone and schedule the next one.
   * This is synchronous to work properly with Jest fake timers.
   */
  function playCurrentTone(): void {
    if (!config || !sequence || !playing || paused) {
      return
    }

    const toneNumber = getToneNumber(currentToneIndex)

    // Play the tone (fire and forget for timing accuracy)
    config.playTone(toneNumber).catch(() => {
      // Log but continue - audio errors shouldn't stop timing
    })
    config.callbacks.onTonePlayed(toneNumber)

    // Handle rep completion
    if (currentToneIndex === 2) {
      repCount++
      config.callbacks.onRepComplete(repCount)

      // Check if we should stop (single mode)
      if (config.mode === 'single') {
        stopInternal()
        return
      }

      // Schedule next rep
      scheduleNextRep()
    } else {
      // Schedule next tone in current rep
      scheduleNextTone()
    }
  }

  /**
   * Schedule the next tone in the current rep.
   */
  function scheduleNextTone(): void {
    if (!sequence || !playing || paused) return

    const nextToneIndex = currentToneIndex + 1
    if (nextToneIndex > 2) return

    const currentTime = Date.now() - cycleStartTime
    const nextToneTime = getToneTime(nextToneIndex)
    const delay = Math.max(0, nextToneTime - currentTime)

    timerId = setTimeout(() => {
      currentToneIndex = nextToneIndex
      playCurrentTone()
    }, delay)
  }

  /**
   * Schedule the start of the next rep.
   */
  function scheduleNextRep(): void {
    if (!sequence || !playing || paused) return

    const currentTime = Date.now() - cycleStartTime
    const nextCycleStart = sequence.totalCycleTime
    const delay = Math.max(0, nextCycleStart - currentTime)

    timerId = setTimeout(() => {
      // Start new cycle
      cycleStartTime = Date.now()
      currentToneIndex = 0
      playCurrentTone()
    }, delay)
  }

  /**
   * Internal stop function that resets state.
   */
  function stopInternal(): void {
    if (!playing) return

    clearTimer()
    playing = false
    paused = false
    repCount = 0
    currentToneIndex = 0

    if (config) {
      config.callbacks.onPlaybackStop()
    }
  }

  /**
   * Resume playback from the paused position.
   */
  function resumeFromPause(): void {
    if (!config || !sequence || !paused) return

    paused = false

    // Adjust cycle start time to account for pause duration
    const pauseDuration = Date.now() - pausedAtTime
    cycleStartTime = cycleStartTime + pauseDuration

    // Figure out what tone to schedule next
    const currentTime = Date.now() - cycleStartTime

    // Check if we're in the delay period (after tone 3)
    if (currentTime >= sequence.tone3Time) {
      scheduleNextRep()
    } else if (currentTime >= sequence.tone2Time) {
      // Tone 3 is next
      currentToneIndex = 2
      const delay = Math.max(0, sequence.tone3Time - currentTime)
      timerId = setTimeout(() => playCurrentTone(), delay)
    } else if (currentTime >= sequence.tone1Time) {
      // Tone 2 is next
      currentToneIndex = 1
      const delay = Math.max(0, sequence.tone2Time - currentTime)
      timerId = setTimeout(() => playCurrentTone(), delay)
    }
  }

  return {
    configure(newConfig: PlaybackConfig): void {
      config = newConfig
      updateSequence()
    },

    async start(): Promise<void> {
      if (!config) {
        throw new Error('Playback service not configured')
      }

      if (playing && !paused) {
        return // Already playing
      }

      // Note: Audio preloading is now handled by the useAudioManager hook
      // The component should ensure audio is loaded before calling start()

      playing = true
      paused = false
      repCount = 0
      currentToneIndex = 0
      cycleStartTime = Date.now()

      config.callbacks.onPlaybackStart()

      // Play first tone immediately (synchronous for timing)
      playCurrentTone()
    },

    stop(): void {
      stopInternal()
    },

    pause(): void {
      if (!playing || paused) return

      clearTimer()
      paused = true
      pausedAtTime = Date.now()
    },

    resume(): void {
      if (!paused) return
      resumeFromPause()
    },

    isPlaying(): boolean {
      return playing
    },

    isPaused(): boolean {
      return paused
    },

    getCurrentRepCount(): number {
      return repCount
    },

    setPreset(preset: TempoPreset): void {
      if (config) {
        config.preset = preset
        updateSequence()
      }
    },

    setDelay(delay: number): void {
      if (config) {
        config.delayBetweenReps = delay
        updateSequence()
      }
    },
  }
}
