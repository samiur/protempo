// ABOUTME: Session configuration controls for tempo practice.
// ABOUTME: Provides delay slider (2-10s) and playback mode toggle (continuous/single).

import { Pressable, StyleSheet, Text, View } from 'react-native'
import Slider from '@react-native-community/slider'

import { colors, fontSizes, spacing } from '../constants/theme'
import type { PlaybackMode } from '../types/tempo'

export interface SessionControlsProps {
  /** Current delay between reps in seconds (2-10) */
  delaySeconds: number
  /** Callback when delay value changes */
  onDelayChange: (seconds: number) => void
  /** Current playback mode */
  playbackMode: PlaybackMode
  /** Callback when playback mode changes */
  onModeChange: (mode: PlaybackMode) => void
  /** Whether the controls are disabled */
  disabled?: boolean
}

const MIN_DELAY = 2
const MAX_DELAY = 10

/**
 * Session configuration controls including:
 * - Delay slider: Adjusts time between reps (2-10 seconds)
 * - Mode toggle: Switches between continuous and single rep modes
 */
export default function SessionControls({
  delaySeconds,
  onDelayChange,
  playbackMode,
  onModeChange,
  disabled = false,
}: SessionControlsProps) {
  const isContinuous = playbackMode === 'continuous'

  return (
    <View testID="session-controls" style={styles.container} accessibilityState={{ disabled }}>
      <View testID="delay-section" style={styles.section}>
        <Text style={[styles.sectionLabel, disabled && styles.labelDisabled]}>
          Delay between reps
        </Text>
        <View style={styles.sliderContainer}>
          <Text style={[styles.boundLabel, disabled && styles.labelDisabled]}>2s</Text>
          <Slider
            testID="delay-slider"
            style={styles.slider}
            value={delaySeconds}
            minimumValue={MIN_DELAY}
            maximumValue={MAX_DELAY}
            step={1}
            onValueChange={onDelayChange}
            minimumTrackTintColor={disabled ? colors.inactive : colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={disabled ? colors.inactive : colors.primary}
            disabled={disabled}
            accessibilityRole="adjustable"
            accessibilityLabel={`Delay between reps, ${delaySeconds} seconds`}
          />
          <Text style={[styles.boundLabel, disabled && styles.labelDisabled]}>10s</Text>
        </View>
        <Text style={[styles.valueLabel, disabled && styles.labelDisabled]}>{delaySeconds}s</Text>
      </View>

      <View testID="mode-section" style={styles.section}>
        <View style={styles.modeToggle}>
          <Pressable
            testID="mode-continuous"
            style={[
              styles.modeButton,
              styles.modeButtonLeft,
              isContinuous && styles.modeButtonSelected,
              disabled && styles.modeButtonDisabled,
            ]}
            onPress={() => onModeChange('continuous')}
            accessibilityRole="button"
            accessibilityLabel="Continuous mode - repeats until stopped"
            accessibilityState={{ selected: isContinuous, disabled }}
            disabled={disabled}
          >
            <Text
              style={[
                styles.modeButtonText,
                isContinuous && styles.modeButtonTextSelected,
                disabled && styles.textDisabled,
              ]}
            >
              Continuous
            </Text>
          </Pressable>

          <Pressable
            testID="mode-single"
            style={[
              styles.modeButton,
              !isContinuous && styles.modeButtonSelected,
              disabled && styles.modeButtonDisabled,
            ]}
            onPress={() => onModeChange('single')}
            accessibilityRole="button"
            accessibilityLabel="Single rep mode - plays one cycle then stops"
            accessibilityState={{ selected: !isContinuous, disabled }}
            disabled={disabled}
          >
            <Text
              style={[
                styles.modeButtonText,
                !isContinuous && styles.modeButtonTextSelected,
                disabled && styles.textDisabled,
              ]}
            >
              Single Rep
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  section: {
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  labelDisabled: {
    color: colors.inactive,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  boundLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    width: 30,
    textAlign: 'center',
  },
  valueLabel: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  modeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    minWidth: 110,
    alignItems: 'center',
  },
  modeButtonLeft: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  modeButtonSelected: {
    backgroundColor: colors.primary,
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  modeButtonTextSelected: {
    color: colors.text,
  },
  textDisabled: {
    color: colors.inactive,
  },
})
