// ABOUTME: Playback control buttons for tempo practice sessions.
// ABOUTME: Provides large, tappable play/pause and stop buttons with proper accessibility.

import { Pressable, StyleSheet, Text, View } from 'react-native'

import { colors, spacing } from '../constants/theme'

export interface PlaybackControlsProps {
  /** Whether playback is currently active */
  isPlaying: boolean
  /** Whether playback is paused (can resume) */
  isPaused: boolean
  /** Callback when play/resume is tapped */
  onPlay: () => void
  /** Callback when pause is tapped */
  onPause: () => void
  /** Callback when stop is tapped */
  onStop: () => void
  /** Whether the controls are disabled */
  disabled?: boolean
}

/**
 * Large playback control buttons for tempo practice.
 * Shows play or pause button based on current state,
 * plus a stop button to end the session.
 */
export default function PlaybackControls({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onStop,
  disabled = false,
}: PlaybackControlsProps) {
  const showPause = isPlaying && !isPaused
  const playLabel = isPaused ? 'Resume playback' : 'Play'
  const pauseLabel = 'Pause playback'

  return (
    <View testID="playback-controls" style={styles.container}>
      {showPause ? (
        <Pressable
          testID="playback-pause-button"
          style={[styles.mainButton, styles.pauseButton, disabled && styles.buttonDisabled]}
          onPress={onPause}
          accessibilityRole="button"
          accessibilityLabel={pauseLabel}
          accessibilityState={{ disabled }}
          disabled={disabled}
        >
          <Text style={[styles.mainButtonIcon, disabled && styles.iconDisabled]}>⏸</Text>
        </Pressable>
      ) : (
        <Pressable
          testID="playback-play-button"
          style={[
            styles.mainButton,
            styles.playButton,
            isPaused && styles.pausedIndicator,
            disabled && styles.buttonDisabled,
          ]}
          onPress={onPlay}
          accessibilityRole="button"
          accessibilityLabel={playLabel}
          accessibilityState={{ disabled, selected: isPaused }}
          disabled={disabled}
        >
          <Text style={[styles.mainButtonIcon, disabled && styles.iconDisabled]}>▶</Text>
        </Pressable>
      )}

      <Pressable
        testID="playback-stop-button"
        style={[styles.stopButton, disabled && styles.buttonDisabled]}
        onPress={onStop}
        accessibilityRole="button"
        accessibilityLabel="Stop playback"
        accessibilityState={{ disabled }}
        disabled={disabled}
      >
        <Text style={[styles.stopButtonText, disabled && styles.textDisabled]}>STOP</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  playButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pauseButton: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  pausedIndicator: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  mainButtonIcon: {
    fontSize: 32,
    color: colors.text,
  },
  iconDisabled: {
    color: colors.inactive,
  },
  stopButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  textDisabled: {
    color: colors.inactive,
  },
})
