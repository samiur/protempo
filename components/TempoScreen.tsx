// ABOUTME: Shared tempo screen component for both Long Game and Short Game modes.
// ABOUTME: Encapsulates playback logic, state management, and UI layout.

import { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'

import { colors, fontSizes, spacing } from '../constants/theme'
import { getPresetById } from '../constants/tempos'
import { useAudioManager } from '../hooks/useAudioManager'
import { useSettingsStore } from '../stores/settingsStore'
import { useSessionStore } from '../stores/sessionStore'
import { createPlaybackService, type PlaybackService } from '../lib/playbackService'
import { TempoPreset, GameMode } from '../types/tempo'

import TempoSelector from './TempoSelector'
import RepCounter from './RepCounter'
import PlaybackControls from './PlaybackControls'
import SessionControls from './SessionControls'

interface TempoScreenProps {
  /** Screen title displayed at the top */
  title: string
  /** Subtitle describing the tempo ratio */
  subtitle: string
  /** Array of tempo presets to display for selection */
  presets: readonly TempoPreset[]
  /** Default preset ID for this game mode */
  defaultPresetId: string
  /** Game mode identifier */
  gameMode: GameMode
}

export default function TempoScreen({
  title,
  subtitle,
  presets,
  defaultPresetId,
  gameMode,
}: TempoScreenProps) {
  const playbackServiceRef = useRef<PlaybackService | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const previousGameModeRef = useRef<GameMode | null>(null)

  // Settings store - persistent preferences
  const toneStyle = useSettingsStore((s) => s.toneStyle)
  const volume = useSettingsStore((s) => s.volume)
  const delayBetweenReps = useSettingsStore((s) => s.delayBetweenReps)
  const setDelayBetweenReps = useSettingsStore((s) => s.setDelayBetweenReps)

  // Session store - transient playback state
  const currentPresetId = useSessionStore((s) => s.currentPresetId)
  const isPlaying = useSessionStore((s) => s.isPlaying)
  const isPaused = useSessionStore((s) => s.isPaused)
  const repCount = useSessionStore((s) => s.repCount)
  const playbackMode = useSessionStore((s) => s.playbackMode)
  const setPreset = useSessionStore((s) => s.setPreset)
  const setPlaying = useSessionStore((s) => s.setPlaying)
  const setPaused = useSessionStore((s) => s.setPaused)
  const incrementRepCount = useSessionStore((s) => s.incrementRepCount)
  const resetRepCount = useSessionStore((s) => s.resetRepCount)
  const setPlaybackMode = useSessionStore((s) => s.setPlaybackMode)
  const setGameMode = useSessionStore((s) => s.setGameMode)

  // Audio manager hook
  const { playTone, isLoaded, setVolume } = useAudioManager({
    toneStyle,
    volume,
  })

  // Initialize game mode and default preset on mount
  useEffect(() => {
    const currentStoreGameMode = useSessionStore.getState().gameMode
    const isFirstRender = previousGameModeRef.current === null
    const gameModeChanged = isFirstRender
      ? currentStoreGameMode !== gameMode
      : previousGameModeRef.current !== gameMode

    if (gameModeChanged) {
      resetRepCount()
    }

    previousGameModeRef.current = gameMode
    setGameMode(gameMode)
    setPreset(defaultPresetId)
  }, [gameMode, setGameMode, setPreset, defaultPresetId, resetRepCount])

  // Initialize playback service
  useEffect(() => {
    playbackServiceRef.current = createPlaybackService()

    return () => {
      playbackServiceRef.current?.stop()
    }
  }, [])

  // Update volume when settings change
  useEffect(() => {
    setVolume(volume)
  }, [volume, setVolume])

  // Configure playback service when settings change
  useEffect(() => {
    const preset = getPresetById(presets, currentPresetId)
    if (!playbackServiceRef.current || !preset) return

    playbackServiceRef.current.configure({
      preset,
      delayBetweenReps,
      mode: playbackMode,
      playTone,
      callbacks: {
        onTonePlayed: () => {},
        onRepComplete: incrementRepCount,
        onPlaybackStart: () => {
          setPlaying(true)
          setPaused(false)
        },
        onPlaybackStop: () => {
          setPlaying(false)
          setPaused(false)
          resetRepCount()
        },
      },
    })
    setIsConfigured(true)
  }, [
    currentPresetId,
    delayBetweenReps,
    playbackMode,
    playTone,
    incrementRepCount,
    setPlaying,
    setPaused,
    resetRepCount,
    presets,
  ])

  // Handlers
  const handlePlay = useCallback(async () => {
    if (!playbackServiceRef.current || !isLoaded || !isConfigured) return

    if (isPaused) {
      playbackServiceRef.current.resume()
      setPaused(false)
    } else {
      await playbackServiceRef.current.start()
    }
  }, [isLoaded, isConfigured, isPaused, setPaused])

  const handlePause = useCallback(() => {
    playbackServiceRef.current?.pause()
    setPaused(true)
  }, [setPaused])

  const handleStop = useCallback(() => {
    playbackServiceRef.current?.stop()
  }, [])

  const handlePresetChange = useCallback(
    (presetId: string) => {
      setPreset(presetId)
      const preset = getPresetById(presets, presetId)
      if (preset) {
        playbackServiceRef.current?.setPreset(preset)
      }
    },
    [setPreset, presets]
  )

  const handleDelayChange = useCallback(
    (delay: number) => {
      setDelayBetweenReps(delay)
      playbackServiceRef.current?.setDelay(delay)
    },
    [setDelayBetweenReps]
  )

  const handleModeChange = useCallback(
    (mode: 'continuous' | 'single') => {
      setPlaybackMode(mode)
    },
    [setPlaybackMode]
  )

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.repCounterWrapper}>
          <RepCounter count={repCount} isActive={isPlaying} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tempo</Text>
          <TempoSelector
            presets={presets}
            selectedPresetId={currentPresetId}
            onSelectPreset={handlePresetChange}
            disabled={isPlaying}
          />
        </View>

        <View style={styles.section}>
          <PlaybackControls
            isPlaying={isPlaying}
            isPaused={isPaused}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            disabled={!isLoaded || !isConfigured}
          />
        </View>

        <View style={styles.section}>
          <SessionControls
            delaySeconds={delayBetweenReps}
            onDelayChange={handleDelayChange}
            playbackMode={playbackMode}
            onModeChange={handleModeChange}
          />
        </View>

        {(!isLoaded || !isConfigured) && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  repCounterWrapper: {
    marginBottom: spacing.lg,
  },
  section: {
    width: '100%',
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  loadingContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
})
