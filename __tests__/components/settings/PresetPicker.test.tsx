// ABOUTME: Tests for PresetPicker component.
// ABOUTME: Verifies modal/bottom sheet preset selection functionality.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import PresetPicker from '../../../components/settings/PresetPicker'
import {
  LONG_GAME_PRESETS,
  SHORT_GAME_PRESETS,
  getTotalTime,
  formatTime,
} from '../../../constants/tempos'

describe('PresetPicker', () => {
  const defaultProps = {
    visible: true,
    presets: LONG_GAME_PRESETS,
    selectedPresetId: '24/8',
    onSelect: jest.fn(),
    onClose: jest.fn(),
    title: 'Long Game Default',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders when visible', () => {
      render(<PresetPicker {...defaultProps} />)

      expect(screen.getByTestId('preset-picker')).toBeTruthy()
    })

    it('does not render when not visible', () => {
      render(<PresetPicker {...defaultProps} visible={false} />)

      expect(screen.queryByTestId('preset-picker')).toBeNull()
    })

    it('renders title', () => {
      render(<PresetPicker {...defaultProps} />)

      expect(screen.getByText('Long Game Default')).toBeTruthy()
    })

    it('renders all preset options', () => {
      render(<PresetPicker {...defaultProps} />)

      LONG_GAME_PRESETS.forEach((preset) => {
        expect(screen.getByText(preset.label)).toBeTruthy()
      })
    })

    it('renders short game presets when provided', () => {
      render(
        <PresetPicker {...defaultProps} presets={SHORT_GAME_PRESETS} title="Short Game Default" />
      )

      SHORT_GAME_PRESETS.forEach((preset) => {
        expect(screen.getByText(preset.label)).toBeTruthy()
      })
    })

    it('displays preset total time', () => {
      render(<PresetPicker {...defaultProps} />)

      const firstPreset = LONG_GAME_PRESETS[0]
      const timeString = formatTime(getTotalTime(firstPreset))
      expect(screen.getByText(timeString)).toBeTruthy()
    })

    it('displays preset description', () => {
      render(<PresetPicker {...defaultProps} />)

      expect(screen.getByText('Tour average - most common tempo')).toBeTruthy()
    })
  })

  describe('selection', () => {
    it('highlights currently selected preset', () => {
      render(<PresetPicker {...defaultProps} selectedPresetId="24/8" />)

      const selectedItem = screen.getByTestId('preset-item-24/8')
      expect(selectedItem.props.accessibilityState?.selected).toBe(true)
    })

    it('shows checkmark on selected preset', () => {
      render(<PresetPicker {...defaultProps} selectedPresetId="24/8" />)

      expect(screen.getByTestId('preset-selected-24/8')).toBeTruthy()
    })

    it('does not show checkmark on unselected presets', () => {
      render(<PresetPicker {...defaultProps} selectedPresetId="24/8" />)

      expect(screen.queryByTestId('preset-selected-18/6')).toBeNull()
    })

    it('calls onSelect when preset is tapped', () => {
      const onSelect = jest.fn()
      render(<PresetPicker {...defaultProps} onSelect={onSelect} />)

      const presetItem = screen.getByTestId('preset-item-21/7')
      fireEvent.press(presetItem)

      expect(onSelect).toHaveBeenCalledWith('21/7')
    })

    it('calls onSelect with correct preset ID', () => {
      const onSelect = jest.fn()
      render(<PresetPicker {...defaultProps} onSelect={onSelect} />)

      const presetItem = screen.getByTestId('preset-item-27/9')
      fireEvent.press(presetItem)

      expect(onSelect).toHaveBeenCalledWith('27/9')
    })
  })

  describe('close behavior', () => {
    it('renders close button', () => {
      render(<PresetPicker {...defaultProps} />)

      expect(screen.getByTestId('preset-picker-close')).toBeTruthy()
    })

    it('calls onClose when close button pressed', () => {
      const onClose = jest.fn()
      render(<PresetPicker {...defaultProps} onClose={onClose} />)

      const closeButton = screen.getByTestId('preset-picker-close')
      fireEvent.press(closeButton)

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose when backdrop pressed', () => {
      const onClose = jest.fn()
      render(<PresetPicker {...defaultProps} onClose={onClose} />)

      const backdrop = screen.getByTestId('preset-picker-backdrop')
      fireEvent.press(backdrop)

      expect(onClose).toHaveBeenCalled()
    })

    it('calls onClose after selection', () => {
      const onClose = jest.fn()
      render(<PresetPicker {...defaultProps} onClose={onClose} />)

      const presetItem = screen.getByTestId('preset-item-21/7')
      fireEvent.press(presetItem)

      expect(onClose).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('has modal accessibility on container', () => {
      render(<PresetPicker {...defaultProps} />)

      const picker = screen.getByTestId('preset-picker')
      expect(picker.props.accessibilityViewIsModal).toBe(true)
    })

    it('preset items have button role', () => {
      render(<PresetPicker {...defaultProps} />)

      const presetItem = screen.getByTestId('preset-item-24/8')
      expect(presetItem.props.accessibilityRole).toBe('button')
    })

    it('preset items have proper label', () => {
      render(<PresetPicker {...defaultProps} />)

      const presetItem = screen.getByTestId('preset-item-24/8')
      expect(presetItem.props.accessibilityLabel).toContain('24/8')
    })

    it('close button has proper accessibility label', () => {
      render(<PresetPicker {...defaultProps} />)

      const closeButton = screen.getByTestId('preset-picker-close')
      expect(closeButton.props.accessibilityLabel).toBe('Close')
    })
  })
})
