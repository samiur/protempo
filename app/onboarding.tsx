// ABOUTME: Onboarding screen for first-time users.
// ABOUTME: Placeholder to be replaced with full tutorial flow later.

import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../constants/theme'

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ProTempo</Text>
      <Text style={styles.subtitle}>Your Golf Tempo Trainer</Text>
      <Text style={styles.placeholder}>Onboarding flow coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
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
    marginBottom: spacing.xl,
  },
  placeholder: {
    fontSize: fontSizes.md,
    color: colors.inactive,
    fontStyle: 'italic',
  },
})
