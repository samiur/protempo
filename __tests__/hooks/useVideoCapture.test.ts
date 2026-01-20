// ABOUTME: Tests for the useVideoCapture hook.
// ABOUTME: Verifies camera permission handling, recording lifecycle, and duration tracking.

import { renderHook, act } from '@testing-library/react-native'
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { useVideoCapture } from '../../hooks/useVideoCapture'
import { MAX_VIDEO_DURATION } from '../../constants/videoSettings'

// Get mock function references
const mockUseCameraPermissions = useCameraPermissions as jest.Mock
const mockUseMicrophonePermissions = useMicrophonePermissions as jest.Mock

describe('useVideoCapture', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    // Default mock: permissions granted
    mockUseCameraPermissions.mockReturnValue([
      { granted: true, canAskAgain: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ])
    mockUseMicrophonePermissions.mockReturnValue([
      { granted: true, canAskAgain: true },
      jest.fn().mockResolvedValue({ granted: true }),
    ])
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

    it('should have null permission state before permissions are checked', () => {
      mockUseCameraPermissions.mockReturnValue([null, jest.fn()])
      mockUseMicrophonePermissions.mockReturnValue([null, jest.fn()])

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBeNull()
    })
  })

  describe('permissions', () => {
    it('should return true when both camera and microphone permissions are granted', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBe(true)
    })

    it('should return false when camera permission is not granted', () => {
      mockUseCameraPermissions.mockReturnValue([{ granted: false, canAskAgain: true }, jest.fn()])

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBe(false)
    })

    it('should return false when microphone permission is not granted', () => {
      mockUseMicrophonePermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        jest.fn(),
      ])

      const { result } = renderHook(() => useVideoCapture())

      expect(result.current.hasPermission).toBe(false)
    })

    it('should request both permissions when requestPermission is called', async () => {
      const mockRequestCamera = jest.fn().mockResolvedValue({ granted: true })
      const mockRequestMic = jest.fn().mockResolvedValue({ granted: true })

      mockUseCameraPermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        mockRequestCamera,
      ])
      mockUseMicrophonePermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        mockRequestMic,
      ])

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
      const mockRequestCamera = jest.fn().mockResolvedValue({ granted: false })
      const mockRequestMic = jest.fn().mockResolvedValue({ granted: true })

      mockUseCameraPermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        mockRequestCamera,
      ])
      mockUseMicrophonePermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        mockRequestMic,
      ])

      const { result } = renderHook(() => useVideoCapture())

      let permissionResult: boolean | undefined
      await act(async () => {
        permissionResult = await result.current.requestPermission()
      })

      expect(permissionResult).toBe(false)
    })

    it('should return false if microphone permission is denied on request', async () => {
      const mockRequestCamera = jest.fn().mockResolvedValue({ granted: true })
      const mockRequestMic = jest.fn().mockResolvedValue({ granted: false })

      mockUseCameraPermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        mockRequestCamera,
      ])
      mockUseMicrophonePermissions.mockReturnValue([
        { granted: false, canAskAgain: true },
        mockRequestMic,
      ])

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
      const mockRecordAsync = jest.fn().mockResolvedValue({
        uri: 'file:///mock/video.mp4',
      })

      const { result } = renderHook(() => useVideoCapture())

      // Assign mock to the camera ref
      Object.assign(result.current.cameraRef, {
        current: {
          recordAsync: mockRecordAsync,
          stopRecording: jest.fn(),
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)
    })

    it('should track recording duration while recording', async () => {
      const mockRecordAsync = jest.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves to simulate ongoing recording
          })
      )

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          recordAsync: mockRecordAsync,
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
      let resolveRecording: (value: { uri: string }) => void
      const mockRecordAsync = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRecording = resolve
          })
      )

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          recordAsync: mockRecordAsync,
          stopRecording: mockStopRecording,
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      expect(result.current.isRecording).toBe(true)

      // Simulate recording completing
      await act(async () => {
        resolveRecording({ uri: 'file:///mock/video.mp4' })
        const stopResult = await result.current.stopRecording()
        expect(stopResult?.uri).toBe('file:///mock/video.mp4')
      })

      expect(mockStopRecording).toHaveBeenCalled()
      expect(result.current.isRecording).toBe(false)
    })

    it('should auto-stop at MAX_VIDEO_DURATION', async () => {
      const mockStopRecording = jest.fn()
      const mockRecordAsync = jest.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          recordAsync: mockRecordAsync,
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
      let resolveRecording: (value: { uri: string }) => void
      const mockRecordAsync = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveRecording = resolve
          })
      )

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          recordAsync: mockRecordAsync,
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
        resolveRecording({ uri: 'file:///mock/video.mp4' })
        await result.current.stopRecording()
      })

      expect(result.current.recordingDuration).toBe(0)
    })

    it('should not start recording if already recording', async () => {
      const mockRecordAsync = jest.fn().mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves
          })
      )

      const { result } = renderHook(() => useVideoCapture())

      Object.assign(result.current.cameraRef, {
        current: {
          recordAsync: mockRecordAsync,
          stopRecording: jest.fn(),
        },
      })

      await act(async () => {
        result.current.startRecording()
      })

      await act(async () => {
        result.current.startRecording()
      })

      // recordAsync should only be called once
      expect(mockRecordAsync).toHaveBeenCalledTimes(1)
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
    it('should return camera capabilities', async () => {
      const { result } = renderHook(() => useVideoCapture())

      let capabilities: Awaited<ReturnType<typeof result.current.getCameraCapabilities>>
      await act(async () => {
        capabilities = await result.current.getCameraCapabilities()
      })

      expect(capabilities!).toEqual({
        maxFps: 60,
        supportsSlowMotion: false,
        supportedRatios: ['16:9', '4:3'],
      })
    })
  })

  describe('actual FPS tracking', () => {
    it('should provide actualFps property', () => {
      const { result } = renderHook(() => useVideoCapture())

      expect(typeof result.current.actualFps).toBe('number')
    })
  })
})
