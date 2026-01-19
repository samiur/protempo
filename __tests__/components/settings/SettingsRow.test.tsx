// ABOUTME: Tests for SettingsRow component.
// ABOUTME: Verifies different row types: toggle, value display, navigation, and slider.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import SettingsRow from '../../../components/settings/SettingsRow'

describe('SettingsRow', () => {
  describe('basic rendering', () => {
    it('renders label', () => {
      render(<SettingsRow label="Tone Style" type="value" value="Beep" />)

      expect(screen.getByText('Tone Style')).toBeTruthy()
    })

    it('renders container with testID', () => {
      render(<SettingsRow label="Test Row" type="value" value="Test" />)

      expect(screen.getByTestId('settings-row')).toBeTruthy()
    })
  })

  describe('toggle type', () => {
    it('renders switch for toggle type', () => {
      render(
        <SettingsRow label="Keep Screen Awake" type="toggle" value={true} onToggle={jest.fn()} />
      )

      expect(screen.getByTestId('settings-toggle')).toBeTruthy()
    })

    it('shows switch as on when value is true', () => {
      render(
        <SettingsRow label="Keep Screen Awake" type="toggle" value={true} onToggle={jest.fn()} />
      )

      const toggle = screen.getByTestId('settings-toggle')
      expect(toggle.props.value).toBe(true)
    })

    it('shows switch as off when value is false', () => {
      render(
        <SettingsRow label="Keep Screen Awake" type="toggle" value={false} onToggle={jest.fn()} />
      )

      const toggle = screen.getByTestId('settings-toggle')
      expect(toggle.props.value).toBe(false)
    })

    it('calls onToggle when switch is pressed', () => {
      const onToggle = jest.fn()
      render(
        <SettingsRow label="Keep Screen Awake" type="toggle" value={false} onToggle={onToggle} />
      )

      const toggle = screen.getByTestId('settings-toggle')
      fireEvent(toggle, 'valueChange', true)

      expect(onToggle).toHaveBeenCalledWith(true)
    })

    it('calls onToggle with false when turning off', () => {
      const onToggle = jest.fn()
      render(
        <SettingsRow label="Keep Screen Awake" type="toggle" value={true} onToggle={onToggle} />
      )

      const toggle = screen.getByTestId('settings-toggle')
      fireEvent(toggle, 'valueChange', false)

      expect(onToggle).toHaveBeenCalledWith(false)
    })
  })

  describe('value type', () => {
    it('displays string value', () => {
      render(<SettingsRow label="Tone Style" type="value" value="Beep" />)

      expect(screen.getByText('Beep')).toBeTruthy()
    })

    it('displays different values correctly', () => {
      const { rerender } = render(<SettingsRow label="Tone Style" type="value" value="Voice" />)
      expect(screen.getByText('Voice')).toBeTruthy()

      rerender(<SettingsRow label="Delay" type="value" value="4 seconds" />)
      expect(screen.getByText('4 seconds')).toBeTruthy()
    })
  })

  describe('navigation type', () => {
    it('displays value for navigation type', () => {
      render(
        <SettingsRow
          label="Long Game Default"
          type="navigation"
          value="24/8 (1.07s)"
          onPress={jest.fn()}
        />
      )

      expect(screen.getByText('24/8 (1.07s)')).toBeTruthy()
    })

    it('shows navigation indicator', () => {
      render(
        <SettingsRow label="Long Game Default" type="navigation" value="24/8" onPress={jest.fn()} />
      )

      expect(screen.getByTestId('navigation-indicator')).toBeTruthy()
    })

    it('is pressable', () => {
      const onPress = jest.fn()
      render(
        <SettingsRow label="Long Game Default" type="navigation" value="24/8" onPress={onPress} />
      )

      const row = screen.getByTestId('settings-row-pressable')
      fireEvent.press(row)

      expect(onPress).toHaveBeenCalled()
    })

    it('calls onPress when tapped', () => {
      const onPress = jest.fn()
      render(
        <SettingsRow label="Long Game Default" type="navigation" value="24/8" onPress={onPress} />
      )

      const row = screen.getByTestId('settings-row-pressable')
      fireEvent.press(row)

      expect(onPress).toHaveBeenCalledTimes(1)
    })
  })

  describe('slider type', () => {
    it('renders slider', () => {
      render(
        <SettingsRow
          label="Volume"
          type="slider"
          value={0.5}
          onSliderChange={jest.fn()}
          sliderMin={0}
          sliderMax={1}
        />
      )

      expect(screen.getByTestId('settings-slider')).toBeTruthy()
    })

    it('displays formatted value', () => {
      render(
        <SettingsRow
          label="Volume"
          type="slider"
          value={0.5}
          onSliderChange={jest.fn()}
          sliderMin={0}
          sliderMax={1}
          valueFormatter={(v) => `${Math.round(v * 100)}%`}
        />
      )

      expect(screen.getByText('50%')).toBeTruthy()
    })

    it('calls onSliderChange when slider value changes', () => {
      const onSliderChange = jest.fn()
      render(
        <SettingsRow
          label="Volume"
          type="slider"
          value={0.5}
          onSliderChange={onSliderChange}
          sliderMin={0}
          sliderMax={1}
        />
      )

      const slider = screen.getByTestId('settings-slider')
      fireEvent(slider, 'valueChange', 0.8)

      expect(onSliderChange).toHaveBeenCalledWith(0.8)
    })

    it('respects slider min and max values', () => {
      render(
        <SettingsRow
          label="Volume"
          type="slider"
          value={0.5}
          onSliderChange={jest.fn()}
          sliderMin={0}
          sliderMax={1}
        />
      )

      const slider = screen.getByTestId('settings-slider')
      expect(slider.props.minimumValue).toBe(0)
      expect(slider.props.maximumValue).toBe(1)
    })

    it('supports slider step prop', () => {
      render(
        <SettingsRow
          label="Volume"
          type="slider"
          value={0.5}
          onSliderChange={jest.fn()}
          sliderMin={0}
          sliderMax={1}
          sliderStep={0.1}
        />
      )

      const slider = screen.getByTestId('settings-slider')
      expect(slider.props.step).toBe(0.1)
    })
  })

  describe('segmented type', () => {
    it('renders segmented options', () => {
      render(
        <SettingsRow
          label="Tone Style"
          type="segmented"
          value="beep"
          onSegmentChange={jest.fn()}
          segments={[
            { value: 'beep', label: 'Beep' },
            { value: 'voice', label: 'Voice' },
          ]}
        />
      )

      expect(screen.getByText('Beep')).toBeTruthy()
      expect(screen.getByText('Voice')).toBeTruthy()
    })

    it('highlights selected segment', () => {
      render(
        <SettingsRow
          label="Tone Style"
          type="segmented"
          value="beep"
          onSegmentChange={jest.fn()}
          segments={[
            { value: 'beep', label: 'Beep' },
            { value: 'voice', label: 'Voice' },
          ]}
        />
      )

      const beepButton = screen.getByTestId('segment-beep')
      expect(beepButton.props.accessibilityState?.selected).toBe(true)
    })

    it('calls onSegmentChange when segment is pressed', () => {
      const onSegmentChange = jest.fn()
      render(
        <SettingsRow
          label="Tone Style"
          type="segmented"
          value="beep"
          onSegmentChange={onSegmentChange}
          segments={[
            { value: 'beep', label: 'Beep' },
            { value: 'voice', label: 'Voice' },
          ]}
        />
      )

      const voiceButton = screen.getByTestId('segment-voice')
      fireEvent.press(voiceButton)

      expect(onSegmentChange).toHaveBeenCalledWith('voice')
    })
  })

  describe('accessibility', () => {
    it('has proper accessibility label for toggle', () => {
      render(
        <SettingsRow label="Keep Screen Awake" type="toggle" value={true} onToggle={jest.fn()} />
      )

      const toggle = screen.getByTestId('settings-toggle')
      expect(toggle.props.accessibilityLabel).toContain('Keep Screen Awake')
    })

    it('has proper accessibility label for navigation', () => {
      render(
        <SettingsRow label="Long Game Default" type="navigation" value="24/8" onPress={jest.fn()} />
      )

      const row = screen.getByTestId('settings-row-pressable')
      expect(row.props.accessibilityLabel).toContain('Long Game Default')
    })

    it('has button role for navigation type', () => {
      render(
        <SettingsRow label="Long Game Default" type="navigation" value="24/8" onPress={jest.fn()} />
      )

      const row = screen.getByTestId('settings-row-pressable')
      expect(row.props.accessibilityRole).toBe('button')
    })
  })
})
