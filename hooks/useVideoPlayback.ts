// ABOUTME: React hook for managing video playback state with frame-level control.
// ABOUTME: Provides play/pause, frame navigation, speed control, and time/frame conversion.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVideoPlayer } from 'expo-video'
import type { TimeUpdateEventPayload, PlayingChangeEventPayload } from 'expo-video'

/** Minimum allowed playback speed */
const MIN_PLAYBACK_SPEED = 0.25

/** Maximum allowed playback speed for analysis */
const MAX_PLAYBACK_SPEED = 2

/** Props for the useVideoPlayback hook */
export interface UseVideoPlaybackProps {
  /** URI of the video file */
  uri: string
  /** Frames per second of the video */
  fps: number
  /** Duration of the video in milliseconds */
  duration: number
  /** Initial frame to start playback from */
  initialFrame?: number
  /** Callback when the current frame changes */
  onFrameChange?: (frame: number) => void
}

/** Return value of the useVideoPlayback hook */
export interface UseVideoPlaybackReturn {
  /** The expo-video player instance */
  player: ReturnType<typeof useVideoPlayer>
  /** Whether the video is currently playing */
  isPlaying: boolean
  /** Current frame number (0-indexed) */
  currentFrame: number
  /** Total number of frames in the video */
  totalFrames: number
  /** Current playback speed (0.25 to 2) */
  playbackSpeed: number
  /** Current time in milliseconds */
  currentTimeMs: number

  /** Start playback */
  play: () => void
  /** Pause playback */
  pause: () => void
  /** Toggle play/pause state */
  togglePlayPause: () => void
  /** Move to the next frame (pauses playback) */
  nextFrame: () => void
  /** Move to the previous frame (pauses playback) */
  previousFrame: () => void
  /** Seek to a specific frame (pauses playback) */
  seekToFrame: (frame: number) => void
  /** Seek to a specific time in milliseconds */
  seekToTimeMs: (timeMs: number) => void
  /** Set the playback speed (0.25 to 2) */
  setPlaybackSpeed: (speed: number) => void
}

/** Clamp a value between min and max */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Convert time in milliseconds to frame number */
function msToFrame(ms: number, fps: number): number {
  return Math.floor((ms / 1000) * fps)
}

/** Convert a frame number to time in milliseconds */
function frameToMs(frame: number, fps: number): number {
  return (frame / fps) * 1000
}

/**
 * Hook for managing video playback with frame-level control.
 * Wraps expo-video's useVideoPlayer and provides frame-based navigation.
 */
export function useVideoPlayback({
  uri,
  fps,
  duration,
  initialFrame = 0,
  onFrameChange,
}: UseVideoPlaybackProps): UseVideoPlaybackReturn {
  // Calculate total frames from duration and fps
  const totalFrames = useMemo(() => {
    if (duration <= 0) return 0
    return Math.floor((duration / 1000) * fps)
  }, [duration, fps])

  // State
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(() =>
    clamp(initialFrame, 0, Math.max(0, totalFrames - 1))
  )
  const [playbackSpeed, setPlaybackSpeedState] = useState(1)

  // Track previous frame to avoid duplicate callbacks
  const previousFrameRef = useRef(currentFrame)

  // Create the video player
  const player = useVideoPlayer(uri, (p) => {
    if (initialFrame > 0) {
      p.currentTime = initialFrame / fps
    }
    p.timeUpdateEventInterval = 1 / fps
  })

  // Update currentFrame when time changes during playback
  useEffect(() => {
    if (!player) return

    const subscription = player.addListener(
      'timeUpdate',
      ({ currentTime: time }: TimeUpdateEventPayload) => {
        if (isPlaying) {
          const newFrame = clamp(Math.floor(time * fps), 0, Math.max(0, totalFrames - 1))
          setCurrentFrame((prev) => (newFrame !== prev ? newFrame : prev))
        }
      }
    )

    return () => {
      subscription.remove()
    }
  }, [player, fps, isPlaying, totalFrames])

  // Listen for playback ending
  useEffect(() => {
    if (!player) return

    const subscription = player.addListener('playToEnd', () => {
      setIsPlaying(false)
      // Stay at the last frame
      setCurrentFrame(Math.max(0, totalFrames - 1))
    })

    return () => {
      subscription.remove()
    }
  }, [player, totalFrames])

  // Sync playing state with player
  useEffect(() => {
    if (!player) return

    const subscription = player.addListener(
      'playingChange',
      ({ isPlaying: playing }: PlayingChangeEventPayload) => {
        setIsPlaying(playing)
      }
    )

    return () => {
      subscription.remove()
    }
  }, [player])

  // Calculate current time in ms
  const currentTimeMs = useMemo(() => {
    return frameToMs(currentFrame, fps)
  }, [currentFrame, fps])

  // Notify frame change callback
  useEffect(() => {
    if (currentFrame !== previousFrameRef.current) {
      previousFrameRef.current = currentFrame
      onFrameChange?.(currentFrame)
    }
  }, [currentFrame, onFrameChange])

  // Playback controls
  const play = useCallback(() => {
    player.play()
    setIsPlaying(true)
  }, [player])

  const pause = useCallback(() => {
    player.pause()
    setIsPlaying(false)
  }, [player])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // Frame navigation (pauses playback)
  const seekToFrame = useCallback(
    (frame: number) => {
      const maxFrame = Math.max(0, totalFrames - 1)
      const clampedFrame = clamp(frame, 0, maxFrame)

      // Don't do anything if we're already at this frame
      if (clampedFrame === currentFrame) return

      // Pause playback for manual navigation
      player.pause()
      setIsPlaying(false)

      player.currentTime = clampedFrame / fps
      setCurrentFrame(clampedFrame)
    },
    [currentFrame, fps, player, totalFrames]
  )

  const nextFrame = useCallback(() => {
    seekToFrame(currentFrame + 1)
  }, [currentFrame, seekToFrame])

  const previousFrame = useCallback(() => {
    seekToFrame(currentFrame - 1)
  }, [currentFrame, seekToFrame])

  const seekToTimeMs = useCallback(
    (timeMs: number) => {
      const frame = msToFrame(timeMs, fps)
      seekToFrame(frame)
    },
    [fps, seekToFrame]
  )

  // Speed control
  const setPlaybackSpeed = useCallback(
    (speed: number) => {
      const clampedSpeed = clamp(speed, MIN_PLAYBACK_SPEED, MAX_PLAYBACK_SPEED)
      player.playbackRate = clampedSpeed
      setPlaybackSpeedState(clampedSpeed)
    },
    [player]
  )

  return {
    player,
    isPlaying,
    currentFrame,
    totalFrames,
    playbackSpeed,
    currentTimeMs,
    play,
    pause,
    togglePlayPause,
    nextFrame,
    previousFrame,
    seekToFrame,
    seekToTimeMs,
    setPlaybackSpeed,
  }
}
