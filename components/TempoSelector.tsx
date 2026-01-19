// ABOUTME: Horizontal scrollable tempo preset selector with pill-style buttons.
// ABOUTME: Displays tempo presets with labels and total time for selection.

import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'

import { colors, fontSizes, spacing } from '../constants/theme'
import { getTotalTime, formatTime } from '../constants/tempos'
import type { TempoPreset } from '../types/tempo'

export interface TempoSelectorProps {
  /** Array of tempo presets to display */
  presets: TempoPreset[]
  /** ID of the currently selected preset */
  selectedPresetId: string
  /** Callback when a preset is selected */
  onSelectPreset: (presetId: string) => void
  /** Whether the selector is disabled */
  disabled?: boolean
}

/**
 * Horizontal scrollable selector for tempo presets.
 * Displays each preset as a pill button showing the label and total time.
 */
export default function TempoSelector({
  presets,
  selectedPresetId,
  onSelectPreset,
  disabled = false,
}: TempoSelectorProps) {
  return (
    <ScrollView
      testID="tempo-selector-scroll"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollContainer}
    >
      {presets.map((preset) => {
        const isSelected = preset.id === selectedPresetId
        const totalTimeMs = getTotalTime(preset)
        const totalTimeFormatted = formatTime(totalTimeMs)

        return (
          <Pressable
            key={preset.id}
            testID={`tempo-pill-${preset.id}`}
            style={[
              styles.pill,
              isSelected && styles.pillSelected,
              disabled && styles.pillDisabled,
            ]}
            onPress={() => onSelectPreset(preset.id)}
            accessibilityRole="button"
            accessibilityLabel={`${preset.label} tempo, ${totalTimeFormatted} total time`}
            accessibilityState={{
              selected: isSelected,
              disabled,
            }}
            disabled={disabled}
          >
            <Text
              style={[
                styles.pillLabel,
                isSelected && styles.pillLabelSelected,
                disabled && styles.pillLabelDisabled,
              ]}
            >
              {preset.label}
            </Text>
            <Text
              style={[
                styles.pillTime,
                isSelected && styles.pillTimeSelected,
                disabled && styles.pillTimeDisabled,
              ]}
            >
              {totalTimeFormatted}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm,
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    minWidth: 70,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillLabelSelected: {
    color: colors.text,
  },
  pillLabelDisabled: {
    color: colors.inactive,
  },
  pillTime: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pillTimeSelected: {
    color: colors.text,
  },
  pillTimeDisabled: {
    color: colors.inactive,
  },
})
