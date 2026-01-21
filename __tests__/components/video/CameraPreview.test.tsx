// ABOUTME: Tests for the CameraPreview component.
// ABOUTME: Verifies camera preview rendering, aspect ratio handling, and grid overlay.

import React from 'react'
import { render } from '@testing-library/react-native'
import type { Camera, CameraDevice, CameraDeviceFormat } from 'react-native-vision-camera'
import CameraPreview from '../../../components/video/CameraPreview'

// Get mock function references
const mockUseCameraDevice = jest.requireMock('react-native-vision-camera').useCameraDevice

describe('CameraPreview', () => {
  const mockCameraRef = { current: null } as React.RefObject<Camera | null>
  const mockDevice = {
    id: 'back-camera',
    position: 'back',
    name: 'Back Camera',
    hasFlash: true,
    hasTorch: true,
    formats: [],
  } as unknown as CameraDevice
  const mockFormat = {
    maxFps: 240,
    videoWidth: 1920,
    videoHeight: 1080,
  } as unknown as CameraDeviceFormat

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCameraDevice.mockReturnValue(mockDevice)
  })

  describe('rendering', () => {
    it('should render the camera view when device is available', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
        />
      )

      expect(getByTestId('camera-preview')).toBeTruthy()
    })

    it('should render error message when device is unavailable', () => {
      const { getByText } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={undefined}
          format={mockFormat}
          isActive={true}
        />
      )

      expect(getByText('Camera not available')).toBeTruthy()
    })

    it('should pass correct props to Camera component', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
        />
      )

      const camera = getByTestId('camera-view')
      expect(camera.props.device).toBe(mockDevice)
      expect(camera.props.format).toBe(mockFormat)
      expect(camera.props.isActive).toBe(true)
    })

    it('should enable video recording', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
        />
      )

      const camera = getByTestId('camera-view')
      expect(camera.props.video).toBe(true)
    })

    it('should enable audio recording', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
        />
      )

      const camera = getByTestId('camera-view')
      expect(camera.props.audio).toBe(true)
    })
  })

  describe('grid overlay', () => {
    it('should render grid overlay when showGrid is true', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
          showGrid={true}
        />
      )

      expect(getByTestId('camera-grid-overlay')).toBeTruthy()
    })

    it('should not render grid overlay when showGrid is false', () => {
      const { queryByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
          showGrid={false}
        />
      )

      expect(queryByTestId('camera-grid-overlay')).toBeNull()
    })

    it('should not render grid overlay by default', () => {
      const { queryByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
        />
      )

      expect(queryByTestId('camera-grid-overlay')).toBeNull()
    })
  })

  describe('aspect ratio', () => {
    it('should render container with full-screen style', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={true}
        />
      )

      const container = getByTestId('camera-preview')
      expect(container.props.style).toMatchObject({
        flex: 1,
      })
    })
  })

  describe('active state', () => {
    it('should pass isActive false to Camera when not active', () => {
      const { getByTestId } = render(
        <CameraPreview
          cameraRef={mockCameraRef}
          device={mockDevice}
          format={mockFormat}
          isActive={false}
        />
      )

      const camera = getByTestId('camera-view')
      expect(camera.props.isActive).toBe(false)
    })
  })
})
