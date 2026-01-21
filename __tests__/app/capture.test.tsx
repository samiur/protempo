// ABOUTME: Tests for the Camera Capture screen.
// ABOUTME: Verifies permission states, recording controls, and navigation.

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import CaptureScreen from '../../app/capture'

// Mock expo-router
const mockBack = jest.fn()
const mockReplace = jest.fn()
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
  }),
}))

// Get mock function references
const mockUseCameraPermission = jest.requireMock('react-native-vision-camera').useCameraPermission
const mockUseMicrophonePermission = jest.requireMock(
  'react-native-vision-camera'
).useMicrophonePermission

// Mock videoFileManager
jest.mock('../../lib/videoFileManager', () => ({
  videoFileManager: {
    saveVideoFile: jest.fn().mockResolvedValue('file:///saved/video.mp4'),
    generateThumbnail: jest.fn().mockResolvedValue('file:///saved/thumbnail.jpg'),
  },
}))

// Mock videoStorage
jest.mock('../../lib/videoStorage', () => ({
  videoStorage: {
    saveVideo: jest.fn().mockResolvedValue(undefined),
  },
}))

describe('CaptureScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset to default permission granted state
    mockUseCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })
    mockUseMicrophonePermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })
  })

  describe('permission states', () => {
    it('should show loading state when permissions are undefined', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: undefined,
        requestPermission: jest.fn(),
      })

      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('capture-screen-loading')).toBeTruthy()
    })

    it('should show permission denied state when camera permission is denied', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { getByTestId, getByText } = render(<CaptureScreen />)

      expect(getByTestId('capture-screen-no-permission')).toBeTruthy()
      expect(getByText('Camera Access Required')).toBeTruthy()
    })

    it('should show permission denied state when microphone permission is denied', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: true,
        requestPermission: jest.fn(),
      })
      mockUseMicrophonePermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('capture-screen-no-permission')).toBeTruthy()
    })

    it('should show Grant Permission button when denied', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('request-permission-button')).toBeTruthy()
    })
  })

  describe('camera preview', () => {
    it('should render camera screen when permissions are granted', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('capture-screen')).toBeTruthy()
    })

    it('should render camera preview', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('camera-preview')).toBeTruthy()
    })

    it('should render recording overlay', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('recording-overlay')).toBeTruthy()
    })

    it('should render record button', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('record-button')).toBeTruthy()
    })

    it('should render back button', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('capture-back-button')).toBeTruthy()
    })
  })

  describe('navigation', () => {
    it('should navigate back when back button is pressed (not recording)', () => {
      const { getByTestId } = render(<CaptureScreen />)

      fireEvent.press(getByTestId('capture-back-button'))

      expect(mockBack).toHaveBeenCalled()
    })

    it('should navigate back from permission screen when Go Back is pressed', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { getByText } = render(<CaptureScreen />)

      fireEvent.press(getByText('Go Back'))

      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe('recording', () => {
    it('should show idle record button initially', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('record-button-idle')).toBeTruthy()
    })

    it('should show instruction when not recording', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('instruction-text')).toBeTruthy()
    })

    it('should have FPS badge visible', () => {
      const { getByTestId } = render(<CaptureScreen />)

      expect(getByTestId('fps-badge')).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('should have accessible back button', () => {
      const { getByTestId } = render(<CaptureScreen />)

      const backButton = getByTestId('capture-back-button')
      expect(backButton.props.accessibilityRole).toBe('button')
      expect(backButton.props.accessibilityLabel).toBe('Go back')
    })

    it('should have accessible permission button', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { getByTestId } = render(<CaptureScreen />)

      const permButton = getByTestId('request-permission-button')
      expect(permButton.props.accessibilityRole).toBe('button')
      expect(permButton.props.accessibilityLabel).toBe('Grant camera permission')
    })
  })
})
