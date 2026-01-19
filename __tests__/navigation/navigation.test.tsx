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

    it('displays subtitle with tempo ratio', () => {
      render(<LongGameScreen />)
      expect(screen.getByText('3:1 Tempo Training')).toBeTruthy()
    })

    it('displays playback controls', () => {
      render(<LongGameScreen />)
      expect(screen.getByTestId('playback-controls')).toBeTruthy()
    })

    it('displays tempo selector', () => {
      render(<LongGameScreen />)
      expect(screen.getByText('Tempo')).toBeTruthy()
      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
    })

    it('displays rep counter', () => {
      render(<LongGameScreen />)
      expect(screen.getByTestId('rep-counter')).toBeTruthy()
      expect(screen.getByText('REPS')).toBeTruthy()
    })

    it('displays session controls', () => {
      render(<LongGameScreen />)
      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })
  })

  describe('Short Game Screen', () => {
    it('renders with correct title', () => {
      render(<ShortGameScreen />)
      expect(screen.getByText('Short Game')).toBeTruthy()
    })

    it('displays subtitle with tempo ratio', () => {
      render(<ShortGameScreen />)
      expect(screen.getByText('2:1 Tempo Training')).toBeTruthy()
    })

    it('displays playback controls', () => {
      render(<ShortGameScreen />)
      expect(screen.getByTestId('playback-controls')).toBeTruthy()
    })

    it('displays tempo selector', () => {
      render(<ShortGameScreen />)
      expect(screen.getByText('Tempo')).toBeTruthy()
      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
    })

    it('displays rep counter', () => {
      render(<ShortGameScreen />)
      expect(screen.getByTestId('rep-counter')).toBeTruthy()
      expect(screen.getByText('REPS')).toBeTruthy()
    })

    it('displays session controls', () => {
      render(<ShortGameScreen />)
      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })
  })

  describe('Settings Screen', () => {
    it('renders with correct title', () => {
      render(<SettingsScreen />)
      expect(screen.getByText('Settings')).toBeTruthy()
    })

    it('displays audio section', () => {
      render(<SettingsScreen />)
      expect(screen.getByTestId('settings-section-AUDIO')).toBeTruthy()
    })

    it('displays defaults section', () => {
      render(<SettingsScreen />)
      expect(screen.getByTestId('settings-section-DEFAULTS')).toBeTruthy()
    })

    it('displays display section', () => {
      render(<SettingsScreen />)
      expect(screen.getByTestId('settings-section-DISPLAY')).toBeTruthy()
    })

    it('displays about section', () => {
      render(<SettingsScreen />)
      expect(screen.getByTestId('settings-section-ABOUT')).toBeTruthy()
    })
  })
})
