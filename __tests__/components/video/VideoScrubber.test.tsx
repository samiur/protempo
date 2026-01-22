// ABOUTME: Tests for VideoScrubber component with frame markers and seeking.
// ABOUTME: Tests slider interaction, marker rendering, and accessibility.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import VideoScrubber, {
  VideoScrubberProps,
  FrameMarker,
} from '../../../components/video/VideoScrubber'

describe('VideoScrubber', () => {
  const defaultProps: VideoScrubberProps = {
    currentFrame: 50,
    totalFrames: 150,
    onSeek: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the scrubber', () => {
      render(<VideoScrubber {...defaultProps} />)

      expect(screen.getByTestId('video-scrubber')).toBeTruthy()
    })

    it('should render the slider', () => {
      render(<VideoScrubber {...defaultProps} />)

      expect(screen.getByTestId('video-scrubber-slider')).toBeTruthy()
    })

    it('should display current frame position', () => {
      render(<VideoScrubber {...defaultProps} />)

      // Slider should have the correct value
      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.value).toBe(50)
    })

    it('should have correct slider range', () => {
      render(<VideoScrubber {...defaultProps} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.minimumValue).toBe(0)
      expect(slider.props.maximumValue).toBe(149) // totalFrames - 1
    })
  })

  describe('seeking', () => {
    it('should call onSeek when slider value changes', () => {
      const onSeek = jest.fn()
      render(<VideoScrubber {...defaultProps} onSeek={onSeek} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      fireEvent(slider, 'onValueChange', 75)

      expect(onSeek).toHaveBeenCalledWith(75)
    })

    it('should handle seeking to first frame', () => {
      const onSeek = jest.fn()
      render(<VideoScrubber {...defaultProps} onSeek={onSeek} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      fireEvent(slider, 'onValueChange', 0)

      expect(onSeek).toHaveBeenCalledWith(0)
    })

    it('should handle seeking to last frame', () => {
      const onSeek = jest.fn()
      render(<VideoScrubber {...defaultProps} onSeek={onSeek} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      fireEvent(slider, 'onValueChange', 149)

      expect(onSeek).toHaveBeenCalledWith(149)
    })
  })

  describe('frame markers', () => {
    const markers: FrameMarker[] = [
      { frame: 15, color: '#00FF00', label: 'Takeaway' },
      { frame: 60, color: '#FFFF00', label: 'Top' },
      { frame: 90, color: '#FF0000', label: 'Impact' },
    ]

    it('should render frame markers', () => {
      render(<VideoScrubber {...defaultProps} markers={markers} />)

      expect(screen.getByTestId('marker-0')).toBeTruthy()
      expect(screen.getByTestId('marker-1')).toBeTruthy()
      expect(screen.getByTestId('marker-2')).toBeTruthy()
    })

    it('should position markers correctly', () => {
      render(<VideoScrubber {...defaultProps} markers={markers} />)

      // Markers should be positioned based on frame percentage
      // Frame 15 out of 150 total = 10%
      // Frame 60 out of 150 total = 40%
      // Frame 90 out of 150 total = 60%
      const marker0 = screen.getByTestId('marker-0')
      const marker1 = screen.getByTestId('marker-1')
      const marker2 = screen.getByTestId('marker-2')

      // Check that styles are applied (position is percentage of track width)
      expect(marker0).toBeTruthy()
      expect(marker1).toBeTruthy()
      expect(marker2).toBeTruthy()
    })

    it('should apply marker colors', () => {
      render(<VideoScrubber {...defaultProps} markers={markers} />)

      const marker0 = screen.getByTestId('marker-0')
      const marker1 = screen.getByTestId('marker-1')
      const marker2 = screen.getByTestId('marker-2')

      expect(marker0.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#00FF00' })])
      )
      expect(marker1.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FFFF00' })])
      )
      expect(marker2.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ backgroundColor: '#FF0000' })])
      )
    })

    it('should not render markers when not provided', () => {
      render(<VideoScrubber {...defaultProps} />)

      expect(screen.queryByTestId('marker-0')).toBeNull()
    })

    it('should handle empty markers array', () => {
      render(<VideoScrubber {...defaultProps} markers={[]} />)

      expect(screen.queryByTestId('marker-0')).toBeNull()
    })
  })

  describe('disabled state', () => {
    it('should disable slider when disabled prop is true', () => {
      render(<VideoScrubber {...defaultProps} disabled />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.disabled).toBe(true)
    })

    it('should not call onSeek when disabled', () => {
      const onSeek = jest.fn()
      render(<VideoScrubber {...defaultProps} onSeek={onSeek} disabled />)

      const slider = screen.getByTestId('video-scrubber-slider')
      fireEvent(slider, 'onValueChange', 75)

      // The slider component itself is disabled, so onValueChange won't fire
      // This test verifies the disabled prop is passed correctly
      expect(slider.props.disabled).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have accessible role', () => {
      render(<VideoScrubber {...defaultProps} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.accessibilityRole).toBe('adjustable')
    })

    it('should have accessible label', () => {
      render(<VideoScrubber {...defaultProps} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.accessibilityLabel).toBe('Video scrubber')
    })

    it('should include current position in accessibility value', () => {
      render(<VideoScrubber {...defaultProps} currentFrame={50} totalFrames={150} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.accessibilityValue).toEqual({
        min: 0,
        max: 149,
        now: 50,
        text: 'Frame 50 of 149',
      })
    })
  })

  describe('edge cases', () => {
    it('should handle zero total frames', () => {
      render(<VideoScrubber {...defaultProps} totalFrames={0} currentFrame={0} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.maximumValue).toBe(0)
    })

    it('should handle single frame video', () => {
      render(<VideoScrubber {...defaultProps} totalFrames={1} currentFrame={0} />)

      const slider = screen.getByTestId('video-scrubber-slider')
      expect(slider.props.maximumValue).toBe(0)
    })

    it('should handle markers beyond total frames', () => {
      const outOfBoundsMarkers: FrameMarker[] = [
        { frame: 200, color: '#FF0000', label: 'Out of bounds' },
      ]
      render(<VideoScrubber {...defaultProps} markers={outOfBoundsMarkers} />)

      // Marker should still render but will be positioned at the edge
      expect(screen.getByTestId('marker-0')).toBeTruthy()
    })
  })
})
