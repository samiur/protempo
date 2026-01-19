// ABOUTME: Tests for SessionControls component with delay slider and mode toggle.
// ABOUTME: Verifies slider behavior, mode selection, disabled state, and accessibility.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import SessionControls from '../../components/SessionControls'
import type { PlaybackMode } from '../../types/tempo'

describe('SessionControls', () => {
  const defaultProps = {
    delaySeconds: 4,
    onDelayChange: jest.fn(),
    playbackMode: 'continuous' as PlaybackMode,
    onModeChange: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('delay slider', () => {
    describe('rendering', () => {
      it('renders delay label', () => {
        render(<SessionControls {...defaultProps} />)

        expect(screen.getByText('Delay between reps')).toBeTruthy()
      })

      it('displays current delay value', () => {
        render(<SessionControls {...defaultProps} delaySeconds={4} />)

        expect(screen.getByText('4s')).toBeTruthy()
      })

      it('displays different delay values correctly', () => {
        const { rerender } = render(<SessionControls {...defaultProps} delaySeconds={5} />)
        expect(screen.getByText('5s')).toBeTruthy()

        rerender(<SessionControls {...defaultProps} delaySeconds={7} />)
        expect(screen.getByText('7s')).toBeTruthy()
      })

      it('renders slider component', () => {
        render(<SessionControls {...defaultProps} />)

        const slider = screen.getByTestId('delay-slider')
        expect(slider).toBeTruthy()
      })

      it('shows min and max labels', () => {
        render(<SessionControls {...defaultProps} />)

        expect(screen.getByText('2s')).toBeTruthy()
        expect(screen.getByText('10s')).toBeTruthy()
      })
    })

    describe('interaction', () => {
      it('calls onDelayChange when slider value changes', () => {
        const onDelayChange = jest.fn()
        render(<SessionControls {...defaultProps} onDelayChange={onDelayChange} />)

        const slider = screen.getByTestId('delay-slider')
        fireEvent(slider, 'valueChange', 6)

        expect(onDelayChange).toHaveBeenCalledWith(6)
      })

      it('slider respects minimum bound (2 seconds)', () => {
        render(<SessionControls {...defaultProps} delaySeconds={2} />)

        const slider = screen.getByTestId('delay-slider')
        expect(slider.props.minimumValue).toBe(2)
      })

      it('slider respects maximum bound (10 seconds)', () => {
        render(<SessionControls {...defaultProps} delaySeconds={10} />)

        const slider = screen.getByTestId('delay-slider')
        expect(slider.props.maximumValue).toBe(10)
      })

      it('slider has step of 1 second', () => {
        render(<SessionControls {...defaultProps} />)

        const slider = screen.getByTestId('delay-slider')
        expect(slider.props.step).toBe(1)
      })
    })
  })

  describe('mode toggle', () => {
    describe('rendering', () => {
      it('renders continuous option', () => {
        render(<SessionControls {...defaultProps} />)

        expect(screen.getByText('Continuous')).toBeTruthy()
      })

      it('renders single rep option', () => {
        render(<SessionControls {...defaultProps} />)

        expect(screen.getByText('Single Rep')).toBeTruthy()
      })

      it('shows continuous as selected when playbackMode is continuous', () => {
        render(<SessionControls {...defaultProps} playbackMode="continuous" />)

        const continuousButton = screen.getByTestId('mode-continuous')
        expect(continuousButton.props.accessibilityState?.selected).toBe(true)
      })

      it('shows single as selected when playbackMode is single', () => {
        render(<SessionControls {...defaultProps} playbackMode="single" />)

        const singleButton = screen.getByTestId('mode-single')
        expect(singleButton.props.accessibilityState?.selected).toBe(true)
      })
    })

    describe('interaction', () => {
      it('calls onModeChange with continuous when continuous tapped', () => {
        const onModeChange = jest.fn()
        render(
          <SessionControls {...defaultProps} playbackMode="single" onModeChange={onModeChange} />
        )

        const continuousButton = screen.getByTestId('mode-continuous')
        fireEvent.press(continuousButton)

        expect(onModeChange).toHaveBeenCalledWith('continuous')
      })

      it('calls onModeChange with single when single tapped', () => {
        const onModeChange = jest.fn()
        render(
          <SessionControls
            {...defaultProps}
            playbackMode="continuous"
            onModeChange={onModeChange}
          />
        )

        const singleButton = screen.getByTestId('mode-single')
        fireEvent.press(singleButton)

        expect(onModeChange).toHaveBeenCalledWith('single')
      })

      it('still calls callback when selecting already selected mode', () => {
        const onModeChange = jest.fn()
        render(
          <SessionControls
            {...defaultProps}
            playbackMode="continuous"
            onModeChange={onModeChange}
          />
        )

        const continuousButton = screen.getByTestId('mode-continuous')
        fireEvent.press(continuousButton)

        expect(onModeChange).toHaveBeenCalledWith('continuous')
      })
    })
  })

  describe('disabled state', () => {
    it('prevents slider interaction when disabled', () => {
      const onDelayChange = jest.fn()
      render(<SessionControls {...defaultProps} onDelayChange={onDelayChange} disabled />)

      const slider = screen.getByTestId('delay-slider')
      expect(slider.props.disabled).toBe(true)
    })

    it('prevents mode toggle interaction when disabled', () => {
      const onModeChange = jest.fn()
      render(<SessionControls {...defaultProps} onModeChange={onModeChange} disabled />)

      const continuousButton = screen.getByTestId('mode-continuous')
      fireEvent.press(continuousButton)

      expect(onModeChange).not.toHaveBeenCalled()
    })

    it('shows disabled styling when disabled', () => {
      render(<SessionControls {...defaultProps} disabled />)

      const container = screen.getByTestId('session-controls')
      expect(container.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has proper accessibility label for slider', () => {
      render(<SessionControls {...defaultProps} delaySeconds={4} />)

      const slider = screen.getByTestId('delay-slider')
      expect(slider.props.accessibilityLabel).toContain('Delay')
      expect(slider.props.accessibilityLabel).toContain('4')
    })

    it('has proper accessibility label for continuous button', () => {
      render(<SessionControls {...defaultProps} />)

      const continuousButton = screen.getByTestId('mode-continuous')
      expect(continuousButton.props.accessibilityLabel).toContain('Continuous')
    })

    it('has proper accessibility label for single button', () => {
      render(<SessionControls {...defaultProps} />)

      const singleButton = screen.getByTestId('mode-single')
      expect(singleButton.props.accessibilityLabel).toContain('Single')
    })

    it('has button accessibility role for mode toggles', () => {
      render(<SessionControls {...defaultProps} />)

      const continuousButton = screen.getByTestId('mode-continuous')
      const singleButton = screen.getByTestId('mode-single')

      expect(continuousButton.props.accessibilityRole).toBe('button')
      expect(singleButton.props.accessibilityRole).toBe('button')
    })

    it('has adjustable accessibility role for slider', () => {
      render(<SessionControls {...defaultProps} />)

      const slider = screen.getByTestId('delay-slider')
      expect(slider.props.accessibilityRole).toBe('adjustable')
    })
  })

  describe('visual layout', () => {
    it('renders container', () => {
      render(<SessionControls {...defaultProps} />)

      const container = screen.getByTestId('session-controls')
      expect(container).toBeTruthy()
    })

    it('renders delay section', () => {
      render(<SessionControls {...defaultProps} />)

      const delaySection = screen.getByTestId('delay-section')
      expect(delaySection).toBeTruthy()
    })

    it('renders mode toggle section', () => {
      render(<SessionControls {...defaultProps} />)

      const modeSection = screen.getByTestId('mode-section')
      expect(modeSection).toBeTruthy()
    })
  })
})
