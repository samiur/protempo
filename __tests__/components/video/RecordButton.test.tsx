// ABOUTME: Tests for the RecordButton component.
// ABOUTME: Verifies button states, press handlers, and visual feedback during recording.

import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import RecordButton from '../../../components/video/RecordButton'

describe('RecordButton', () => {
  const mockOnPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the button', () => {
      const { getByTestId } = render(<RecordButton isRecording={false} onPress={mockOnPress} />)

      expect(getByTestId('record-button')).toBeTruthy()
    })

    it('should have correct accessibility role', () => {
      const { getByTestId } = render(<RecordButton isRecording={false} onPress={mockOnPress} />)

      const button = getByTestId('record-button')
      expect(button.props.accessibilityRole).toBe('button')
    })

    it('should have accessibility label for idle state', () => {
      const { getByTestId } = render(<RecordButton isRecording={false} onPress={mockOnPress} />)

      const button = getByTestId('record-button')
      expect(button.props.accessibilityLabel).toBe('Start recording')
    })

    it('should have accessibility label for recording state', () => {
      const { getByTestId } = render(<RecordButton isRecording={true} onPress={mockOnPress} />)

      const button = getByTestId('record-button')
      expect(button.props.accessibilityLabel).toBe('Stop recording')
    })
  })

  describe('idle state', () => {
    it('should render white circular button when not recording', () => {
      const { getByTestId } = render(<RecordButton isRecording={false} onPress={mockOnPress} />)

      const innerCircle = getByTestId('record-button-inner')
      expect(innerCircle).toBeTruthy()
    })

    it('should show idle indicator when not recording', () => {
      const { getByTestId, queryByTestId } = render(
        <RecordButton isRecording={false} onPress={mockOnPress} />
      )

      expect(getByTestId('record-button-idle')).toBeTruthy()
      expect(queryByTestId('record-button-stop')).toBeNull()
    })
  })

  describe('recording state', () => {
    it('should render red square when recording', () => {
      const { getByTestId, queryByTestId } = render(
        <RecordButton isRecording={true} onPress={mockOnPress} />
      )

      expect(getByTestId('record-button-stop')).toBeTruthy()
      expect(queryByTestId('record-button-idle')).toBeNull()
    })
  })

  describe('press handler', () => {
    it('should call onPress when pressed in idle state', () => {
      const { getByTestId } = render(<RecordButton isRecording={false} onPress={mockOnPress} />)

      fireEvent.press(getByTestId('record-button'))

      expect(mockOnPress).toHaveBeenCalledTimes(1)
    })

    it('should call onPress when pressed in recording state', () => {
      const { getByTestId } = render(<RecordButton isRecording={true} onPress={mockOnPress} />)

      fireEvent.press(getByTestId('record-button'))

      expect(mockOnPress).toHaveBeenCalledTimes(1)
    })
  })

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByTestId } = render(
        <RecordButton isRecording={false} onPress={mockOnPress} disabled={true} />
      )

      const button = getByTestId('record-button')
      expect(button.props.accessibilityState.disabled).toBe(true)
    })

    it('should not call onPress when disabled', () => {
      const { getByTestId } = render(
        <RecordButton isRecording={false} onPress={mockOnPress} disabled={true} />
      )

      fireEvent.press(getByTestId('record-button'))

      expect(mockOnPress).not.toHaveBeenCalled()
    })

    it('should have reduced opacity when disabled', () => {
      const { getByTestId } = render(
        <RecordButton isRecording={false} onPress={mockOnPress} disabled={true} />
      )

      const button = getByTestId('record-button')
      // Check that styles include disabled opacity
      const flatStyle = Array.isArray(button.props.style)
        ? Object.assign({}, ...button.props.style)
        : button.props.style
      expect(flatStyle.opacity).toBe(0.5)
    })

    it('should be enabled by default', () => {
      const { getByTestId } = render(<RecordButton isRecording={false} onPress={mockOnPress} />)

      const button = getByTestId('record-button')
      expect(button.props.accessibilityState.disabled).toBe(false)
    })
  })
})
