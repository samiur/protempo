// ABOUTME: React hook for capturing high-speed video using the device camera.
// ABOUTME: Manages permissions, recording lifecycle, and duration tracking for golf swing videos.

import { useCallback, useRef, useState, useEffect } from 'react'
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera'
import { MAX_VIDEO_DURATION, MIN_FPS } from '../constants/videoSettings'
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
  /** Ref to attach to the CameraView component */
  cameraRef: React.RefObject<CameraView | null>
  /** Whether the camera is currently recording */
  isRecording: boolean
  /** Current recording duration in milliseconds */
  recordingDuration: number
  /** Actual FPS being used for recording */
  actualFps: number
  /** Permission state: true if granted, false if denied, null if not yet determined */
  hasPermission: boolean | null
  /** Request camera and microphone permissions */
  requestPermission: () => Promise<boolean>
  /** Start recording video */
  startRecording: () => Promise<void>
  /** Stop recording and return the video result */
  stopRecording: () => Promise<RecordingResult | null>
  /** Get the camera's capabilities */
  getCameraCapabilities: () => Promise<CameraCapabilities>
}

/**
 * Hook for capturing high-speed video using the device camera.
 *
 * Features:
 * - Manages camera and microphone permissions
 * - Tracks recording duration with a timer
 * - Auto-stops recording at MAX_VIDEO_DURATION
 * - Provides camera capabilities for quality selection
 *
 * @returns Camera capture controls and state
 */
export function useVideoCapture(): UseVideoCaptureReturn {
  const cameraRef = useRef<CameraView | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [actualFps] = useState(MIN_FPS)

  // Track the recording promise and timer
  const recordingPromiseRef = useRef<Promise<{ uri: string } | undefined> | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Use expo-camera permission hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions()
  const [micPermission, requestMicPermission] = useMicrophonePermissions()

  // Compute combined permission state
  const hasPermission =
    cameraPermission === null || micPermission === null
      ? null
      : cameraPermission.granted && micPermission.granted

  // Request both permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    const [cameraResult, micResult] = await Promise.all([
      requestCameraPermission(),
      requestMicPermission(),
    ])

    return cameraResult.granted && micResult.granted
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

  // Start recording
  const startRecording = useCallback(async (): Promise<void> => {
    if (isRecording) {
      return
    }

    if (!cameraRef.current) {
      return
    }

    setIsRecording(true)
    startDurationTimer()

    // Start recording and store the promise
    recordingPromiseRef.current = cameraRef.current.recordAsync()
  }, [isRecording, startDurationTimer])

  // Stop recording
  const stopRecording = useCallback(async (): Promise<RecordingResult | null> => {
    if (!cameraRef.current) {
      return null
    }

    // Trigger stop
    cameraRef.current.stopRecording()

    // Wait for the recording promise to resolve
    const result = await recordingPromiseRef.current

    const duration = Date.now() - startTimeRef.current

    // Clean up
    setIsRecording(false)
    stopDurationTimer()
    recordingPromiseRef.current = null

    if (!result) {
      return null
    }

    return {
      uri: result.uri,
      duration,
    }
  }, [stopDurationTimer])

  // Get camera capabilities
  const getCameraCapabilities = useCallback(async (): Promise<CameraCapabilities> => {
    // expo-camera doesn't expose detailed capabilities in JS
    // Return reasonable defaults that can be overridden by device detection
    return {
      maxFps: actualFps,
      supportsSlowMotion: actualFps > MIN_FPS,
      supportedRatios: ['16:9', '4:3'],
    }
  }, [actualFps])

  return {
    cameraRef,
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
