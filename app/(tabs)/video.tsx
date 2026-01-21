// ABOUTME: Video tab entry point for ProTempo video analysis feature.
// ABOUTME: Provides navigation to record new videos or view the video library.

import React from 'react'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { colors, fontSizes, spacing } from '../../constants/theme'

export default function VideoScreen(): React.JSX.Element {
  const router = useRouter()

  const handleRecordNew = () => {
    router.push('/capture')
  }

  const handleVideoLibrary = () => {
    router.push('/videos')
  }

  return (
    <View testID="video-screen" style={styles.container}>
      <Text style={styles.title}>Video Analysis</Text>
      <Text style={styles.subtitle}>Record your swing and analyze your tempo frame-by-frame</Text>

      <View style={styles.optionsContainer}>
        <Pressable
          testID="record-new-button"
          style={styles.optionCard}
          onPress={handleRecordNew}
          accessibilityRole="button"
          accessibilityLabel="Record new swing video"
        >
          <View style={styles.iconContainer}>
            <Ionicons name="videocam" size={48} color={colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Record New</Text>
          <Text style={styles.optionDescription}>Capture a new swing video for analysis</Text>
        </Pressable>

        <Pressable
          testID="video-library-button"
          style={styles.optionCard}
          onPress={handleVideoLibrary}
          accessibilityRole="button"
          accessibilityLabel="View video library"
        >
          <View style={styles.iconContainer}>
            <Ionicons name="folder-open" size={48} color={colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Video Library</Text>
          <Text style={styles.optionDescription}>View and analyze your recorded swings</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
})
