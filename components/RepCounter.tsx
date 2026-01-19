// ABOUTME: Large, centered rep count display for practice sessions.
// ABOUTME: Shows current rep count with optional active state animation styling.

import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../constants/theme'

export interface RepCounterProps {
  /** Current rep count to display */
  count: number
  /** Whether playback is active (shows pulse/active styling) */
  isActive: boolean
}

/**
 * Large, centered display for the current rep count.
 * Designed to be glanceable at arm's length during practice.
 * Shows active styling when isActive is true.
 */
export default function RepCounter({ count, isActive }: RepCounterProps) {
  const accessibilityLabel = isActive ? `${count} reps, playing` : `${count} reps`

  return (
    <View
      testID="rep-counter"
      style={[styles.container, isActive && styles.containerActive]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy: isActive }}
    >
      <Text testID="rep-counter-count" style={[styles.count, isActive && styles.countActive]}>
        {count}
      </Text>
      <Text testID="rep-counter-label" style={styles.label}>
        REPS
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 16,
    minWidth: 150,
  },
  containerActive: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  count: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.text,
  },
  countActive: {
    color: colors.primary,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    letterSpacing: 2,
  },
})
