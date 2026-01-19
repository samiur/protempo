// ABOUTME: Audio manager for loading and playing tempo tone sounds.
// ABOUTME: Wraps expo-av with preloading and low-latency playback support.

import { Audio } from 'expo-av'
import type { AVPlaybackSource } from 'expo-av'
import type { ToneStyle } from '../types/tempo'

/**
 * Audio manager interface for tempo tone playback.
 */
export interface AudioManager {
  /** Load all audio files into memory for instant playback */
  preloadAll(): Promise<void>
  /** Play a specific tone (1=back, 2=down, 3=hit) */
  playTone(toneNumber: 1 | 2 | 3): Promise<void>
  /** Switch between beep and voice tone styles */
  setToneStyle(style: ToneStyle): Promise<void>
  /** Get current tone style */
  getToneStyle(): ToneStyle
  /** Adjust playback volume (0-1) */
  setVolume(volume: number): void
  /** Release all audio resources */
  unloadAll(): Promise<void>
  /** Check if audio is loaded and ready to play */
  isLoaded(): boolean
}

// Audio source references - require() is mandatory for Metro bundler asset loading
/* eslint-disable @typescript-eslint/no-require-imports */
const AUDIO_SOURCES = {
  beep: require('../assets/audio/tone-beep.wav') as AVPlaybackSource,
  voiceBack: require('../assets/audio/tone-voice-back.wav') as AVPlaybackSource,
  voiceDown: require('../assets/audio/tone-voice-down.wav') as AVPlaybackSource,
  voiceHit: require('../assets/audio/tone-voice-hit.wav') as AVPlaybackSource,
}
/* eslint-enable @typescript-eslint/no-require-imports */

interface LoadedSounds {
  beep?: Audio.Sound
  voiceBack?: Audio.Sound
  voiceDown?: Audio.Sound
  voiceHit?: Audio.Sound
}

/**
 * Creates a new AudioManager instance.
 * Each instance manages its own set of loaded sounds.
 */
export function createAudioManager(): AudioManager {
  let loaded = false
  let toneStyle: ToneStyle = 'beep'
  let currentVolume = 1
  let sounds: LoadedSounds = {}

  /**
   * Configure expo-av for low latency and background playback.
   */
  async function configureAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    })
  }

  /**
   * Load a single sound file.
   */
  async function loadSound(source: AVPlaybackSource): Promise<Audio.Sound> {
    const { sound } = await Audio.Sound.createAsync(source)
    await sound.setVolumeAsync(currentVolume)
    return sound
  }

  /**
   * Load all sounds for the current tone style.
   */
  async function loadSoundsForStyle(style: ToneStyle): Promise<void> {
    if (style === 'beep') {
      sounds.beep = await loadSound(AUDIO_SOURCES.beep)
    } else {
      sounds.voiceBack = await loadSound(AUDIO_SOURCES.voiceBack)
      sounds.voiceDown = await loadSound(AUDIO_SOURCES.voiceDown)
      sounds.voiceHit = await loadSound(AUDIO_SOURCES.voiceHit)
    }
  }

  /**
   * Unload all currently loaded sounds.
   */
  async function unloadCurrentSounds(): Promise<void> {
    const unloadPromises: Promise<unknown>[] = []

    if (sounds.beep) {
      unloadPromises.push(sounds.beep.unloadAsync())
    }
    if (sounds.voiceBack) {
      unloadPromises.push(sounds.voiceBack.unloadAsync())
    }
    if (sounds.voiceDown) {
      unloadPromises.push(sounds.voiceDown.unloadAsync())
    }
    if (sounds.voiceHit) {
      unloadPromises.push(sounds.voiceHit.unloadAsync())
    }

    await Promise.all(unloadPromises)
    sounds = {}
  }

  /**
   * Get the correct sound for the given tone number.
   */
  function getSoundForTone(toneNumber: 1 | 2 | 3): Audio.Sound | undefined {
    if (toneStyle === 'beep') {
      return sounds.beep
    }

    switch (toneNumber) {
      case 1:
        return sounds.voiceBack
      case 2:
        return sounds.voiceDown
      case 3:
        return sounds.voiceHit
    }
  }

  /**
   * Apply volume to all loaded sounds.
   */
  function applyVolumeToAll(volume: number): void {
    const allSounds = [sounds.beep, sounds.voiceBack, sounds.voiceDown, sounds.voiceHit].filter(
      (s): s is Audio.Sound => s !== undefined
    )

    for (const sound of allSounds) {
      sound.setVolumeAsync(volume)
    }
  }

  return {
    async preloadAll(): Promise<void> {
      if (loaded) {
        return
      }

      await configureAudioMode()
      await loadSoundsForStyle(toneStyle)
      loaded = true
    },

    async playTone(toneNumber: 1 | 2 | 3): Promise<void> {
      if (!loaded) {
        throw new Error('Audio not loaded. Call preloadAll() first.')
      }

      const sound = getSoundForTone(toneNumber)
      if (!sound) {
        throw new Error(`No sound loaded for tone ${toneNumber}`)
      }

      // Reset to beginning for rapid successive plays
      await sound.setPositionAsync(0)
      await sound.playAsync()
    },

    async setToneStyle(style: ToneStyle): Promise<void> {
      if (style === toneStyle) {
        return
      }

      const wasLoaded = loaded

      if (wasLoaded) {
        await unloadCurrentSounds()
        loaded = false
      }

      toneStyle = style

      if (wasLoaded) {
        await loadSoundsForStyle(style)
        loaded = true
      }
    },

    getToneStyle(): ToneStyle {
      return toneStyle
    },

    setVolume(volume: number): void {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      currentVolume = clampedVolume

      if (loaded) {
        applyVolumeToAll(clampedVolume)
      }
    },

    async unloadAll(): Promise<void> {
      if (!loaded) {
        return
      }

      await unloadCurrentSounds()
      loaded = false
    },

    isLoaded(): boolean {
      return loaded
    },
  }
}
