// ABOUTME: Tests for the useVideoCapture hook.
// ABOUTME: Verifies camera permission handling, recording lifecycle, and duration tracking.

import { renderHook, act } from '@testing-library/react-native'
import {
  useCameraPermission,
  useMicrophonePermission,
  useCameraFormat,
} from 'react-native-vision-camera'
import { useVideoCapture } from '../../hooks/useVideoCapture'
import { MAX_VIDEO_DURATION, MIN_FPS } from '../../constants/videoSettings'

// Get mock function references
const mockUseCameraPermission = useCameraPermission as jest.Mock
const mockUseMicrophonePermission = useMicrophonePermission as jest.Mock
const mockUseCameraFormat = useCameraFormat as jest.Mock

describe('useVideoCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Default mock: permissions granted
    mockUseCameraPermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })
    mockUseMicrophonePermission.mockReturnValue({
      hasPermission: true,
      requestPermission: jest.fn().mockResolvedValue(true),
    })
    mockUseCameraFormat.mockReturnValue({
      maxFps: 240,
      videoWidth: 1920,
      videoHeight: 1080,
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initialization', () => {
    it('should provide a camera ref', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.cameraRef).toBeDefined()
      expect(result.current.cameraRef.current).toBeNull()
    })

    it('should not be recording initially', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.isRecording).toBe(false)
    })

    it('should have zero recording duration initially', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.recordingDuration).toBe(0)
    })

    it('should have null permission state when permissions are undefined', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: undefined,
        requestPermission: jest.fn(),
      })
      mockUseMicrophonePermission.mockReturnValue({
        hasPermission: undefined,
        requestPermission: jest.fn(),
      })

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBeNull()
    })

    it('should provide device and format from VisionCamera hooks', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.device).toBeDefined()
      expect(result.current.format).toBeDefined()
    })
  })

  describe('permissions', () => {
    it('should return true when both camera and microphone permissions are granted', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBe(true)
    })

    it('should return false when camera permission is not granted', () => {
      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBe(false)
    })

    it('should return false when microphone permission is not granted', () => {
      mockUseMicrophonePermission.mockReturnValue({
        hasPermission: false,
        requestPermission: jest.fn(),
      })

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBe(false)
    })

    it('should request both permissions when requestPermission is called', async () => {
      const mockRequestCamera = jest.fn().mockResolvedValue(true)
      const mockRequestMic = jest.fn().mockResolvedValue(true)

      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: mockRequestCamera,
      })
      mockUseMicrophonePermission.mockReturnValue({
        hasPermission: false,
        requestPermission: mockRequestMic,
      })

      const { result } = renderHook(() => useVideoCapture())

      let permissionResult: boolean | undefined
      await act(async () => {
        permissionResult = await result.current.requestPermission()
      })

      expect(mockRequestCamera).toHaveBeenCalled()
      expect(mockRequestMic).toHaveBeenCalled()
      expect(permissionResult).toBe(true)
    })

    it('should return false if camera permission is denied on request', async () => {
      const mockRequestCamera = jest.fn().mockResolvedValue(false)
      const mockRequestMic = jest.fn().mockResolvedValue(true)

      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: mockRequestCamera,
      })
      mockUseMicrophonePermission.mockReturnValue({
        hasPermission: false,
        requestPermission: mockRequestMic,
      })

      const { result } = renderHook(() => useVideoCapture())

      let permissionResult: boolean | undefined
      await act(async () => {
        permissionResult = await result.current.requestPermission()
      })

      expect(permissionResult).toBe(false)
    })

    it('should return false if microphone permission is denied on request', async () => {
      const mockRequestCamera = jest.fn().mockResolvedValue(true)
      const mockRequestMic = jest.fn().mockResolvedValue(false)

      mockUseCameraPermission.mockReturnValue({
        hasPermission: false,
        requestPermission: mockRequestCamera,
      })
      mockUseMicrophonePermission.mockReturnValue({
        hasPermission: false,
        requestPermission: mockRequestMic,
      })

      const { result } = renderHook(() => useVideoCapture())

      let permissionResult: boolean | undefined
      await act(async () => {
        permissionResult = await result.current.requestPermission()
      })

      expect(permissionResult).toBe(false)
    })
  })

  describe('recording', () => {
    it('should start recording when startRecording is called', async () => {
      const mockStartRecording = jest.fn()

      const { result } = renderHook(() => useVideoCapture())

      // Assign mock to the camera ref
      Object.assign(result.current.cameraRef, {
        current: {
          startRecording: mockStartRecording,
          stopRecording: jest.fn(),
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)
      expect(mockStartRecording).toHaveBeenCalled()
    })

    it('should track recording duration while recording', async () => {
      const mockStartRecording = jest.fn()

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          startRecording: mockStartRecording,
          stopRecording: jest.fn(),
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.recordingDuration).toBe(0)

      // Advance timer by 1 second
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      expect(result.current.recordingDuration).toBe(1000)

      // Advance timer by another second
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      expect(result.current.recordingDuration).toBe(2000)
    })

    it('should stop recording when stopRecording is called', async () => {
      const mockStopRecording = jest.fn()
      let onRecordingFinished: ((video: { path: string }) => void) | undefined

      const mockStartRecording = jest.fn(({ onRecordingFinished: cb }) => {
        onRecordingFinished = cb
      })

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          startRecording: mockStartRecording,
          stopRecording: mockStopRecording,
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)

      // Stop recording and trigger the callback
      await act(async () => {
        const stopPromise = result.current.stopRecording()
        // Simulate the callback being called
        if (onRecordingFinished) {
          onRecordingFinished({ path: 'file:///mock/video.mp4' })
        }
        const stopResult = await stopPromise
        expect(stopResult?.uri).toBe('file:///mock/video.mp4')
      })

      expect(mockStopRecording).toHaveBeenCalled()
      expect(result.current.isRecording).toBe(false)
    })

    it('should auto-stop at MAX_VIDEO_DURATION', async () => {
      const mockStopRecording = jest.fn()
      const mockStartRecording = jest.fn()

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          startRecording: mockStartRecording,
          stopRecording: mockStopRecording,
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      // Advance timer to max duration
      await act(async () => {
        jest.advanceTimersByTime(MAX_VIDEO_DURATION)
      })

      // Check that stop was called
      expect(mockStopRecording).toHaveBeenCalled()
    })

    it('should reset duration when recording stops', async () => {
      let onRecordingFinished: ((video: { path: string }) => void) | undefined

      const mockStartRecording = jest.fn(({ onRecordingFinished: cb }) => {
        onRecordingFinished = cb
      })

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          startRecording: mockStartRecording,
          stopRecording: jest.fn(),
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        jest.advanceTimersByTime(3000)
      })

      expect(result.current.recordingDuration).toBe(3000)

      await act(async () => {
        const stopPromise = result.current.stopRecording()
        if (onRecordingFinished) {
          onRecordingFinished({ path: 'file:///mock/video.mp4' })
        }
        await stopPromise
      })

      expect(result.current.recordingDuration).toBe(0)
    })

    it('should not start recording if already recording', async () => {
      const mockStartRecording = jest.fn()

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          startRecording: mockStartRecording,
          stopRecording: jest.fn(),
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        result.current.startRecording()
      })

      // startRecording should only be called once
      expect(mockStartRecording).toHaveBeenCalledTimes(1)
    })

    it('should not start recording without camera ref', async () => {
      const { result } = renderHook(() => useVideoCapture())

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(false)
    })
  })

  describe('camera capabilities', () => {
    it('should return camera capabilities from format', async () => {
      mockUseCameraFormat.mockReturnValue({
        maxFps: 240,
        videoWidth: 1920,
        videoHeight: 1080,
      })

      const { result } = renderHook(() => useVideoCapture())

      let capabilities: Awaited<ReturnType<typeof result.current.getCameraCapabilities>>
      await act(async () => {
        capabilities = await result.current.getCameraCapabilities()
      })

      expect(capabilities!).toEqual({
        maxFps: 240,
        supportsSlowMotion: true,
        supportedRatios: ['16:9', '4:3'],
      })
    })

    it('should return slow motion support based on FPS', async () => {
      mockUseCameraFormat.mockReturnValue({
        maxFps: 60,
        videoWidth: 1920,
        videoHeight: 1080,
      })

      const { result } = renderHook(() => useVideoCapture())

      let capabilities: Awaited<ReturnType<typeof result.current.getCameraCapabilities>>
      await act(async () => {
        capabilities = await result.current.getCameraCapabilities()
      })

      expect(capabilities!.supportsSlowMotion).toBe(false)
    })

    it('should fallback to MIN_FPS when format is null', async () => {
      mockUseCameraFormat.mockReturnValue(null)

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.actualFps).toBe(MIN_FPS)
    })
  })

  describe('actual FPS tracking', () => {
    it('should provide actualFps from format', () => {
      mockUseCameraFormat.mockReturnValue({
        maxFps: 240,
        videoWidth: 1920,
        videoHeight: 1080,
      })

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.actualFps).toBe(240)
    })

    it('should fallback to MIN_FPS when format has no maxFps', () => {
      mockUseCameraFormat.mockReturnValue({
        videoWidth: 1920,
        videoHeight: 1080,
      })

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.actualFps).toBe(MIN_FPS)
    })
  })
})
