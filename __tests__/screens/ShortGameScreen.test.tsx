// ABOUTME: Integration tests for Short Game screen using shared TempoScreen component.
// ABOUTME: Verifies Short Game renders with 2:1 ratio presets and correct default settings.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import ShortGameScreen from '../../app/(tabs)/short-game'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSessionStore } from '../../stores/sessionStore'
import { SHORT_GAME_PRESETS } from '../../constants/tempos'

// Reset stores before each test
beforeEach(() => {
  useSettingsStore.setState({
    defaultLongGamePresetId: '24/8',
    defaultShortGamePresetId: '18/9',
    toneStyle: 'beep',
    keepScreenAwake: true,
    volume: 1,
    delayBetweenReps: 4,
    hasCompletedOnboarding: false,
    _hasHydrated: true,
  })
  useSessionStore.setState({
    gameMode: 'shortGame',
    currentPresetId: '18/9',
    isPlaying: false,
    isPaused: false,
    repCount: 0,
    playbackMode: 'continuous',
  })
  jest.clearAllMocks()
})

describe('ShortGameScreen', () => {
  describe('rendering', () => {
    it('renders the screen title', () => {
      render(<ShortGameScreen />)

      expect(screen.getByText('Short Game')).toBeTruthy()
    })

    it('renders the subtitle with 2:1 ratio description', () => {
      render(<ShortGameScreen />)

      expect(screen.getByText('2:1 Tempo Training')).toBeTruthy()
    })

    it('renders the RepCounter component', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('rep-counter')).toBeTruthy()
    })

    it('renders the TempoSelector component', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
    })

    it('renders the PlaybackControls component', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('playback-controls')).toBeTruthy()
    })

    it('renders the SessionControls component', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })

    it('renders all Short Game tempo presets', () => {
      render(<ShortGameScreen />)

      SHORT_GAME_PRESETS.forEach((preset) => {
        expect(screen.getByTestId(`tempo-pill-${preset.id}`)).toBeTruthy()
      })
    })
  })

  describe('initial state', () => {
    it('shows correct default preset from settings store', () => {
      useSettingsStore.setState({ defaultShortGamePresetId: '20/10' })
      render(<ShortGameScreen />)

      const pill = screen.getByTestId('tempo-pill-20/10')
      expect(pill.props.accessibilityState?.selected).toBe(true)
    })

    it('shows rep count of 0 initially', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('rep-counter-count').props.children).toBe(0)
    })

    it('shows delay from settings store', () => {
      useSettingsStore.setState({ delayBetweenReps: 5 })
      render(<ShortGameScreen />)

      expect(screen.getByText('5s')).toBeTruthy()
    })

    it('shows playback mode from session store', () => {
      useSessionStore.setState({ playbackMode: 'single' })
      render(<ShortGameScreen />)

      const singleButton = screen.getByTestId('mode-single')
      expect(singleButton.props.accessibilityState?.selected).toBe(true)
    })

    it('shows play button when not playing', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('playback-play-button')).toBeTruthy()
    })
  })

  describe('tempo selection', () => {
    it('updates selected preset when tempo pill is pressed', () => {
      render(<ShortGameScreen />)

      const newPill = screen.getByTestId('tempo-pill-16/8')
      fireEvent.press(newPill)

      expect(newPill.props.accessibilityState?.selected).toBe(true)
    })

    it('updates session store when preset changes', () => {
      render(<ShortGameScreen />)

      const newPill = screen.getByTestId('tempo-pill-14/7')
      fireEvent.press(newPill)

      expect(useSessionStore.getState().currentPresetId).toBe('14/7')
    })
  })

  describe('game mode', () => {
    it('sets game mode to shortGame in session store', () => {
      useSessionStore.setState({ gameMode: 'longGame' })
      render(<ShortGameScreen />)

      expect(useSessionStore.getState().gameMode).toBe('shortGame')
    })
  })

  describe('playback controls interaction', () => {
    it('shows pause button when playing', () => {
      useSessionStore.setState({ isPlaying: true })
      render(<ShortGameScreen />)

      expect(screen.getByTestId('playback-pause-button')).toBeTruthy()
    })

    it('shows play button with paused style when paused', () => {
      useSessionStore.setState({ isPlaying: false, isPaused: true })
      render(<ShortGameScreen />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityState?.selected).toBe(true)
    })
  })

  describe('session controls interaction', () => {
    it('updates delay in settings store when slider changes', () => {
      render(<ShortGameScreen />)

      const slider = screen.getByTestId('delay-slider')
      fireEvent(slider, 'onValueChange', 8)

      expect(useSettingsStore.getState().delayBetweenReps).toBe(8)
    })

    it('updates playback mode in session store when toggled', () => {
      render(<ShortGameScreen />)

      const singleButton = screen.getByTestId('mode-single')
      fireEvent.press(singleButton)

      expect(useSessionStore.getState().playbackMode).toBe('single')
    })

    it('toggles back to continuous mode', () => {
      useSessionStore.setState({ playbackMode: 'single' })
      render(<ShortGameScreen />)

      const continuousButton = screen.getByTestId('mode-continuous')
      fireEvent.press(continuousButton)

      expect(useSessionStore.getState().playbackMode).toBe('continuous')
    })
  })

  describe('rep counter display', () => {
    it('displays rep count from session store', () => {
      useSessionStore.setState({ repCount: 8 })
      render(<ShortGameScreen />)

      expect(screen.getByTestId('rep-counter-count').props.children).toBe(8)
    })

    it('shows active state when playing', () => {
      useSessionStore.setState({ isPlaying: true })
      render(<ShortGameScreen />)

      const repCounter = screen.getByTestId('rep-counter')
      expect(repCounter.props.accessibilityState?.busy).toBe(true)
    })

    it('shows inactive state when not playing', () => {
      useSessionStore.setState({ isPlaying: false })
      render(<ShortGameScreen />)

      const repCounter = screen.getByTestId('rep-counter')
      expect(repCounter.props.accessibilityState?.busy).toBe(false)
    })
  })

  describe('component disabling during playback', () => {
    it('disables tempo selector while playing', () => {
      useSessionStore.setState({ isPlaying: true })
      render(<ShortGameScreen />)

      const pill = screen.getByTestId('tempo-pill-18/9')
      expect(pill.props.accessibilityState?.disabled).toBe(true)
    })

    it('enables tempo selector when not playing', () => {
      useSessionStore.setState({ isPlaying: false })
      render(<ShortGameScreen />)

      const pill = screen.getByTestId('tempo-pill-18/9')
      expect(pill.props.accessibilityState?.disabled).toBe(false)
    })
  })

  describe('store integration', () => {
    it('reads initial settings from settingsStore', () => {
      useSettingsStore.setState({
        defaultShortGamePresetId: '22/11',
        delayBetweenReps: 6,
        toneStyle: 'voice',
        volume: 0.7,
      })

      render(<ShortGameScreen />)

      const pill = screen.getByTestId('tempo-pill-22/11')
      expect(pill.props.accessibilityState?.selected).toBe(true)
      expect(screen.getByText('6s')).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('has accessible screen structure', () => {
      render(<ShortGameScreen />)

      expect(screen.getByTestId('rep-counter')).toBeTruthy()
      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
      expect(screen.getByTestId('playback-controls')).toBeTruthy()
      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })
  })
})
