// ABOUTME: Root layout for ProTempo app navigation.
// ABOUTME: Configures dark mode theme, handles onboarding redirect, and sets up the navigation stack.

import { router, Stack, useSegments, useRootNavigationState } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SystemUI from 'expo-system-ui'
import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

import { colors, fontSizes, spacing } from '../constants/theme'
import { useSettingsStore } from '../stores/settingsStore'

export default function RootLayout() {
  const hasHydrated = useSettingsStore((s) => s._hasHydrated)
  const hasCompletedOnboarding = useSettingsStore((s) => s.hasCompletedOnboarding)
  const segments = useSegments()
  const navigationState = useRootNavigationState()

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background)
  }, [])

  useEffect(() => {
    if (!navigationState?.key) return
    if (!hasHydrated) return

    const inOnboarding = segments[0] === 'onboarding'

    // Defer navigation to next tick to ensure Stack is fully mounted
    const timeoutId = setTimeout(() => {
      if (!hasCompletedOnboarding && !inOnboarding) {
        router.replace('/onboarding')
      } else if (hasCompletedOnboarding && inOnboarding) {
        router.replace('/(tabs)')
      }
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [hasHydrated, hasCompletedOnboarding, segments, navigationState?.key])

  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer} testID="loading-screen">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
})
