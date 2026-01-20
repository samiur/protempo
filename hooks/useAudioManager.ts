// ABOUTME: React hook for managing audio playback using expo-audio.
// ABOUTME: Provides preloading and playTone function for tempo training tones.

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio'
import type { AudioPlayer } from 'expo-audio'
import type { ToneStyle } from '../types/tempo'

// Audio source references - require() is mandatory for Metro bundler asset loading
/* eslint-disable @typescript-eslint/no-require-imports */
const AUDIO_SOURCES = {
  beep: require('../assets/audio/tone-beep.wav'),
  voiceBack: require('../assets/audio/tone-voice-back.wav'),
  voiceDown: require('../assets/audio/tone-voice-down.wav'),
  voiceHit: require('../assets/audio/tone-voice-hit.wav'),
  silence: require('../assets/audio/silence.wav'),
}
/* eslint-enable @typescript-eslint/no-require-imports */

export interface UseAudioManagerOptions {
  toneStyle?: ToneStyle
  volume?: number
}

export interface UseAudioManagerReturn {
  /** Play a specific tone (1=back, 2=down, 3=hit) */
  playTone: (toneNumber: 1 | 2 | 3) => Promise<void>
  /** Check if audio is loaded and ready */
  isLoaded: boolean
  /** Set the volume (0-1) */
  setVolume: (volume: number) => void
  /** Current tone style */
  toneStyle: ToneStyle
  /** Current volume level */
  currentVolume: number
  /** Activate audio session for background playback */
  activateSession: () => Promise<void>
  /** Deactivate audio session when done */
  deactivateSession: () => Promise<void>
}

/**
 * Hook for managing tempo training audio playback.
 * Uses expo-audio for modern, hook-based audio management.
 *
 * Important: Audio doesn't auto-reset in expo-audio, so we seekTo(0) before each play.
 */
export function useAudioManager(options: UseAudioManagerOptions = {}): UseAudioManagerReturn {
  const { toneStyle = 'beep', volume = 1 } = options
  const [currentVolume, setCurrentVolume] = useState(volume)
  const audioModeConfigured = useRef(false)

  // Create players based on tone style
  // For beep style: single player used for all tones
  // For voice style: three separate players
  const beepPlayer = useAudioPlayer(toneStyle === 'beep' ? AUDIO_SOURCES.beep : null)
  const voiceBackPlayer = useAudioPlayer(toneStyle === 'voice' ? AUDIO_SOURCES.voiceBack : null)
  const voiceDownPlayer = useAudioPlayer(toneStyle === 'voice' ? AUDIO_SOURCES.voiceDown : null)
  const voiceHitPlayer = useAudioPlayer(toneStyle === 'voice' ? AUDIO_SOURCES.voiceHit : null)

  // Silent audio player for keeping audio session alive during background playback
  const silencePlayer = useAudioPlayer(AUDIO_SOURCES.silence)

  // Use reactive status hooks to get loading state updates
  // The player.isLoaded property is NOT reactive - must use useAudioPlayerStatus
  const beepStatus = useAudioPlayerStatus(beepPlayer)
  const voiceBackStatus = useAudioPlayerStatus(voiceBackPlayer)
  const voiceDownStatus = useAudioPlayerStatus(voiceDownPlayer)
  const voiceHitStatus = useAudioPlayerStatus(voiceHitPlayer)

  // Configure audio mode on mount
  useEffect(() => {
    async function configureAudio() {
      if (audioModeConfigured.current) return

      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'doNotMix',
      })
      audioModeConfigured.current = true
    }

    configureAudio()
  }, [])

  // Update volume on all players when it changes
  useEffect(() => {
    const players: (AudioPlayer | null)[] = [
      beepPlayer,
      voiceBackPlayer,
      voiceDownPlayer,
      voiceHitPlayer,
    ]
    players.forEach((player) => {
      if (player) {
        player.volume = currentVolume
      }
    })
  }, [currentVolume, beepPlayer, voiceBackPlayer, voiceDownPlayer, voiceHitPlayer])

  // Check if audio is loaded using reactive status hooks
  const isLoaded =
    toneStyle === 'beep'
      ? (beepStatus?.isLoaded ?? false)
      : (voiceBackStatus?.isLoaded ?? false) &&
        (voiceDownStatus?.isLoaded ?? false) &&
        (voiceHitStatus?.isLoaded ?? false)

  // Get the correct player for a tone number
  const getPlayerForTone = useCallback(
    (toneNumber: 1 | 2 | 3): AudioPlayer | null => {
      if (toneStyle === 'beep') {
        return beepPlayer
      }

      switch (toneNumber) {
        case 1:
          return voiceBackPlayer
        case 2:
          return voiceDownPlayer
        case 3:
          return voiceHitPlayer
      }
    },
    [toneStyle, beepPlayer, voiceBackPlayer, voiceDownPlayer, voiceHitPlayer]
  )

  // Play a tone
  const playTone = useCallback(
    async (toneNumber: 1 | 2 | 3): Promise<void> => {
      const player = getPlayerForTone(toneNumber)

      if (!player) {
        throw new Error(`No player available for tone ${toneNumber}`)
      }

      if (!player.isLoaded) {
        throw new Error('Audio not loaded. Wait for isLoaded to be true.')
      }

      // expo-audio doesn't auto-reset position, so seek to start before playing
      await player.seekTo(0)
      player.play()
    },
    [getPlayerForTone]
  )

  // Set volume handler
  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setCurrentVolume(clampedVolume)
  }, [])

  // Activate audio session - starts silent loop to keep audio alive in background
  const activateSession = useCallback(async () => {
    await setIsAudioActiveAsync(true)
    if (silencePlayer && silencePlayer.isLoaded) {
      silencePlayer.loop = true
      silencePlayer.volume = 0
      silencePlayer.play()
    }
  }, [silencePlayer])

  // Deactivate audio session - stops silent loop
  const deactivateSession = useCallback(async () => {
    if (silencePlayer) {
      silencePlayer.pause()
      silencePlayer.loop = false
    }
    await setIsAudioActiveAsync(false)
  }, [silencePlayer])

  return {
    playTone,
    isLoaded,
    setVolume,
    toneStyle,
    currentVolume,
    activateSession,
    deactivateSession,
  }
}
