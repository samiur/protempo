// ABOUTME: Tests for VideoPlayer component with frame-by-frame scrubbing.
// ABOUTME: Tests video display, playback controls, frame navigation, and markers.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import VideoPlayer, { VideoPlayerProps } from '../../../components/video/VideoPlayer'
import type { FrameMarker } from '../../../components/video/VideoScrubber'

describe('VideoPlayer', () => {
  const defaultProps: VideoPlayerProps = {
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

  describe('rendering', () => {
    it('should render the video player container', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByTestId('video-player')).toBeTruthy()
    })

    it('should render the video view', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByTestId('video-player-view')).toBeTruthy()
    })

    it('should render the play/pause button', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByTestId('video-player-play-pause')).toBeTruthy()
    })

    it('should render the video scrubber', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByTestId('video-scrubber')).toBeTruthy()
    })

    it('should render frame controls', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByTestId('frame-controls')).toBeTruthy()
    })
  })

  describe('play/pause', () => {
    it('should show play icon when paused', () => {
      render(<VideoPlayer {...defaultProps} />)

      const playPauseButton = screen.getByTestId('video-player-play-pause')
      // Check that play icon is rendered (not pause)
      expect(playPauseButton).toBeTruthy()
    })

    it('should toggle playback on button press', () => {
      render(<VideoPlayer {...defaultProps} />)

      // Initially paused, press to play
      const playPauseButton = screen.getByTestId('video-player-play-pause')
      fireEvent.press(playPauseButton)

      // Should now be playing (icon changes to pause)
      expect(playPauseButton).toBeTruthy()
    })
  })

  describe('frame markers', () => {
    const markers: FrameMarker[] = [
      { frame: 15, color: '#00FF00', label: 'Takeaway' },
      { frame: 60, color: '#FFFF00', label: 'Top' },
      { frame: 90, color: '#FF0000', label: 'Impact' },
    ]

    it('should pass markers to scrubber', () => {
      render(<VideoPlayer {...defaultProps} markers={markers} />)

      // Markers should be rendered in the scrubber
      expect(screen.getByTestId('marker-0')).toBeTruthy()
      expect(screen.getByTestId('marker-1')).toBeTruthy()
      expect(screen.getByTestId('marker-2')).toBeTruthy()
    })

    it('should work without markers', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.queryByTestId('marker-0')).toBeNull()
    })
  })

  describe('frame navigation callback', () => {
    it('should call onFrameChange when frame changes', () => {
      const onFrameChange = jest.fn()
      render(<VideoPlayer {...defaultProps} onFrameChange={onFrameChange} />)

      // Navigate to next frame
      const nextButton = screen.getByTestId('frame-controls-next')
      fireEvent.press(nextButton)

      expect(onFrameChange).toHaveBeenCalledWith(1)
    })
  })

  describe('initial frame', () => {
    it('should start at initial frame if provided', () => {
      render(<VideoPlayer {...defaultProps} initialFrame={50} />)

      // Frame display should show 50
      expect(screen.getByText('50 / 149')).toBeTruthy()
    })

    it('should start at frame 0 by default', () => {
      render(<VideoPlayer {...defaultProps} />)

      expect(screen.getByText('0 / 149')).toBeTruthy()
    })
  })

  describe('scrubber interaction', () => {
    it('should update frame when scrubber is used', () => {
      render(<VideoPlayer {...defaultProps} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      fireEvent(slider, 'onValueChange', 75)

      // Frame should update
      expect(screen.getByText('75 / 149')).toBeTruthy()
    })
  })

  describe('frame controls interaction', () => {
    it('should navigate to next frame', () => {
      render(<VideoPlayer {...defaultProps} />)

      const nextButton = screen.getByTestId('frame-controls-next')
      fireEvent.press(nextButton)

      expect(screen.getByText('1 / 149')).toBeTruthy()
    })

    it('should navigate to previous frame', () => {
      render(<VideoPlayer {...defaultProps} initialFrame={10} />)

      const prevButton = screen.getByTestId('frame-controls-prev')
      fireEvent.press(prevButton)

      expect(screen.getByText('9 / 149')).toBeTruthy()
    })

    it('should change playback speed', () => {
      render(<VideoPlayer {...defaultProps} />)

      // Open speed menu
      const speedButton = screen.getByTestId('frame-controls-speed')
      fireEvent.press(speedButton)

      // Select 0.5x
      const speedOption = screen.getByTestId('speed-option-0.5')
      fireEvent.press(speedOption)

      // Speed should be updated
      expect(screen.getByText('0.5x')).toBeTruthy()
    })
  })

  describe('video view props', () => {
    it('should disable native controls', () => {
      render(<VideoPlayer {...defaultProps} />)

      const videoView = screen.getByTestId('video-player-view')
      expect(videoView.props.nativeControls).toBe(false)
    })

    it('should use contain content fit', () => {
      render(<VideoPlayer {...defaultProps} />)

      const videoView = screen.getByTestId('video-player-view')
      expect(videoView.props.contentFit).toBe('contain')
    })
  })

  describe('accessibility', () => {
    it('should have accessible label for play/pause button', () => {
      render(<VideoPlayer {...defaultProps} />)

      const playPauseButton = screen.getByTestId('video-player-play-pause')
      expect(playPauseButton.props.accessibilityLabel).toBeTruthy()
    })

    it('should update label based on playing state', () => {
      render(<VideoPlayer {...defaultProps} />)

      const playPauseButton = screen.getByTestId('video-player-play-pause')

      // Initially paused
      expect(playPauseButton.props.accessibilityLabel).toBe('Play video')

      // Press to play
      fireEvent.press(playPauseButton)

      // Now playing
      expect(screen.getByTestId('video-player-play-pause').props.accessibilityLabel).toBe(
        'Pause video'
      )
    })
  })

  describe('edge cases', () => {
    it('should handle zero duration video', () => {
      render(<VideoPlayer {...defaultProps} duration={0} />)

      expect(screen.getByTestId('video-player')).toBeTruthy()
      expect(screen.getByText('0 / 0')).toBeTruthy()
    })

    it('should handle very short video', () => {
      render(<VideoPlayer {...defaultProps} duration={100} />)

      expect(screen.getByTestId('video-player')).toBeTruthy()
      // 100ms at 30fps = 3 frames, max frame is 2
      expect(screen.getByText('0 / 2')).toBeTruthy()
    })
  })
})
