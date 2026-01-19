// ABOUTME: Tests for TempoScreen shared component that provides common UI for tempo screens.
// ABOUTME: Verifies rendering, props handling, and playback service integration.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import TempoScreen from '../../components/TempoScreen'
import { useSettingsStore } from '../../stores/settingsStore'
import { useSessionStore } from '../../stores/sessionStore'
import { LONG_GAME_PRESETS, SHORT_GAME_PRESETS } from '../../constants/tempos'

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

describe('TempoScreen', () => {
  describe('rendering with Long Game presets', () => {
    it('renders the provided title', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByText('Long Game')).toBeTruthy()
    })

    it('renders the provided subtitle', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByText('3:1 Tempo Training')).toBeTruthy()
    })

    it('renders all provided presets', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      LONG_GAME_PRESETS.forEach((preset) => {
        expect(screen.getByTestId(`tempo-pill-${preset.id}`)).toBeTruthy()
      })
    })

    it('renders all main components', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByTestId('rep-counter')).toBeTruthy()
      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
      expect(screen.getByTestId('playback-controls')).toBeTruthy()
      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })
  })

  describe('rendering with Short Game presets', () => {
    it('renders the provided title for Short Game', () => {
      render(
        <TempoScreen
          title="Short Game"
          subtitle="2:1 Tempo Training"
          presets={SHORT_GAME_PRESETS}
          defaultPresetId="18/9"
          gameMode="shortGame"
        />
      )

      expect(screen.getByText('Short Game')).toBeTruthy()
    })

    it('renders the provided subtitle for Short Game', () => {
      render(
        <TempoScreen
          title="Short Game"
          subtitle="2:1 Tempo Training"
          presets={SHORT_GAME_PRESETS}
          defaultPresetId="18/9"
          gameMode="shortGame"
        />
      )

      expect(screen.getByText('2:1 Tempo Training')).toBeTruthy()
    })

    it('renders all Short Game presets', () => {
      render(
        <TempoScreen
          title="Short Game"
          subtitle="2:1 Tempo Training"
          presets={SHORT_GAME_PRESETS}
          defaultPresetId="18/9"
          gameMode="shortGame"
        />
      )

      SHORT_GAME_PRESETS.forEach((preset) => {
        expect(screen.getByTestId(`tempo-pill-${preset.id}`)).toBeTruthy()
      })
    })
  })

  describe('preset selection', () => {
    it('uses the provided default preset', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="27/9"
          gameMode="longGame"
        />
      )

      const pill = screen.getByTestId('tempo-pill-27/9')
      expect(pill.props.accessibilityState?.selected).toBe(true)
    })

    it('updates selected preset when pill is pressed', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const newPill = screen.getByTestId('tempo-pill-21/7')
      fireEvent.press(newPill)

      expect(newPill.props.accessibilityState?.selected).toBe(true)
    })

    it('updates session store with new preset', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const newPill = screen.getByTestId('tempo-pill-18/6')
      fireEvent.press(newPill)

      expect(useSessionStore.getState().currentPresetId).toBe('18/6')
    })
  })

  describe('game mode handling', () => {
    it('sets game mode in session store on mount', () => {
      render(
        <TempoScreen
          title="Short Game"
          subtitle="2:1 Tempo Training"
          presets={SHORT_GAME_PRESETS}
          defaultPresetId="18/9"
          gameMode="shortGame"
        />
      )

      expect(useSessionStore.getState().gameMode).toBe('shortGame')
    })

    it('resets rep count when game mode changes', () => {
      // Start with some rep count
      useSessionStore.setState({ repCount: 5, gameMode: 'longGame' })

      render(
        <TempoScreen
          title="Short Game"
          subtitle="2:1 Tempo Training"
          presets={SHORT_GAME_PRESETS}
          defaultPresetId="18/9"
          gameMode="shortGame"
        />
      )

      // Rep count should reset when switching game modes
      expect(useSessionStore.getState().repCount).toBe(0)
    })
  })

  describe('session controls', () => {
    it('uses delay from settings store', () => {
      useSettingsStore.setState({ delayBetweenReps: 7 })

      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByText('7s')).toBeTruthy()
    })

    it('updates delay in settings store when slider changes', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const slider = screen.getByTestId('delay-slider')
      fireEvent(slider, 'onValueChange', 9)

      expect(useSettingsStore.getState().delayBetweenReps).toBe(9)
    })

    it('uses playback mode from session store', () => {
      useSessionStore.setState({ playbackMode: 'single' })

      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const singleButton = screen.getByTestId('mode-single')
      expect(singleButton.props.accessibilityState?.selected).toBe(true)
    })

    it('updates playback mode in session store when toggled', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const singleButton = screen.getByTestId('mode-single')
      fireEvent.press(singleButton)

      expect(useSessionStore.getState().playbackMode).toBe('single')
    })
  })

  describe('rep counter', () => {
    it('displays rep count from session store', () => {
      useSessionStore.setState({ repCount: 15 })

      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByTestId('rep-counter-count').props.children).toBe(15)
    })

    it('shows active state when playing', () => {
      useSessionStore.setState({ isPlaying: true })

      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const repCounter = screen.getByTestId('rep-counter')
      expect(repCounter.props.accessibilityState?.busy).toBe(true)
    })
  })

  describe('playback controls', () => {
    it('shows play button when not playing', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByTestId('playback-play-button')).toBeTruthy()
    })

    it('shows pause button when playing', () => {
      useSessionStore.setState({ isPlaying: true })

      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByTestId('playback-pause-button')).toBeTruthy()
    })

    it('disables tempo selector while playing', () => {
      useSessionStore.setState({ isPlaying: true })

      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      const pill = screen.getByTestId('tempo-pill-24/8')
      expect(pill.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has accessible screen structure', () => {
      render(
        <TempoScreen
          title="Long Game"
          subtitle="3:1 Tempo Training"
          presets={LONG_GAME_PRESETS}
          defaultPresetId="24/8"
          gameMode="longGame"
        />
      )

      expect(screen.getByTestId('rep-counter')).toBeTruthy()
      expect(screen.getByTestId('tempo-selector-scroll')).toBeTruthy()
      expect(screen.getByTestId('playback-controls')).toBeTruthy()
      expect(screen.getByTestId('session-controls')).toBeTruthy()
    })
  })
})
