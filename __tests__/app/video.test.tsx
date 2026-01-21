// ABOUTME: Tests for the Video tab entry screen.
// ABOUTME: Verifies navigation options to record and library are displayed correctly.

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import VideoScreen from '../../app/(tabs)/video'

// Mock expo-router
const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('VideoScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the video screen', () => {
      const { getByTestId } = render(<VideoScreen />)

      expect(getByTestId('video-screen')).toBeTruthy()
    })

    it('should display the title', () => {
      const { getByText } = render(<VideoScreen />)

      expect(getByText('Video Analysis')).toBeTruthy()
    })

    it('should display the subtitle', () => {
      const { getByText } = render(<VideoScreen />)

      expect(getByText(/Record your swing and analyze your tempo/)).toBeTruthy()
    })
  })

  describe('Record New option', () => {
    it('should render the Record New button', () => {
      const { getByTestId } = render(<VideoScreen />)

      expect(getByTestId('record-new-button')).toBeTruthy()
    })

    it('should display Record New title', () => {
      const { getByText } = render(<VideoScreen />)

      expect(getByText('Record New')).toBeTruthy()
    })

    it('should display Record New description', () => {
      const { getByText } = render(<VideoScreen />)

      expect(getByText(/Capture a new swing video/)).toBeTruthy()
    })

    it('should navigate to capture screen when pressed', () => {
      const { getByTestId } = render(<VideoScreen />)

      fireEvent.press(getByTestId('record-new-button'))

      expect(mockPush).toHaveBeenCalledWith('/capture')
    })

    it('should have correct accessibility label', () => {
      const { getByTestId } = render(<VideoScreen />)

      const button = getByTestId('record-new-button')
      expect(button.props.accessibilityLabel).toBe('Record new swing video')
    })
  })

  describe('Video Library option', () => {
    it('should render the Video Library button', () => {
      const { getByTestId } = render(<VideoScreen />)

      expect(getByTestId('video-library-button')).toBeTruthy()
    })

    it('should display Video Library title', () => {
      const { getByText } = render(<VideoScreen />)

      expect(getByText('Video Library')).toBeTruthy()
    })

    it('should display Video Library description', () => {
      const { getByText } = render(<VideoScreen />)

      expect(getByText(/View and analyze your recorded swings/)).toBeTruthy()
    })

    it('should navigate to videos screen when pressed', () => {
      const { getByTestId } = render(<VideoScreen />)

      fireEvent.press(getByTestId('video-library-button'))

      expect(mockPush).toHaveBeenCalledWith('/videos')
    })

    it('should have correct accessibility label', () => {
      const { getByTestId } = render(<VideoScreen />)

      const button = getByTestId('video-library-button')
      expect(button.props.accessibilityLabel).toBe('View video library')
    })
  })
})
