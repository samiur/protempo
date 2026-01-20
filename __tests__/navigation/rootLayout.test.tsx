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
  const MockStack = ({ children }: { children: React.ReactNode }) => <View>{children}</View>
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

// Reset store before each test
beforeEach(() => {
  useSettingsStore.setState({
    hasCompletedOnboarding: false,
    _hasHydrated: false,
  })
  jest.clearAllMocks()
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

      expect(mockReplace).toHaveBeenCalledWith('/onboarding')
    })
  })

  describe('returning user', () => {
    it('does not redirect when onboarding completed', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: true,
      })
      render(<RootLayout />)

      expect(mockReplace).not.toHaveBeenCalled()
    })

    it('renders stack navigator when onboarding completed', () => {
      useSettingsStore.setState({
        _hasHydrated: true,
        hasCompletedOnboarding: true,
      })

      expect(() => render(<RootLayout />)).not.toThrow()
    })
  })
})
