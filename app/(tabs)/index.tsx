// ABOUTME: Long Game screen for 3:1 tempo training.
// ABOUTME: Contains playback controls and audio testing UI for development.

import { useCallback, useEffect, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'
import { LONG_GAME_PRESETS, getPresetById } from '../../constants/tempos'
import { useAudioManager } from '../../hooks/useAudioManager'
import {
  createPlaybackService,
  type PlaybackService,
  type PlaybackCallbacks,
} from '../../lib/playbackService'
import type { ToneStyle, PlaybackMode } from '../../types/tempo'

export default function LongGameScreen() {
  const playbackServiceRef = useRef<PlaybackService | null>(null)

  const [toneStyle, setToneStyleState] = useState<ToneStyle>('beep')
  const [status, setStatus] = useState<string>('Not loaded')

  // Use the new audio manager hook
  const { playTone, isLoaded, setVolume, currentVolume } = useAudioManager({
    toneStyle,
    volume: 1,
  })

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [repCount, setRepCount] = useState(0)
  const [currentTone, setCurrentTone] = useState<1 | 2 | 3 | null>(null)
  const [selectedPresetId, setSelectedPresetId] = useState('24/8')
  const [delayBetweenReps, setDelayBetweenReps] = useState(4)
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>('continuous')

  // Initialize playback service
  useEffect(() => {
    playbackServiceRef.current = createPlaybackService()

    return () => {
      playbackServiceRef.current?.stop()
    }
  }, [])

  // Update status when audio loads
  useEffect(() => {
    if (isLoaded) {
      setStatus('Audio loaded - ready to play')
    }
  }, [isLoaded])

  // Configure playback service when settings change
  useEffect(() => {
    const preset = getPresetById(LONG_GAME_PRESETS, selectedPresetId)
    if (!playbackServiceRef.current || !preset) return

    const callbacks: PlaybackCallbacks = {
      onTonePlayed: (toneNumber) => {
        setCurrentTone(toneNumber)
        // Clear current tone indicator after a brief moment
        setTimeout(() => setCurrentTone(null), 200)
      },
      onRepComplete: (count) => {
        setRepCount(count)
      },
      onPlaybackStart: () => {
        setIsPlaying(true)
        setIsPaused(false)
        setStatus('Playing')
      },
      onPlaybackStop: () => {
        setIsPlaying(false)
        setIsPaused(false)
        setRepCount(0)
        setCurrentTone(null)
        setStatus('Stopped')
      },
    }

    playbackServiceRef.current.configure({
      preset,
      delayBetweenReps,
      mode: playbackMode,
      callbacks,
      playTone,
    })
  }, [selectedPresetId, delayBetweenReps, playbackMode, playTone])

  const handleStartPlayback = useCallback(async () => {
    if (!playbackServiceRef.current) return
    if (!isLoaded) {
      setStatus('Audio not loaded yet')
      return
    }

    try {
      await playbackServiceRef.current.start()
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
    }
  }, [isLoaded])

  const handleStopPlayback = useCallback(() => {
    playbackServiceRef.current?.stop()
  }, [])

  const handlePausePlayback = useCallback(() => {
    if (playbackServiceRef.current?.isPaused()) {
      playbackServiceRef.current.resume()
      setIsPaused(false)
      setStatus('Resumed')
    } else {
      playbackServiceRef.current?.pause()
      setIsPaused(true)
      setStatus('Paused')
    }
  }, [])

  const handlePresetChange = useCallback((presetId: string) => {
    setSelectedPresetId(presetId)
    playbackServiceRef.current?.setPreset(getPresetById(LONG_GAME_PRESETS, presetId)!)
  }, [])

  const handleDelayChange = useCallback((delta: number) => {
    setDelayBetweenReps((prev) => {
      const newDelay = Math.max(2, Math.min(10, prev + delta))
      playbackServiceRef.current?.setDelay(newDelay)
      return newDelay
    })
  }, [])

  const handleToggleMode = useCallback(() => {
    setPlaybackMode((prev) => (prev === 'continuous' ? 'single' : 'continuous'))
  }, [])

  // Audio testing functions
  const handlePlayTone = useCallback(
    async (toneNumber: 1 | 2 | 3) => {
      if (!isLoaded) {
        setStatus('Audio not loaded')
        return
      }
      try {
        setStatus(`Playing tone ${toneNumber}...`)
        await playTone(toneNumber)
        setStatus(`Played tone ${toneNumber}`)
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown'}`)
      }
    },
    [isLoaded, playTone]
  )

  const handleToggleToneStyle = useCallback(() => {
    // Note: Changing tone style requires remounting with new style
    // For now, just toggle the state - the hook will reinitialize
    const newStyle = toneStyle === 'beep' ? 'voice' : 'beep'
    setToneStyleState(newStyle)
    setStatus(`Switching to ${newStyle}...`)
  }, [toneStyle])

  const handleVolumeChange = useCallback(
    (delta: number) => {
      const newVolume = Math.max(0, Math.min(1, currentVolume + delta * 0.1))
      setVolume(newVolume)
      setStatus(`Volume: ${Math.round(newVolume * 100)}%`)
    },
    [currentVolume, setVolume]
  )

  const selectedPreset = getPresetById(LONG_GAME_PRESETS, selectedPresetId)

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Long Game</Text>
        <Text style={styles.subtitle}>3:1 Tempo Training</Text>

        {/* Rep Counter */}
        <View style={styles.repCounterContainer}>
          <Text style={[styles.repCount, currentTone && styles.repCountActive]}>{repCount}</Text>
          <Text style={styles.repLabel}>REPS</Text>
          {currentTone && <Text style={styles.currentToneIndicator}>Tone {currentTone}</Text>}
        </View>

        {/* Tempo Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tempo</Text>
          <View style={styles.presetSelector}>
            {LONG_GAME_PRESETS.map((preset) => (
              <Pressable
                key={preset.id}
                style={[
                  styles.presetButton,
                  selectedPresetId === preset.id && styles.presetButtonSelected,
                  isPlaying && styles.buttonDisabled,
                ]}
                onPress={() => handlePresetChange(preset.id)}
                disabled={isPlaying}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    selectedPresetId === preset.id && styles.presetButtonTextSelected,
                  ]}
                >
                  {preset.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {selectedPreset && (
            <Text style={styles.presetDescription}>{selectedPreset.description}</Text>
          )}
        </View>

        {/* Playback Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Playback</Text>

          <View style={styles.playbackButtons}>
            {!isPlaying ? (
              <Pressable
                style={[styles.playButton, !isLoaded && styles.buttonDisabled]}
                onPress={handleStartPlayback}
                disabled={!isLoaded}
              >
                <Text style={styles.playButtonText}>▶ PLAY</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.pauseButton} onPress={handlePausePlayback}>
                  <Text style={styles.buttonText}>{isPaused ? '▶ RESUME' : '⏸ PAUSE'}</Text>
                </Pressable>
                <Pressable style={styles.stopButton} onPress={handleStopPlayback}>
                  <Text style={styles.buttonText}>⏹ STOP</Text>
                </Pressable>
              </>
            )}
          </View>

          {/* Delay Control */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Delay: {delayBetweenReps}s</Text>
            <View style={styles.controlButtons}>
              <Pressable style={styles.controlButton} onPress={() => handleDelayChange(-1)}>
                <Text style={styles.controlButtonText}>-</Text>
              </Pressable>
              <Pressable style={styles.controlButton} onPress={() => handleDelayChange(1)}>
                <Text style={styles.controlButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          {/* Mode Toggle */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Mode:</Text>
            <Pressable
              style={[styles.modeButton, playbackMode === 'continuous' && styles.modeButtonActive]}
              onPress={handleToggleMode}
            >
              <Text style={styles.modeButtonText}>
                {playbackMode === 'continuous' ? 'Continuous' : 'Single Rep'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusText}>{status}</Text>
        </View>

        {/* Audio Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio Testing</Text>

          <View style={styles.loadingIndicator}>
            <Text style={styles.loadingText}>
              {isLoaded ? '✓ Audio Loaded' : '⏳ Loading audio...'}
            </Text>
          </View>

          <Pressable
            style={[styles.button, !isLoaded && styles.buttonDisabled]}
            onPress={handleToggleToneStyle}
            disabled={!isLoaded}
          >
            <Text style={styles.buttonText}>Toggle Style ({toneStyle})</Text>
          </Pressable>

          {/* Volume Control */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Volume: {Math.round(currentVolume * 100)}%</Text>
            <View style={styles.controlButtons}>
              <Pressable style={styles.controlButton} onPress={() => handleVolumeChange(-1)}>
                <Text style={styles.controlButtonText}>-</Text>
              </Pressable>
              <Pressable style={styles.controlButton} onPress={() => handleVolumeChange(1)}>
                <Text style={styles.controlButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.toneButtons}>
            <Pressable
              style={[styles.toneButton, !isLoaded && styles.buttonDisabled]}
              onPress={() => handlePlayTone(1)}
              disabled={!isLoaded}
            >
              <Text style={styles.buttonText}>1</Text>
            </Pressable>
            <Pressable
              style={[styles.toneButton, !isLoaded && styles.buttonDisabled]}
              onPress={() => handlePlayTone(2)}
              disabled={!isLoaded}
            >
              <Text style={styles.buttonText}>2</Text>
            </Pressable>
            <Pressable
              style={[styles.toneButton, !isLoaded && styles.buttonDisabled]}
              onPress={() => handlePlayTone(3)}
              disabled={!isLoaded}
            >
              <Text style={styles.buttonText}>3</Text>
            </Pressable>
          </View>
        </View>
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
  repCounterContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    minWidth: 150,
  },
  repCount: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.text,
  },
  repCountActive: {
    color: colors.primary,
  },
  repLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  currentToneIndicator: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    width: '100%',
  },
  statusLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: fontSizes.md,
    color: colors.primary,
    flex: 1,
  },
  section: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  presetSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  presetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  presetButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
  },
  presetButtonTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  presetDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  playbackButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  playButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  playButtonText: {
    color: colors.text,
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  pauseButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stopButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  controlLabel: {
    fontSize: fontSizes.md,
    color: colors.text,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  controlButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  controlButtonText: {
    fontSize: fontSizes.xl,
    color: colors.text,
    fontWeight: '600',
  },
  modeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  buttonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.5,
  },
  buttonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  toneButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  toneButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingIndicator: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
})
