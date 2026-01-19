// ABOUTME: Reusable settings section component with header and content grouping.
// ABOUTME: Provides visual organization for related settings in the Settings screen.

import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'

export interface SettingsSectionProps {
  /** Section title displayed in header */
  title: string
  /** Child components to render in section */
  children?: ReactNode
}

/**
 * Groups related settings with a labeled header.
 * Used to organize the Settings screen into logical sections.
 */
export default function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View testID={`settings-section-${title}`} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
})
