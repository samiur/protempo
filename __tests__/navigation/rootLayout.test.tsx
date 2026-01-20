// ABOUTME: Tests for root layout with first-launch detection.
// ABOUTME: Verifies onboarding redirect and hydration handling.

import React from 'react'
import { render, screen } from '@testing-library/react-native'

import RootLayout from '../../app/_layout'
import { useSettingsStore } from '../../stores/settingsStore'

// Mock expo-router
const mockReplace = jest.fn()
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native')
  const MockScreen = () => null
  const MockStack = ({ children }: { children: React.ReactNode }) => (
    <View testID="stack-navigator">{children}</View>
  )
  MockStack.Screen = MockScreen

  return {
    Stack: MockStack,
    router: {
      replace: (route: string) => mockReplace(route),
    },
    useSegments: () => ['(tabs)'],
    useRootNavigationState: () => ({ key: 'root-nav-key' }),
  }
})

// Mock expo-status-bar
jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}))

// Mock expo-system-ui
jest.mock('expo-system-ui', () => ({
  setBackgroundColorAsync: jest.fn(),
}))

// Use fake timers for setTimeout in navigation
beforeEach(() => {
  jest.useFakeTimers()
  useSettingsStore.setState({
    hasCompletedOnboarding: false,
    _hasHydrated: false,
  })
  jest.clearAllMocks()
})

afterEach(() => {
  jest.useRealTimers()
})

describe('RootLayout', () => {
  describe('hydration', () => {
    it('shows loading state when not hydrated', () => {
      useSettingsStore.setState({ _hasHydrated: false })
      render(<RootLayout />)

      expect(screen.getByTestId('loading-screen')).toBeTruthy()
    })

    it('shows loading text', () => {
      useSettingsStore.setState({ _hasHydrated: false })
      render(<RootLayout />)

      expect(screen.getByText('Loading...')).toBeTruthy()
    })
  })

  describe('first launch', () => {
    it('redirects to onboarding when not completed', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: false,
      })
      render(<RootLayout />)

      // Advance timers to trigger the deferred navigation
      jest.runAllTimers()

      expect(mockReplace).toHaveBeenCalledWith('/onboarding')
    })

    // This test would have caught the infinite loop issue!
    // The bug was returning <Redirect> instead of Stack, leaving no navigation context
    it('renders stack navigator even when redirecting to onboarding', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: false,
      })
      render(<RootLayout />)

      // Stack must always be rendered when hydrated - redirect happens via useEffect
      expect(screen.getByTestId('stack-navigator')).toBeTruthy()
    })

    it('only redirects once (prevents infinite loops)', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: false,
      })
      render(<RootLayout />)

      // Advance timers to trigger the deferred navigation
      jest.runAllTimers()

      // Should be called exactly once, not repeatedly
      expect(mockReplace).toHaveBeenCalledTimes(1)
    })
  })

  describe('returning user', () => {
    it('does not redirect when onboarding completed', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: true,
      })
      render(<RootLayout />)

      // Advance timers to ensure no redirect is triggered
      jest.runAllTimers()

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('renders stack navigator when onboarding completed', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: true,
      })
      render(<RootLayout />)

      expect(screen.getByTestId('stack-navigator')).toBeTruthy()
    })
  })
})
