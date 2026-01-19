// ABOUTME: Tests for navigation structure and tab layout.
// ABOUTME: Verifies that all tabs render and navigation works correctly.

import React from 'react'
import { render, screen } from '@testing-library/react-native'

import TabLayout from '../../app/(tabs)/_layout'
import LongGameScreen from '../../app/(tabs)/index'
import ShortGameScreen from '../../app/(tabs)/short-game'
import SettingsScreen from '../../app/(tabs)/settings'

// Mock expo-router - using View as a passthrough for navigation components
jest.mock('expo-router', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native')
  const MockScreen = () => null
  const MockTabs = ({ children }: { children: React.ReactNode }) => <View>{children}</View>
  MockTabs.Screen = MockScreen

  return {
    Tabs: MockTabs,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useSegments: () => [],
    Stack: {
      Screen: MockScreen,
    },
  }
})

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

describe('Navigation', () => {
  describe('Tab Layout', () => {
    it('renders without crashing', () => {
      expect(() => render(<TabLayout />)).not.toThrow()
    })
  })

  describe('Long Game Screen', () => {
    it('renders with correct title', () => {
      render(<LongGameScreen />)
      expect(screen.getByText('Long Game')).toBeTruthy()
    })

    it('displays placeholder text', () => {
      render(<LongGameScreen />)
      expect(screen.getByText('Coming soon')).toBeTruthy()
    })
  })

  describe('Short Game Screen', () => {
    it('renders with correct title', () => {
      render(<ShortGameScreen />)
      expect(screen.getByText('Short Game')).toBeTruthy()
    })

    it('displays placeholder text', () => {
      render(<ShortGameScreen />)
      expect(screen.getByText('Coming soon')).toBeTruthy()
    })
  })

  describe('Settings Screen', () => {
    it('renders with correct title', () => {
      render(<SettingsScreen />)
      expect(screen.getByText('Settings')).toBeTruthy()
    })

    it('displays placeholder text', () => {
      render(<SettingsScreen />)
      expect(screen.getByText('Coming soon')).toBeTruthy()
    })
  })
})
