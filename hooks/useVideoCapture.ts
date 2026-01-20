// ABOUTME: React hook for capturing high-speed video using react-native-vision-camera.
// ABOUTME: Manages permissions, recording lifecycle, and duration tracking for golf swing videos.

import { useCallback, useRef, useState, useEffect } from 'react'
import {
  Camera,
  CameraDevice,
  CameraCaptureError,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useMicrophonePermission,
  VideoFile,
} from 'react-native-vision-camera'
import { MAX_VIDEO_DURATION, MIN_FPS, TARGET_FPS } from '../constants/videoSettings'
import type { CameraCapabilities } from '../lib/cameraUtils'

/**
 * Result returned after stopping a recording.
 */
export interface RecordingResult {
  /** File path to the recorded video */
  uri: string
  /** Duration of the recording in milliseconds */
  duration: number
}

/**
 * Return type for the useVideoCapture hook.
 */
export interface UseVideoCaptureReturn {
  /** Ref to attach to the Camera component */
  cameraRef: React.RefObject<Camera | null>
  /** The selected camera device (back camera) */
  device: CameraDevice | undefined
  /** The selected camera format for high-FPS recording */
  format: ReturnType<typeof useCameraFormat>
  /** Whether the camera is currently recording */
  isRecording: boolean
  /** Current recording duration in milliseconds */
  recordingDuration: number
  /** Actual FPS being used for recording (from selected format) */
  actualFps: number
  /** Permission state: true if granted, false if denied, null if not yet determined */
  hasPermission: boolean | null
  /** Request camera and microphone permissions */
  requestPermission: () => Promise<boolean>
  /** Start recording video */
  startRecording: () => void
  /** Stop recording and return the video result */
  stopRecording: () => Promise<RecordingResult | null>
  /** Get the camera's capabilities */
  getCameraCapabilities: () => Promise<CameraCapabilities>
}

/**
 * Hook for capturing high-speed video using react-native-vision-camera.
 *
 * Features:
 * - Manages camera and microphone permissions
 * - Selects highest available FPS format (targets 240fps for golf swing analysis)
 * - Tracks recording duration with a timer
 * - Auto-stops recording at MAX_VIDEO_DURATION
 * - Provides camera capabilities for quality selection
 *
 * @returns Camera capture controls and state
 */
export function useVideoCapture(): UseVideoCaptureReturn {
  const cameraRef = useRef<Camera | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)

  // Track the recording promise resolve/reject and timer
  const recordingResolveRef = useRef<((result: RecordingResult) => void) | null>(null)
  const recordingRejectRef = useRef<((error: Error) => void) | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Use VisionCamera device and format hooks
  const device = useCameraDevice('back')
  const format = useCameraFormat(device, [
    { fps: TARGET_FPS }, // Priority 1: highest FPS (240fps target)
    { videoAspectRatio: 16 / 9 }, // Priority 2: widescreen
  ])

  // Calculate actual FPS from selected format
  const actualFps = format?.maxFps ?? MIN_FPS

  // Use VisionCamera permission hooks
  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } =
    useCameraPermission()
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission()

  // Combined permission state: null if either is undetermined, otherwise both must be granted
  const hasPermission =
    hasCameraPermission === undefined || hasMicPermission === undefined
      ? null
      : Boolean(hasCameraPermission && hasMicPermission)

  // Request both permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const [cameraResult, micResult] = await Promise.all([
      requestCameraPermission(),
      requestMicPermission(),
    ])

    return cameraResult && micResult
  }, [requestCameraPermission, requestMicPermission])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [])

  // Start the duration tracking timer
  const startDurationTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    setRecordingDuration(0)

    durationTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      setRecordingDuration(elapsed)

      // Auto-stop at max duration
      if (elapsed >= MAX_VIDEO_DURATION) {
        if (cameraRef.current) {
          cameraRef.current.stopRecording()
        }
      }
    }, 100) // Update every 100ms for smooth UI
  }, [])

  // Stop the duration tracking timer
  const stopDurationTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }
    setRecordingDuration(0)
  }, [])

  const onRecordingFinished = useCallback(
    (video: VideoFile) => {
      const duration = Date.now() - startTimeRef.current
      setIsRecording(false)
      stopDurationTimer()

      if (recordingResolveRef.current) {
        recordingResolveRef.current({ uri: video.path, duration })
        recordingResolveRef.current = null
        recordingRejectRef.current = null
      }
    },
    [stopDurationTimer]
  )

  const onRecordingError = useCallback(
    (error: CameraCaptureError) => {
      setIsRecording(false)
      stopDurationTimer()

      if (recordingRejectRef.current) {
        recordingRejectRef.current(new Error(error.message))
        recordingResolveRef.current = null
        recordingRejectRef.current = null
      }
    },
    [stopDurationTimer]
  )

  const startRecording = useCallback((): void => {
    if (isRecording || !cameraRef.current) {
      return
    }

    setIsRecording(true)
    startDurationTimer()

    cameraRef.current.startRecording({
      onRecordingFinished,
      onRecordingError,
    })
  }, [isRecording, startDurationTimer, onRecordingFinished, onRecordingError])

  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (!cameraRef.current) {
      return null
    }

    const resultPromise = new Promise<RecordingResult>((resolve, reject) => {
      recordingResolveRef.current = resolve
      recordingRejectRef.current = reject
    })

    cameraRef.current.stopRecording()

    try {
      return await resultPromise
    } catch {
      return null
    }
  }, [])

  const getCameraCapabilities = useCallback(async (): Promise<CameraCapabilities> => {
    return {
      maxFps: actualFps,
      supportsSlowMotion: actualFps >= 120,
      supportedRatios: ['16:9', '4:3'],
    }
  }, [actualFps])

  return {
    cameraRef,
    device,
    format,
    isRecording,
    recordingDuration,
    actualFps,
    hasPermission,
    requestPermission,
    startRecording,
    stopRecording,
    getCameraCapabilities,
  }
}
