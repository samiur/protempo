// ABOUTME: Tests for Onboarding screen with 3-page tutorial flow.
// ABOUTME: Verifies navigation, page indicators, skip, and completion functionality.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import OnboardingScreen from '../../app/onboarding'
import { useSettingsStore } from '../../stores/settingsStore'

// Mock expo-router
const mockReplace = jest.fn()
jest.mock('expo-router', () => ({
  router: {
    replace: (route: string) => mockReplace(route),
  },
}))

// Reset store before each test
beforeEach(() => {
  useSettingsStore.setState({
    hasCompletedOnboarding: false,
    _hasHydrated: true,
  })
  jest.clearAllMocks()
})

describe('OnboardingScreen', () => {
  describe('layout', () => {
    it('renders without crashing', () => {
      render(<OnboardingScreen />)

      expect(screen.getByTestId('onboarding-screen')).toBeTruthy()
    })

    it('shows first page initially', () => {
      render(<OnboardingScreen />)

      expect(screen.getByText('What is Golf Tempo?')).toBeTruthy()
    })

    it('shows skip button', () => {
      render(<OnboardingScreen />)

      expect(screen.getByText('Skip')).toBeTruthy()
    })

    it('shows page indicators', () => {
      render(<OnboardingScreen />)

      expect(screen.getByTestId('page-indicator-0')).toBeTruthy()
      expect(screen.getByTestId('page-indicator-1')).toBeTruthy()
      expect(screen.getByTestId('page-indicator-2')).toBeTruthy()
    })

    it('first page indicator is active', () => {
      render(<OnboardingScreen />)

      const indicator = screen.getByTestId('page-indicator-0')
      expect(indicator.props.accessibilityState?.selected).toBe(true)
    })
  })

  describe('page 1 - What is Golf Tempo?', () => {
    it('shows tempo description', () => {
      render(<OnboardingScreen />)

      expect(screen.getByText(/Tour pros complete their swing/)).toBeTruthy()
    })

    it('shows 3:1 ratio explanation', () => {
      render(<OnboardingScreen />)

      expect(screen.getByText(/3:1/)).toBeTruthy()
    })

    it('shows next button', () => {
      render(<OnboardingScreen />)

      expect(screen.getByText('Next')).toBeTruthy()
    })

    it('does not show back button on first page', () => {
      render(<OnboardingScreen />)

      expect(screen.queryByText('Back')).toBeNull()
    })
  })

  describe('page 2 - Three Simple Tones', () => {
    it('navigates to page 2 when next pressed', () => {
      render(<OnboardingScreen />)

      const nextButton = screen.getByText('Next')
      fireEvent.press(nextButton)

      expect(screen.getByText('Three Simple Tones')).toBeTruthy()
    })

    it('shows tone explanations', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))

      expect(screen.getByText(/Start takeaway/)).toBeTruthy()
      expect(screen.getByText(/Start downswing/)).toBeTruthy()
      expect(screen.getByText(/Impact/)).toBeTruthy()
    })

    it('shows back button on page 2', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))

      expect(screen.getByText('Back')).toBeTruthy()
    })

    it('navigates back to page 1 when back pressed', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Back'))

      expect(screen.getByText('What is Golf Tempo?')).toBeTruthy()
    })

    it('updates page indicator on page 2', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))

      const indicator = screen.getByTestId('page-indicator-1')
      expect(indicator.props.accessibilityState?.selected).toBe(true)
    })
  })

  describe('page 3 - Getting Started', () => {
    it('navigates to page 3 from page 2', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Next'))

      expect(screen.getByText('Start with 24/8')).toBeTruthy()
    })

    it('shows practice advice', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Next'))

      expect(screen.getByText(/most common tempo/)).toBeTruthy()
      expect(screen.getByText(/10-15 reps/)).toBeTruthy()
    })

    it('shows Get Started button instead of Next', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Next'))

      expect(screen.queryByText('Next')).toBeNull()
      expect(screen.getByText('Get Started')).toBeTruthy()
    })

    it('updates page indicator on page 3', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Next'))

      const indicator = screen.getByTestId('page-indicator-2')
      expect(indicator.props.accessibilityState?.selected).toBe(true)
    })
  })

  describe('completion', () => {
    it('marks onboarding complete when Get Started pressed', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Get Started'))

      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true)
    })

    it('navigates to main app when Get Started pressed', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Next'))
      fireEvent.press(screen.getByText('Get Started'))

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)')
    })
  })

  describe('skip', () => {
    it('marks onboarding complete when skip pressed', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Skip'))

      expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true)
    })

    it('navigates to main app when skip pressed', () => {
      render(<OnboardingScreen />)

      fireEvent.press(screen.getByText('Skip'))

      expect(mockReplace).toHaveBeenCalledWith('/(tabs)')
    })

    it('skip is visible on all pages', () => {
      render(<OnboardingScreen />)

      // Page 1
      expect(screen.getByText('Skip')).toBeTruthy()

      // Page 2
      fireEvent.press(screen.getByText('Next'))
      expect(screen.getByText('Skip')).toBeTruthy()

      // Page 3
      fireEvent.press(screen.getByText('Next'))
      expect(screen.getByText('Skip')).toBeTruthy()
    })
  })

  describe('swipe gestures', () => {
    it('renders FlatList for horizontal scrolling', () => {
      render(<OnboardingScreen />)

      expect(screen.getByTestId('onboarding-flatlist')).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('has accessible page indicators', () => {
      render(<OnboardingScreen />)

      const indicator = screen.getByTestId('page-indicator-0')
      expect(indicator.props.accessibilityRole).toBe('button')
      expect(indicator.props.accessibilityLabel).toBe('Page 1 of 3')
    })

    it('buttons have accessibility labels', () => {
      render(<OnboardingScreen />)

      const skipButton = screen.getByText('Skip')
      expect(skipButton.props.accessibilityRole).toBe('button')

      const nextButton = screen.getByText('Next')
      expect(nextButton.props.accessibilityRole).toBe('button')
    })
  })
})

describe('OnboardingScreen integration', () => {
  it('full flow from start to completion', () => {
    render(<OnboardingScreen />)

    // Verify page 1
    expect(screen.getByText('What is Golf Tempo?')).toBeTruthy()

    // Go to page 2
    fireEvent.press(screen.getByText('Next'))
    expect(screen.getByText('Three Simple Tones')).toBeTruthy()

    // Go to page 3
    fireEvent.press(screen.getByText('Next'))
    expect(screen.getByText('Start with 24/8')).toBeTruthy()

    // Complete onboarding
    fireEvent.press(screen.getByText('Get Started'))

    expect(useSettingsStore.getState().hasCompletedOnboarding).toBe(true)
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)')
  })
})
