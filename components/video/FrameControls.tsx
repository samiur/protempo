// ABOUTME: Frame-by-frame navigation controls for video analysis.
// ABOUTME: Provides previous/next frame buttons, frame counter, and playback speed selector.

import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'

/** Available playback speeds */
const PLAYBACK_SPEEDS = [0.25, 0.5, 1]

/** Props for the FrameControls component */
export interface FrameControlsProps {
  /** Current frame number (0-indexed) */
  currentFrame: number
  /** Total number of frames in the video */
  totalFrames: number
  /** Current playback speed */
  playbackSpeed: number
  /** Callback when previous frame button is pressed */
  onPreviousFrame: () => void
  /** Callback when next frame button is pressed */
  onNextFrame: () => void
  /** Callback when playback speed changes */
  onSpeedChange: (speed: number) => void
}

/**
 * Frame navigation controls for video analysis.
 * Displays previous/next frame buttons, current frame counter,
 * and a playback speed selector dropdown.
 */
export default function FrameControls({
  currentFrame,
  totalFrames,
  playbackSpeed,
  onPreviousFrame,
  onNextFrame,
  onSpeedChange,
}: FrameControlsProps): React.JSX.Element {
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)

  const maxFrame = Math.max(0, totalFrames - 1)
  const isPrevDisabled = currentFrame <= 0
  const isNextDisabled = currentFrame >= maxFrame

  const handleSpeedSelect = (speed: number): void => {
    onSpeedChange(speed)
    setShowSpeedMenu(false)
  }

  return (
    <View testID="frame-controls" style={styles.container}>
      {/* Previous frame button */}
      <Pressable
        testID="frame-controls-prev"
        style={[styles.button, isPrevDisabled && styles.buttonDisabled]}
        onPress={onPreviousFrame}
        disabled={isPrevDisabled}
        accessibilityRole="button"
        accessibilityLabel="Previous frame"
        accessibilityState={{ disabled: isPrevDisabled }}
      >
        <Ionicons
          name="play-skip-back"
          size={24}
          color={isPrevDisabled ? colors.inactive : colors.text}
        />
      </Pressable>

      {/* Frame counter */}
      <View testID="frame-controls-display" style={styles.frameDisplay}>
        <Text style={styles.frameText}>
          {currentFrame} / {maxFrame}
        </Text>
      </View>

      {/* Next frame button */}
      <Pressable
        testID="frame-controls-next"
        style={[styles.button, isNextDisabled && styles.buttonDisabled]}
        onPress={onNextFrame}
        disabled={isNextDisabled}
        accessibilityRole="button"
        accessibilityLabel="Next frame"
        accessibilityState={{ disabled: isNextDisabled }}
      >
        <Ionicons
          name="play-skip-forward"
          size={24}
          color={isNextDisabled ? colors.inactive : colors.text}
        />
      </Pressable>

      {/* Speed selector */}
      <View style={styles.speedContainer}>
        <Pressable
          testID="frame-controls-speed"
          style={styles.speedButton}
          onPress={() => setShowSpeedMenu(!showSpeedMenu)}
          accessibilityRole="button"
          accessibilityLabel="Playback speed"
        >
          <Text style={styles.speedText}>{playbackSpeed}x</Text>
          <Ionicons
            name={showSpeedMenu ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.text}
          />
        </Pressable>

        {/* Speed menu dropdown */}
        {showSpeedMenu && (
          <View style={styles.speedMenu}>
            {PLAYBACK_SPEEDS.map((speed) => (
              <Pressable
                key={speed}
                testID={`speed-option-${speed}`}
                style={[styles.speedOption, speed === playbackSpeed && styles.speedOptionSelected]}
                onPress={() => handleSpeedSelect(speed)}
              >
                <Text
                  style={[
                    styles.speedOptionText,
                    speed === playbackSpeed && styles.speedOptionTextSelected,
                  ]}
                >
                  {speed}x
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  button: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  frameDisplay: {
    minWidth: 100,
    alignItems: 'center',
  },
  frameText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontVariant: ['tabular-nums'],
  },
  speedContainer: {
    position: 'relative',
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  speedText: {
    color: colors.text,
    fontSize: fontSizes.sm,
  },
  speedMenu: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  speedOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  speedOptionSelected: {
    backgroundColor: colors.primaryDark,
  },
  speedOptionText: {
    color: colors.text,
    fontSize: fontSizes.sm,
  },
  speedOptionTextSelected: {
    fontWeight: '600',
  },
})
