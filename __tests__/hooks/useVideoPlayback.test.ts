// ABOUTME: Tests for useVideoPlayback hook that manages video playback state.
// ABOUTME: Tests frame calculation, seeking, speed control, and state management.

import { renderHook, act } from '@testing-library/react-native'

import { useVideoPlayback } from '../../hooks/useVideoPlayback'

describe('useVideoPlayback', () => {
  const defaultProps = {
    uri: 'file:///mock/video.mp4',
    fps: 30,
    duration: 5000, // 5 seconds = 150 frames at 30fps
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      expect(result.current.isPlaying).toBe(false)
      expect(result.current.currentFrame).toBe(0)
      expect(result.current.totalFrames).toBe(150) // 5000ms / 1000 * 30fps
      expect(result.current.playbackSpeed).toBe(1)
      expect(result.current.currentTimeMs).toBe(0)
    })

    it('should calculate total frames correctly for different fps', () => {
      const { result: result60fps } = renderHook(() =>
        useVideoPlayback({ ...defaultProps, fps: 60 })
      )
      expect(result60fps.current.totalFrames).toBe(300) // 5000ms / 1000 * 60fps

      const { result: result240fps } = renderHook(() =>
        useVideoPlayback({ ...defaultProps, fps: 240 })
      )
      expect(result240fps.current.totalFrames).toBe(1200) // 5000ms / 1000 * 240fps
    })

    it('should accept initial frame', () => {
      const { result } = renderHook(() => useVideoPlayback({ ...defaultProps, initialFrame: 45 }))

      expect(result.current.currentFrame).toBe(45)
    })
  })

  describe('play/pause', () => {
    it('should toggle play state when play is called', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      expect(result.current.isPlaying).toBe(false)

      act(() => {
        result.current.play()
      })

      expect(result.current.isPlaying).toBe(true)
    })

    it('should toggle pause state when pause is called', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.play()
      })
      expect(result.current.isPlaying).toBe(true)

      act(() => {
        result.current.pause()
      })
      expect(result.current.isPlaying).toBe(false)
    })

    it('should toggle play/pause with togglePlayPause', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.togglePlayPause()
      })
      expect(result.current.isPlaying).toBe(true)

      act(() => {
        result.current.togglePlayPause()
      })
      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('frame navigation', () => {
    it('should go to next frame', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.nextFrame()
      })

      expect(result.current.currentFrame).toBe(1)
    })

    it('should go to previous frame', () => {
      const { result } = renderHook(() => useVideoPlayback({ ...defaultProps, initialFrame: 10 }))

      act(() => {
        result.current.previousFrame()
      })

      expect(result.current.currentFrame).toBe(9)
    })

    it('should not go below frame 0', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.previousFrame()
      })

      expect(result.current.currentFrame).toBe(0)
    })

    it('should not go beyond total frames', () => {
      const { result } = renderHook(() => useVideoPlayback({ ...defaultProps, initialFrame: 149 }))

      act(() => {
        result.current.nextFrame()
      })

      // Should stay at last frame (150 - 1 = 149 since 0-indexed)
      expect(result.current.currentFrame).toBe(149)
    })

    it('should seek to specific frame', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.seekToFrame(75)
      })

      expect(result.current.currentFrame).toBe(75)
    })

    it('should clamp frame when seeking beyond bounds', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.seekToFrame(200)
      })
      expect(result.current.currentFrame).toBe(149) // Last valid frame

      act(() => {
        result.current.seekToFrame(-10)
      })
      expect(result.current.currentFrame).toBe(0)
    })

    it('should pause playback when navigating frames manually', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.play()
      })
      expect(result.current.isPlaying).toBe(true)

      act(() => {
        result.current.nextFrame()
      })
      expect(result.current.isPlaying).toBe(false)
    })
  })

  describe('time/frame conversion', () => {
    it('should convert frame to time correctly', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      // At 30fps, frame 30 = 1 second = 1000ms
      act(() => {
        result.current.seekToFrame(30)
      })

      expect(result.current.currentTimeMs).toBe(1000)
    })

    it('should convert time to frame correctly', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      // Seek to 2 seconds = frame 60 at 30fps
      act(() => {
        result.current.seekToTimeMs(2000)
      })

      expect(result.current.currentFrame).toBe(60)
    })

    it('should handle fractional frame times', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      // 1500ms at 30fps = 45 frames exactly
      act(() => {
        result.current.seekToTimeMs(1500)
      })

      expect(result.current.currentFrame).toBe(45)
    })
  })

  describe('playback speed', () => {
    it('should set playback speed', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.setPlaybackSpeed(0.5)
      })

      expect(result.current.playbackSpeed).toBe(0.5)
    })

    it('should clamp speed to valid range', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      act(() => {
        result.current.setPlaybackSpeed(0.1) // Below min
      })
      expect(result.current.playbackSpeed).toBe(0.25) // Min allowed

      act(() => {
        result.current.setPlaybackSpeed(5) // Above max
      })
      expect(result.current.playbackSpeed).toBe(2) // Max allowed for analysis
    })

    it('should accept valid speed values', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      const validSpeeds = [0.25, 0.5, 1, 2]

      validSpeeds.forEach((speed) => {
        act(() => {
          result.current.setPlaybackSpeed(speed)
        })
        expect(result.current.playbackSpeed).toBe(speed)
      })
    })
  })

  describe('onFrameChange callback', () => {
    it('should call onFrameChange when frame changes', () => {
      const onFrameChange = jest.fn()
      const { result } = renderHook(() => useVideoPlayback({ ...defaultProps, onFrameChange }))

      act(() => {
        result.current.seekToFrame(50)
      })

      expect(onFrameChange).toHaveBeenCalledWith(50)
    })

    it('should not call onFrameChange if frame does not change', () => {
      const onFrameChange = jest.fn()
      const { result } = renderHook(() => useVideoPlayback({ ...defaultProps, onFrameChange }))

      act(() => {
        result.current.seekToFrame(0)
      })

      // Should not be called since we're already at frame 0
      expect(onFrameChange).not.toHaveBeenCalled()
    })
  })

  describe('video player reference', () => {
    it('should expose the video player instance', () => {
      const { result } = renderHook(() => useVideoPlayback(defaultProps))

      expect(result.current.player).toBeDefined()
    })
  })

  describe('edge cases', () => {
    it('should handle zero duration video', () => {
      const { result } = renderHook(() => useVideoPlayback({ ...defaultProps, duration: 0 }))

      expect(result.current.totalFrames).toBe(0)
      expect(result.current.currentFrame).toBe(0)
    })

    it('should handle very short video', () => {
      const { result } = renderHook(
        () => useVideoPlayback({ ...defaultProps, duration: 100 }) // 100ms = 3 frames at 30fps
      )

      expect(result.current.totalFrames).toBe(3)
    })
  })
})
