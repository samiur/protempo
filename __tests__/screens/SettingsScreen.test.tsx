// ABOUTME: Tests for Settings screen with all user preferences.
// ABOUTME: Verifies settings sections, interactions, persistence, and reset functionality.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'
import { Alert } from 'react-native'

import SettingsScreen from '../../app/(tabs)/settings'
import { useSettingsStore } from '../../stores/settingsStore'
import {
  LONG_GAME_PRESETS,
  SHORT_GAME_PRESETS,
  getTotalTime,
  formatTime,
} from '../../constants/tempos'

// Mock Alert.alert
jest.spyOn(Alert, 'alert')

// Reset store before each test
beforeEach(() => {
  useSettingsStore.setState({
    defaultLongGamePresetId: '24/8',
    defaultShortGamePresetId: '18/9',
    toneStyle: 'beep',
    keepScreenAwake: true,
    volume: 1.0,
    delayBetweenReps: 4,
    hasCompletedOnboarding: false,
    _hasHydrated: true,
  })
  jest.clearAllMocks()
})

describe('SettingsScreen', () => {
  describe('layout', () => {
    it('renders settings title', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Settings')).toBeTruthy()
    })

    it('renders audio section', () => {
      render(<SettingsScreen />)

      expect(screen.getByTestId('settings-section-AUDIO')).toBeTruthy()
    })

    it('renders defaults section', () => {
      render(<SettingsScreen />)

      expect(screen.getByTestId('settings-section-DEFAULTS')).toBeTruthy()
    })

    it('renders display section', () => {
      render(<SettingsScreen />)

      expect(screen.getByTestId('settings-section-DISPLAY')).toBeTruthy()
    })

    it('renders about section', () => {
      render(<SettingsScreen />)

      expect(screen.getByTestId('settings-section-ABOUT')).toBeTruthy()
    })
  })

  describe('audio section', () => {
    it('shows tone style setting', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Tone Style')).toBeTruthy()
    })

    it('shows current tone style as beep', () => {
      useSettingsStore.setState({ toneStyle: 'beep' })
      render(<SettingsScreen />)

      expect(screen.getByTestId('segment-beep').props.accessibilityState?.selected).toBe(true)
    })

    it('shows current tone style as voice', () => {
      useSettingsStore.setState({ toneStyle: 'voice' })
      render(<SettingsScreen />)

      expect(screen.getByTestId('segment-voice').props.accessibilityState?.selected).toBe(true)
    })

    it('changes tone style when segment pressed', () => {
      useSettingsStore.setState({ toneStyle: 'beep' })
      render(<SettingsScreen />)

      const voiceButton = screen.getByTestId('segment-voice')
      fireEvent.press(voiceButton)

      expect(useSettingsStore.getState().toneStyle).toBe('voice')
    })

    it('shows volume slider', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Volume')).toBeTruthy()
      expect(screen.getByTestId('settings-slider')).toBeTruthy()
    })

    it('displays volume percentage', () => {
      useSettingsStore.setState({ volume: 0.75 })
      render(<SettingsScreen />)

      expect(screen.getByText('75%')).toBeTruthy()
    })

    it('updates volume when slider changes', () => {
      render(<SettingsScreen />)

      const slider = screen.getByTestId('settings-slider')
      fireEvent(slider, 'valueChange', 0.5)

      expect(useSettingsStore.getState().volume).toBe(0.5)
    })
  })

  describe('defaults section', () => {
    it('shows long game default setting', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Long Game Default')).toBeTruthy()
    })

    it('displays current long game preset', () => {
      useSettingsStore.setState({ defaultLongGamePresetId: '24/8' })
      render(<SettingsScreen />)

      const preset = LONG_GAME_PRESETS.find((p) => p.id === '24/8')!
      const timeString = formatTime(getTotalTime(preset))
      expect(screen.getByText(`24/8 (${timeString})`)).toBeTruthy()
    })

    it('shows short game default setting', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Short Game Default')).toBeTruthy()
    })

    it('displays current short game preset', () => {
      useSettingsStore.setState({ defaultShortGamePresetId: '18/9' })
      render(<SettingsScreen />)

      const preset = SHORT_GAME_PRESETS.find((p) => p.id === '18/9')!
      const timeString = formatTime(getTotalTime(preset))
      expect(screen.getByText(`18/9 (${timeString})`)).toBeTruthy()
    })

    it('shows delay between reps setting', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Delay Between Reps')).toBeTruthy()
    })

    it('displays current delay value', () => {
      useSettingsStore.setState({ delayBetweenReps: 4 })
      render(<SettingsScreen />)

      expect(screen.getByText('4 seconds')).toBeTruthy()
    })

    it('opens long game preset picker when tapped', () => {
      render(<SettingsScreen />)

      // Find the settings-row-pressable for Long Game Default by its accessibility label
      const pressableRows = screen.getAllByTestId('settings-row-pressable')
      // First pressable is Long Game Default
      fireEvent.press(pressableRows[0])

      expect(screen.getByTestId('preset-picker')).toBeTruthy()
    })

    it('opens short game preset picker when tapped', () => {
      render(<SettingsScreen />)

      const pressableRows = screen.getAllByTestId('settings-row-pressable')
      // Second pressable is Short Game Default
      fireEvent.press(pressableRows[1])

      expect(screen.getByTestId('preset-picker')).toBeTruthy()
    })

    it('updates long game default when preset selected', async () => {
      render(<SettingsScreen />)

      // Open picker
      const pressableRows = screen.getAllByTestId('settings-row-pressable')
      fireEvent.press(pressableRows[0])

      // Select different preset
      const presetItem = screen.getByTestId('preset-item-21/7')
      fireEvent.press(presetItem)

      expect(useSettingsStore.getState().defaultLongGamePresetId).toBe('21/7')
    })

    it('updates short game default when preset selected', async () => {
      render(<SettingsScreen />)

      // Open picker
      const pressableRows = screen.getAllByTestId('settings-row-pressable')
      fireEvent.press(pressableRows[1])

      // Select different preset
      const presetItem = screen.getByTestId('preset-item-16/8')
      fireEvent.press(presetItem)

      expect(useSettingsStore.getState().defaultShortGamePresetId).toBe('16/8')
    })
  })

  describe('display section', () => {
    it('shows keep screen awake setting', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Keep Screen Awake')).toBeTruthy()
    })

    it('shows toggle for keep screen awake', () => {
      render(<SettingsScreen />)

      expect(screen.getByTestId('settings-toggle')).toBeTruthy()
    })

    it('toggle is on when keepScreenAwake is true', () => {
      useSettingsStore.setState({ keepScreenAwake: true })
      render(<SettingsScreen />)

      const toggle = screen.getByTestId('settings-toggle')
      expect(toggle.props.value).toBe(true)
    })

    it('toggle is off when keepScreenAwake is false', () => {
      useSettingsStore.setState({ keepScreenAwake: false })
      render(<SettingsScreen />)

      const toggle = screen.getByTestId('settings-toggle')
      expect(toggle.props.value).toBe(false)
    })

    it('updates keepScreenAwake when toggle pressed', () => {
      useSettingsStore.setState({ keepScreenAwake: true })
      render(<SettingsScreen />)

      const toggle = screen.getByTestId('settings-toggle')
      fireEvent(toggle, 'valueChange', false)

      expect(useSettingsStore.getState().keepScreenAwake).toBe(false)
    })
  })

  describe('about section', () => {
    it('shows version info', () => {
      render(<SettingsScreen />)

      expect(screen.getByText(/Version/)).toBeTruthy()
    })

    it('shows app name', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('ProTempo - Tempo Trainer')).toBeTruthy()
    })

    it('shows reset to defaults button', () => {
      render(<SettingsScreen />)

      expect(screen.getByText('Reset to Defaults')).toBeTruthy()
    })
  })

  describe('reset to defaults', () => {
    it('shows confirmation dialog when reset pressed', () => {
      render(<SettingsScreen />)

      const resetButton = screen.getByText('Reset to Defaults')
      fireEvent.press(resetButton)

      expect(Alert.alert).toHaveBeenCalledWith(
        'Reset to Defaults',
        'Are you sure you want to reset all settings to their default values?',
        expect.any(Array)
      )
    })

    it('does not reset when cancel pressed', () => {
      useSettingsStore.setState({ toneStyle: 'voice', volume: 0.5 })
      render(<SettingsScreen />)

      const resetButton = screen.getByText('Reset to Defaults')
      fireEvent.press(resetButton)

      // Get the cancel button callback and call it
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0]
      const buttons = alertCall[2]
      const cancelButton = buttons.find((b: { text: string }) => b.text === 'Cancel')
      cancelButton.onPress?.()

      // Settings should remain unchanged (cancel is a no-op)
      expect(useSettingsStore.getState().toneStyle).toBe('voice')
      expect(useSettingsStore.getState().volume).toBe(0.5)
    })

    it('resets all settings when confirmed', () => {
      useSettingsStore.setState({
        toneStyle: 'voice',
        volume: 0.5,
        keepScreenAwake: false,
        defaultLongGamePresetId: '18/6',
        defaultShortGamePresetId: '14/7',
        delayBetweenReps: 6,
      })
      render(<SettingsScreen />)

      const resetButton = screen.getByText('Reset to Defaults')
      fireEvent.press(resetButton)

      // Get the reset button callback and call it
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0]
      const buttons = alertCall[2]
      const confirmButton = buttons.find((b: { text: string }) => b.text === 'Reset')
      confirmButton.onPress()

      const state = useSettingsStore.getState()
      expect(state.toneStyle).toBe('beep')
      expect(state.volume).toBe(1.0)
      expect(state.keepScreenAwake).toBe(true)
      expect(state.defaultLongGamePresetId).toBe('24/8')
      expect(state.defaultShortGamePresetId).toBe('18/9')
      expect(state.delayBetweenReps).toBe(4)
    })
  })

  describe('tone preview', () => {
    it('changes tone style when segment pressed', () => {
      useSettingsStore.setState({ toneStyle: 'beep' })
      render(<SettingsScreen />)

      const voiceButton = screen.getByTestId('segment-voice')
      fireEvent.press(voiceButton)

      // Verify tone style was updated
      expect(useSettingsStore.getState().toneStyle).toBe('voice')
    })
  })

  describe('scrolling', () => {
    it('renders in a ScrollView for long content', () => {
      render(<SettingsScreen />)

      expect(screen.getByTestId('settings-scroll-view')).toBeTruthy()
    })
  })
})
