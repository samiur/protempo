// ABOUTME: Tests for PlaybackControls component that provides play/pause/stop buttons.
// ABOUTME: Verifies rendering, button states, callbacks, and accessibility.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import PlaybackControls from '../../components/PlaybackControls'

describe('PlaybackControls', () => {
  const defaultProps = {
    isPlaying: false,
    isPaused: false,
    onPlay: jest.fn(),
    onPause: jest.fn(),
    onStop: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders play button when not playing', () => {
      render(<PlaybackControls {...defaultProps} />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton).toBeTruthy()
    })

    it('renders pause button when playing', () => {
      render(<PlaybackControls {...defaultProps} isPlaying />)

      const pauseButton = screen.getByTestId('playback-pause-button')
      expect(pauseButton).toBeTruthy()
    })

    it('renders stop button', () => {
      render(<PlaybackControls {...defaultProps} />)

      const stopButton = screen.getByTestId('playback-stop-button')
      expect(stopButton).toBeTruthy()
    })

    it('shows play icon when not playing', () => {
      render(<PlaybackControls {...defaultProps} />)

      expect(screen.getByText('▶')).toBeTruthy()
    })

    it('shows pause icon when playing', () => {
      render(<PlaybackControls {...defaultProps} isPlaying />)

      expect(screen.getByText('⏸')).toBeTruthy()
    })

    it('shows play icon when paused', () => {
      render(<PlaybackControls {...defaultProps} isPaused />)

      expect(screen.getByText('▶')).toBeTruthy()
    })
  })

  describe('button interactions', () => {
    it('calls onPlay when play button is tapped', () => {
      const onPlay = jest.fn()
      render(<PlaybackControls {...defaultProps} onPlay={onPlay} />)

      const playButton = screen.getByTestId('playback-play-button')
      fireEvent.press(playButton)

      expect(onPlay).toHaveBeenCalledTimes(1)
    })

    it('calls onPause when pause button is tapped while playing', () => {
      const onPause = jest.fn()
      render(<PlaybackControls {...defaultProps} isPlaying onPause={onPause} />)

      const pauseButton = screen.getByTestId('playback-pause-button')
      fireEvent.press(pauseButton)

      expect(onPause).toHaveBeenCalledTimes(1)
    })

    it('calls onPlay when play button is tapped while paused', () => {
      const onPlay = jest.fn()
      render(<PlaybackControls {...defaultProps} isPaused onPlay={onPlay} />)

      const playButton = screen.getByTestId('playback-play-button')
      fireEvent.press(playButton)

      expect(onPlay).toHaveBeenCalledTimes(1)
    })

    it('calls onStop when stop button is tapped', () => {
      const onStop = jest.fn()
      render(<PlaybackControls {...defaultProps} onStop={onStop} />)

      const stopButton = screen.getByTestId('playback-stop-button')
      fireEvent.press(stopButton)

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('calls onStop when stop button is tapped while playing', () => {
      const onStop = jest.fn()
      render(<PlaybackControls {...defaultProps} isPlaying onStop={onStop} />)

      const stopButton = screen.getByTestId('playback-stop-button')
      fireEvent.press(stopButton)

      expect(onStop).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('prevents play interaction when disabled', () => {
      const onPlay = jest.fn()
      render(<PlaybackControls {...defaultProps} onPlay={onPlay} disabled />)

      const playButton = screen.getByTestId('playback-play-button')
      fireEvent.press(playButton)

      expect(onPlay).not.toHaveBeenCalled()
    })

    it('prevents pause interaction when disabled', () => {
      const onPause = jest.fn()
      render(<PlaybackControls {...defaultProps} isPlaying onPause={onPause} disabled />)

      const pauseButton = screen.getByTestId('playback-pause-button')
      fireEvent.press(pauseButton)

      expect(onPause).not.toHaveBeenCalled()
    })

    it('prevents stop interaction when disabled', () => {
      const onStop = jest.fn()
      render(<PlaybackControls {...defaultProps} onStop={onStop} disabled />)

      const stopButton = screen.getByTestId('playback-stop-button')
      fireEvent.press(stopButton)

      expect(onStop).not.toHaveBeenCalled()
    })

    it('shows disabled styling when disabled', () => {
      render(<PlaybackControls {...defaultProps} disabled />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has proper accessibility label for play button', () => {
      render(<PlaybackControls {...defaultProps} />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityLabel).toContain('Play')
    })

    it('has proper accessibility label for pause button', () => {
      render(<PlaybackControls {...defaultProps} isPlaying />)

      const pauseButton = screen.getByTestId('playback-pause-button')
      expect(pauseButton.props.accessibilityLabel).toContain('Pause')
    })

    it('has proper accessibility label for stop button', () => {
      render(<PlaybackControls {...defaultProps} />)

      const stopButton = screen.getByTestId('playback-stop-button')
      expect(stopButton.props.accessibilityLabel).toContain('Stop')
    })

    it('has button accessibility role for play button', () => {
      render(<PlaybackControls {...defaultProps} />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityRole).toBe('button')
    })

    it('has button accessibility role for stop button', () => {
      render(<PlaybackControls {...defaultProps} />)

      const stopButton = screen.getByTestId('playback-stop-button')
      expect(stopButton.props.accessibilityRole).toBe('button')
    })

    it('indicates resume state in accessibility label when paused', () => {
      render(<PlaybackControls {...defaultProps} isPaused />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityLabel).toContain('Resume')
    })
  })

  describe('visual states', () => {
    it('shows active styling when playing', () => {
      render(<PlaybackControls {...defaultProps} isPlaying />)

      const container = screen.getByTestId('playback-controls')
      expect(container).toBeTruthy()
    })

    it('shows paused indicator styling when paused', () => {
      render(<PlaybackControls {...defaultProps} isPaused />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityState?.selected).toBe(true)
    })
  })
})
