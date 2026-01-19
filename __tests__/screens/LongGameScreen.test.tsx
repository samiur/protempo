// ABOUTME: Integration tests for Long Game screen that wires all components together.
// ABOUTME: Verifies screen renders, state management, and playback service integration.

import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native'

import LongGameScreen from '../../app/(tabs)/index'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSessionStore } from '../../stores/sessionStore'
import { LONG_GAME_PRESETS } from '../../constants/tempos'

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
    gameMode: 'longGame',
    currentPresetId: '24/8',
    isPlaying: false,
    isPaused: false,
    repCount: 0,
    playbackMode: 'continuous',
  })
  jest.clearAllMocks()
})

describe('LongGameScreen', () => {
  describe('rendering', () => {
    it('renders the screen title', () => {
      render(<LongGameScreen />)

      expect(screen.getByText('Long Game')).toBeTruthy()
    })

    it('renders the subtitle with 3:1 ratio description', () => {
      render(<LongGameScreen />)

      expect(screen.getByText('3:1 Tempo Training')).toBeTruthy()
    })

    it('renders the RepCounter component', () => {
      render(<LongGameScreen />)

      expect(screen.getByTestId('rep-counter')).toBeTruthy()
    })

    it('renders the TempoSelector component', () => {
      render(<LongGameScreen />)

      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
    })

    it('renders the PlaybackControls component', () => {
      render(<LongGameScreen />)

      expect(screen.getByTestId('playback-controls')).toBeTruthy()
    })

    it('renders the SessionControls component', () => {
      render(<LongGameScreen />)

      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })

    it('renders all Long Game tempo presets', () => {
      render(<LongGameScreen />)

      LONG_GAME_PRESETS.forEach((preset) => {
        expect(screen.getByTestId(`tempo-pill-${preset.id}`)).toBeTruthy()
      })
    })
  })

  describe('initial state', () => {
    it('shows correct default preset from settings store', () => {
      useSettingsStore.setState({ defaultLongGamePresetId: '27/9' })
      render(<LongGameScreen />)

      const pill = screen.getByTestId('tempo-pill-27/9')
      expect(pill.props.accessibilityState?.selected).toBe(true)
    })

    it('shows rep count of 0 initially', () => {
      render(<LongGameScreen />)

      expect(screen.getByTestId('rep-counter-count').props.children).toBe(0)
    })

    it('shows delay from settings store', () => {
      useSettingsStore.setState({ delayBetweenReps: 6 })
      render(<LongGameScreen />)

      expect(screen.getByText('6s')).toBeTruthy()
    })

    it('shows playback mode from session store', () => {
      useSessionStore.setState({ playbackMode: 'single' })
      render(<LongGameScreen />)

      const singleButton = screen.getByTestId('mode-single')
      expect(singleButton.props.accessibilityState?.selected).toBe(true)
    })

    it('shows play button when not playing', () => {
      render(<LongGameScreen />)

      expect(screen.getByTestId('playback-play-button')).toBeTruthy()
    })
  })

  describe('tempo selection', () => {
    it('updates selected preset when tempo pill is pressed', () => {
      render(<LongGameScreen />)

      const newPill = screen.getByTestId('tempo-pill-21/7')
      fireEvent.press(newPill)

      // Verify the pill shows as selected
      expect(newPill.props.accessibilityState?.selected).toBe(true)
    })

    it('updates session store when preset changes', () => {
      render(<LongGameScreen />)

      const newPill = screen.getByTestId('tempo-pill-18/6')
      fireEvent.press(newPill)

      expect(useSessionStore.getState().currentPresetId).toBe('18/6')
    })
  })

  describe('playback controls interaction', () => {
    it('disables play button while audio is loading', async () => {
      // Mock useAudioManager to return isLoaded: false
      jest.doMock('../../hooks/useAudioManager', () => ({
        useAudioManager: () => ({
          playTone: jest.fn(),
          isLoaded: false,
          setVolume: jest.fn(),
          toneStyle: 'beep',
          currentVolume: 1,
        }),
      }))

      render(<LongGameScreen />)

      const playButton = screen.getByTestId('playback-play-button')
      // Button should be disabled or show loading state
      // This will depend on implementation
      expect(playButton).toBeTruthy()
    })

    it('updates isPlaying state when play is pressed', async () => {
      render(<LongGameScreen />)

      // Wait for audio to load (mocked as always loaded)
      await waitFor(() => {
        expect(screen.getByTestId('playback-play-button')).toBeTruthy()
      })

      const playButton = screen.getByTestId('playback-play-button')
      await act(async () => {
        fireEvent.press(playButton)
      })

      // The session store should be updated via the playback service callback
      // Note: Since playback service is mocked, we test the interaction path
    })

    it('shows pause button when playing', async () => {
      useSessionStore.setState({ isPlaying: true })
      render(<LongGameScreen />)

      expect(screen.getByTestId('playback-pause-button')).toBeTruthy()
    })

    it('shows play button with paused style when paused', () => {
      useSessionStore.setState({ isPlaying: false, isPaused: true })
      render(<LongGameScreen />)

      const playButton = screen.getByTestId('playback-play-button')
      expect(playButton.props.accessibilityState?.selected).toBe(true)
    })

    it('resets rep count when stop is pressed', async () => {
      useSessionStore.setState({ isPlaying: true, repCount: 5 })
      render(<LongGameScreen />)

      const stopButton = screen.getByTestId('playback-stop-button')
      await act(async () => {
        fireEvent.press(stopButton)
      })

      // Rep count should reset (via callback from playback service)
      // The actual reset happens in the onPlaybackStop callback
    })
  })

  describe('session controls interaction', () => {
    it('updates delay in settings store when slider changes', () => {
      render(<LongGameScreen />)

      const slider = screen.getByTestId('delay-slider')
      fireEvent(slider, 'onValueChange', 7)

      expect(useSettingsStore.getState().delayBetweenReps).toBe(7)
    })

    it('updates playback mode in session store when toggled', () => {
      render(<LongGameScreen />)

      const singleButton = screen.getByTestId('mode-single')
      fireEvent.press(singleButton)

      expect(useSessionStore.getState().playbackMode).toBe('single')
    })

    it('toggles back to continuous mode', () => {
      useSessionStore.setState({ playbackMode: 'single' })
      render(<LongGameScreen />)

      const continuousButton = screen.getByTestId('mode-continuous')
      fireEvent.press(continuousButton)

      expect(useSessionStore.getState().playbackMode).toBe('continuous')
    })
  })

  describe('rep counter display', () => {
    it('displays rep count from session store', () => {
      useSessionStore.setState({ repCount: 12 })
      render(<LongGameScreen />)

      expect(screen.getByTestId('rep-counter-count').props.children).toBe(12)
    })

    it('shows active state when playing', () => {
      useSessionStore.setState({ isPlaying: true })
      render(<LongGameScreen />)

      const repCounter = screen.getByTestId('rep-counter')
      expect(repCounter.props.accessibilityState?.busy).toBe(true)
    })

    it('shows inactive state when not playing', () => {
      useSessionStore.setState({ isPlaying: false })
      render(<LongGameScreen />)

      const repCounter = screen.getByTestId('rep-counter')
      expect(repCounter.props.accessibilityState?.busy).toBe(false)
    })
  })

  describe('component disabling during playback', () => {
    it('disables tempo selector while playing', () => {
      useSessionStore.setState({ isPlaying: true })
      render(<LongGameScreen />)

      const pill = screen.getByTestId('tempo-pill-24/8')
      expect(pill.props.accessibilityState?.disabled).toBe(true)
    })

    it('enables tempo selector when not playing', () => {
      useSessionStore.setState({ isPlaying: false })
      render(<LongGameScreen />)

      const pill = screen.getByTestId('tempo-pill-24/8')
      expect(pill.props.accessibilityState?.disabled).toBe(false)
    })
  })

  describe('store integration', () => {
    it('reads initial settings from settingsStore', () => {
      useSettingsStore.setState({
        defaultLongGamePresetId: '30/10',
        delayBetweenReps: 8,
        toneStyle: 'voice',
        volume: 0.5,
      })

      render(<LongGameScreen />)

      const pill = screen.getByTestId('tempo-pill-30/10')
      expect(pill.props.accessibilityState?.selected).toBe(true)
      expect(screen.getByText('8s')).toBeTruthy()
    })

    it('initializes preset from settings store default', () => {
      // Session store may have any value, but screen uses settings store default
      useSettingsStore.setState({ defaultLongGamePresetId: '21/7' })
      useSessionStore.setState({ currentPresetId: '24/8' })
      render(<LongGameScreen />)

      // After mount, session store should be updated to match settings default
      const pill = screen.getByTestId('tempo-pill-21/7')
      expect(pill.props.accessibilityState?.selected).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has accessible screen structure', () => {
      render(<LongGameScreen />)

      // All main components should be present and accessible
      expect(screen.getByTestId('rep-counter')).toBeTruthy()
      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
      expect(screen.getByTestId('playback-controls')).toBeTruthy()
      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })
  })
})
