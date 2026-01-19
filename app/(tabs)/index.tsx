// ABOUTME: Long Game screen for 3:1 tempo training.
// ABOUTME: Placeholder screen to be replaced with full functionality later.

import { StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../../constants/theme'

export default function LongGameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Long Game</Text>
      <Text style={styles.subtitle}>3:1 Tempo Training</Text>
      <Text style={styles.placeholder}>Coming soon</Text>
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
