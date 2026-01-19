// ABOUTME: Long Game screen for 3:1 tempo training.
// ABOUTME: Wires together all components, stores, and playback service for tempo practice.

import { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, Text, View, ScrollView } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { LONG_GAME_PRESETS, getPresetById } from '../../constants/tempos'
import { useAudioManager } from '../../hooks/useAudioManager'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSessionStore } from '../../stores/sessionStore'
import {
  createPlaybackService,
  type PlaybackService,
  type PlaybackCallbacks,
} from '../../lib/playbackService'

import TempoSelector from '../../components/TempoSelector'
import RepCounter from '../../components/RepCounter'
import PlaybackControls from '../../components/PlaybackControls'
import SessionControls from '../../components/SessionControls'

export default function LongGameScreen() {
  const playbackServiceRef = useRef<PlaybackService | null>(null)

  // Settings store - persistent preferences
  const toneStyle = useSettingsStore((s) => s.toneStyle)
  const volume = useSettingsStore((s) => s.volume)
  const delayBetweenReps = useSettingsStore((s) => s.delayBetweenReps)
  const defaultPresetId = useSettingsStore((s) => s.defaultLongGamePresetId)
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
    setGameMode('longGame')
    setPreset(defaultPresetId)
  }, [setGameMode, setPreset, defaultPresetId])

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
    const preset = getPresetById(LONG_GAME_PRESETS, currentPresetId)
    if (!playbackServiceRef.current || !preset) return

    const callbacks: PlaybackCallbacks = {
      onTonePlayed: () => {},
      onRepComplete: () => incrementRepCount(),
      onPlaybackStart: () => {
        setPlaying(true)
        setPaused(false)
      },
      onPlaybackStop: () => {
        setPlaying(false)
        setPaused(false)
        resetRepCount()
      },
    }

    playbackServiceRef.current.configure({
      preset,
      delayBetweenReps,
      mode: playbackMode,
      callbacks,
      playTone,
    })
  }, [
    currentPresetId,
    delayBetweenReps,
    playbackMode,
    playTone,
    incrementRepCount,
    setPlaying,
    setPaused,
    resetRepCount,
  ])

  // Handlers
  const handlePlay = useCallback(async () => {
    if (!playbackServiceRef.current || !isLoaded) return

    if (isPaused) {
      playbackServiceRef.current.resume()
      setPaused(false)
    } else {
      await playbackServiceRef.current.start()
    }
  }, [isLoaded, isPaused, setPaused])

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
      const preset = getPresetById(LONG_GAME_PRESETS, presetId)
      if (preset) {
        playbackServiceRef.current?.setPreset(preset)
      }
    },
    [setPreset]
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
        <Text style={styles.title}>Long Game</Text>
        <Text style={styles.subtitle}>3:1 Tempo Training</Text>

        <View style={styles.repCounterWrapper}>
          <RepCounter count={repCount} isActive={isPlaying} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tempo</Text>
          <TempoSelector
            presets={LONG_GAME_PRESETS}
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
            disabled={!isLoaded}
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

        {!isLoaded && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading audio...</Text>
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
