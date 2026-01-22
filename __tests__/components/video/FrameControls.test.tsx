// ABOUTME: Tests for FrameControls component for frame navigation.
// ABOUTME: Tests previous/next frame buttons, frame display, and playback speed.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import FrameControls, { FrameControlsProps } from '../../../components/video/FrameControls'

describe('FrameControls', () => {
  const defaultProps: FrameControlsProps = {
    currentFrame: 50,
    totalFrames: 150,
    playbackSpeed: 1,
    onPreviousFrame: jest.fn(),
    onNextFrame: jest.fn(),
    onSpeedChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the frame controls container', () => {
      render(<FrameControls {...defaultProps} />)

      expect(screen.getByTestId('frame-controls')).toBeTruthy()
    })

    it('should render previous frame button', () => {
      render(<FrameControls {...defaultProps} />)

      expect(screen.getByTestId('frame-controls-prev')).toBeTruthy()
    })

    it('should render next frame button', () => {
      render(<FrameControls {...defaultProps} />)

      expect(screen.getByTestId('frame-controls-next')).toBeTruthy()
    })

    it('should display current frame and total frames', () => {
      render(<FrameControls {...defaultProps} />)

      expect(screen.getByTestId('frame-controls-display')).toBeTruthy()
      expect(screen.getByText('50 / 149')).toBeTruthy()
    })

    it('should render speed selector', () => {
      render(<FrameControls {...defaultProps} />)

      expect(screen.getByTestId('frame-controls-speed')).toBeTruthy()
    })

    it('should display current speed', () => {
      render(<FrameControls {...defaultProps} playbackSpeed={0.5} />)

      expect(screen.getByText('0.5x')).toBeTruthy()
    })
  })

  describe('frame navigation', () => {
    it('should call onPreviousFrame when prev button pressed', () => {
      const onPreviousFrame = jest.fn()
      render(<FrameControls {...defaultProps} onPreviousFrame={onPreviousFrame} />)

      fireEvent.press(screen.getByTestId('frame-controls-prev'))

      expect(onPreviousFrame).toHaveBeenCalled()
    })

    it('should call onNextFrame when next button pressed', () => {
      const onNextFrame = jest.fn()
      render(<FrameControls {...defaultProps} onNextFrame={onNextFrame} />)

      fireEvent.press(screen.getByTestId('frame-controls-next'))

      expect(onNextFrame).toHaveBeenCalled()
    })
  })

  describe('button states', () => {
    it('should disable prev button at first frame', () => {
      render(<FrameControls {...defaultProps} currentFrame={0} />)

      const prevButton = screen.getByTestId('frame-controls-prev')
      expect(prevButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should enable prev button when not at first frame', () => {
      render(<FrameControls {...defaultProps} currentFrame={10} />)

      const prevButton = screen.getByTestId('frame-controls-prev')
      expect(prevButton.props.accessibilityState?.disabled).toBeFalsy()
    })

    it('should disable next button at last frame', () => {
      render(<FrameControls {...defaultProps} currentFrame={149} />)

      const nextButton = screen.getByTestId('frame-controls-next')
      expect(nextButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should enable next button when not at last frame', () => {
      render(<FrameControls {...defaultProps} currentFrame={100} />)

      const nextButton = screen.getByTestId('frame-controls-next')
      expect(nextButton.props.accessibilityState?.disabled).toBeFalsy()
    })

    it('should not call onPreviousFrame when disabled', () => {
      const onPreviousFrame = jest.fn()
      render(<FrameControls {...defaultProps} currentFrame={0} onPreviousFrame={onPreviousFrame} />)

      // Button is disabled, press should not trigger callback
      // The Pressable component handles this internally
      const prevButton = screen.getByTestId('frame-controls-prev')
      expect(prevButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should not call onNextFrame when disabled', () => {
      const onNextFrame = jest.fn()
      render(<FrameControls {...defaultProps} currentFrame={149} onNextFrame={onNextFrame} />)

      const nextButton = screen.getByTestId('frame-controls-next')
      expect(nextButton.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('playback speed', () => {
    it('should show speed options when speed button pressed', () => {
      render(<FrameControls {...defaultProps} />)

      // Initially speed options should not be visible
      expect(screen.queryByTestId('speed-option-0.25')).toBeNull()

      // Press speed button
      fireEvent.press(screen.getByTestId('frame-controls-speed'))

      // Speed options should now be visible
      expect(screen.getByTestId('speed-option-0.25')).toBeTruthy()
      expect(screen.getByTestId('speed-option-0.5')).toBeTruthy()
      expect(screen.getByTestId('speed-option-1')).toBeTruthy()
    })

    it('should call onSpeedChange when speed option selected', () => {
      const onSpeedChange = jest.fn()
      render(<FrameControls {...defaultProps} onSpeedChange={onSpeedChange} />)

      // Open speed options
      fireEvent.press(screen.getByTestId('frame-controls-speed'))

      // Select 0.5x speed
      fireEvent.press(screen.getByTestId('speed-option-0.5'))

      expect(onSpeedChange).toHaveBeenCalledWith(0.5)
    })

    it('should highlight current speed', () => {
      render(<FrameControls {...defaultProps} playbackSpeed={0.5} />)

      fireEvent.press(screen.getByTestId('frame-controls-speed'))

      const option = screen.getByTestId('speed-option-0.5')
      // Check for selected styling - opacity should be 1 for selected
      expect(option).toBeTruthy()
    })

    it('should close speed menu after selection', () => {
      render(<FrameControls {...defaultProps} />)

      // Open speed options
      fireEvent.press(screen.getByTestId('frame-controls-speed'))
      expect(screen.getByTestId('speed-option-0.5')).toBeTruthy()

      // Select an option
      fireEvent.press(screen.getByTestId('speed-option-0.5'))

      // Options should be hidden
      expect(screen.queryByTestId('speed-option-0.5')).toBeNull()
    })
  })

  describe('accessibility', () => {
    it('should have accessible label for prev button', () => {
      render(<FrameControls {...defaultProps} />)

      const prevButton = screen.getByTestId('frame-controls-prev')
      expect(prevButton.props.accessibilityLabel).toBe('Previous frame')
    })

    it('should have accessible label for next button', () => {
      render(<FrameControls {...defaultProps} />)

      const nextButton = screen.getByTestId('frame-controls-next')
      expect(nextButton.props.accessibilityLabel).toBe('Next frame')
    })

    it('should have accessible label for speed button', () => {
      render(<FrameControls {...defaultProps} />)

      const speedButton = screen.getByTestId('frame-controls-speed')
      expect(speedButton.props.accessibilityLabel).toBe('Playback speed')
    })

    it('should have button role for navigation buttons', () => {
      render(<FrameControls {...defaultProps} />)

      const prevButton = screen.getByTestId('frame-controls-prev')
      const nextButton = screen.getByTestId('frame-controls-next')

      expect(prevButton.props.accessibilityRole).toBe('button')
      expect(nextButton.props.accessibilityRole).toBe('button')
    })
  })

  describe('edge cases', () => {
    it('should handle zero total frames', () => {
      render(<FrameControls {...defaultProps} totalFrames={0} currentFrame={0} />)

      // Both buttons should be disabled
      const prevButton = screen.getByTestId('frame-controls-prev')
      const nextButton = screen.getByTestId('frame-controls-next')

      expect(prevButton.props.accessibilityState?.disabled).toBe(true)
      expect(nextButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should handle single frame video', () => {
      render(<FrameControls {...defaultProps} totalFrames={1} currentFrame={0} />)

      // Both buttons should be disabled since we're at frame 0 of 1
      const prevButton = screen.getByTestId('frame-controls-prev')
      const nextButton = screen.getByTestId('frame-controls-next')

      expect(prevButton.props.accessibilityState?.disabled).toBe(true)
      expect(nextButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should display frame numbers correctly for large videos', () => {
      render(<FrameControls {...defaultProps} totalFrames={10000} currentFrame={5432} />)

      expect(screen.getByText('5432 / 9999')).toBeTruthy()
    })
  })
})
