// ABOUTME: Tests for the RecordingOverlay component.
// ABOUTME: Verifies recording indicator, timer display, and FPS badge rendering.

import React from 'react'
import { render } from '@testing-library/react-native'
import RecordingOverlay from '../../../components/video/RecordingOverlay'

describe('RecordingOverlay', () => {
  describe('rendering', () => {
    it('should render the overlay container', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={0} fps={240} />
      )

      expect(getByTestId('recording-overlay')).toBeTruthy()
    })

    it('should not render when not recording and no instruction', () => {
      const { queryByTestId } = render(
        <RecordingOverlay isRecording={false} durationMs={0} fps={240} />
      )

      // Should only show FPS badge when not recording
      expect(queryByTestId('recording-indicator')).toBeNull()
      expect(queryByTestId('recording-timer')).toBeNull()
    })
  })

  describe('recording indicator', () => {
    it('should show red dot when recording', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={0} fps={240} />
      )

      expect(getByTestId('recording-indicator')).toBeTruthy()
    })

    it('should not show red dot when not recording', () => {
      const { queryByTestId } = render(
        <RecordingOverlay isRecording={false} durationMs={0} fps={240} />
      )

      expect(queryByTestId('recording-indicator')).toBeNull()
    })
  })

  describe('timer display', () => {
    it('should display 0:00 when duration is 0', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={0} fps={240} />
      )

      expect(getByTestId('recording-timer').props.children).toBe('0:00')
    })

    it('should display correct time for 5 seconds', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={5000} fps={240} />
      )

      expect(getByTestId('recording-timer').props.children).toBe('0:05')
    })

    it('should display correct time for 1 minute 30 seconds', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={90000} fps={240} />
      )

      expect(getByTestId('recording-timer').props.children).toBe('1:30')
    })

    it('should not show timer when not recording', () => {
      const { queryByTestId } = render(
        <RecordingOverlay isRecording={false} durationMs={5000} fps={240} />
      )

      expect(queryByTestId('recording-timer')).toBeNull()
    })
  })

  describe('FPS badge', () => {
    it('should display FPS value', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={0} fps={240} />
      )

      expect(getByTestId('fps-badge')).toBeTruthy()
      const children = getByTestId('fps-badge').props.children
      const text = Array.isArray(children) ? children.join('') : children
      expect(text).toContain('240')
    })

    it('should display FPS when not recording', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={false} durationMs={0} fps={120} />
      )

      const children = getByTestId('fps-badge').props.children
      const text = Array.isArray(children) ? children.join('') : children
      expect(text).toContain('120')
    })

    it('should format FPS correctly', () => {
      const { getByTestId } = render(
        <RecordingOverlay isRecording={true} durationMs={0} fps={60} />
      )

      const children = getByTestId('fps-badge').props.children
      const text = Array.isArray(children) ? children.join('') : children
      expect(text).toBe('60 FPS')
    })
  })

  describe('instruction text', () => {
    it('should display instruction when provided', () => {
      const { getByText } = render(
        <RecordingOverlay
          isRecording={false}
          durationMs={0}
          fps={240}
          instruction="Aim camera at your swing"
        />
      )

      expect(getByText('Aim camera at your swing')).toBeTruthy()
    })

    it('should not display instruction when not provided', () => {
      const { queryByTestId } = render(
        <RecordingOverlay isRecording={false} durationMs={0} fps={240} />
      )

      expect(queryByTestId('instruction-text')).toBeNull()
    })

    it('should hide instruction when recording', () => {
      const { queryByTestId } = render(
        <RecordingOverlay
          isRecording={true}
          durationMs={0}
          fps={240}
          instruction="Aim camera at your swing"
        />
      )

      expect(queryByTestId('instruction-text')).toBeNull()
    })
  })
})
