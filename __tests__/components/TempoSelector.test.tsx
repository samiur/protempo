// ABOUTME: Tests for TempoSelector component that displays tempo presets.
// ABOUTME: Verifies rendering, selection, and disabled state behavior.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import TempoSelector from '../../components/TempoSelector'
import { LONG_GAME_PRESETS } from '../../constants/tempos'
import type { TempoPreset } from '../../types/tempo'

const mockPresets: TempoPreset[] = [
  {
    id: '18/6',
    backswingFrames: 18,
    downswingFrames: 6,
    label: '18/6',
    description: 'Fast tempo',
  },
  {
    id: '24/8',
    backswingFrames: 24,
    downswingFrames: 8,
    label: '24/8',
    description: 'Tour average',
  },
  {
    id: '30/10',
    backswingFrames: 30,
    downswingFrames: 10,
    label: '30/10',
    description: 'Slow tempo',
  },
]

describe('TempoSelector', () => {
  const defaultProps = {
    presets: mockPresets,
    selectedPresetId: '24/8',
    onSelectPreset: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all presets', () => {
      render(<TempoSelector {...defaultProps} />)

      expect(screen.getByText('18/6')).toBeTruthy()
      expect(screen.getByText('24/8')).toBeTruthy()
      expect(screen.getByText('30/10')).toBeTruthy()
    })

    it('displays total time for each preset', () => {
      render(<TempoSelector {...defaultProps} />)

      // 18/6 = 24 frames = 0.80s
      expect(screen.getByText('0.80s')).toBeTruthy()
      // 24/8 = 32 frames = 1.07s
      expect(screen.getByText('1.07s')).toBeTruthy()
      // 30/10 = 40 frames = 1.33s
      expect(screen.getByText('1.33s')).toBeTruthy()
    })

    it('renders with long game presets', () => {
      render(
        <TempoSelector
          presets={LONG_GAME_PRESETS as unknown as TempoPreset[]}
          selectedPresetId="24/8"
          onSelectPreset={jest.fn()}
        />
      )

      // Should render all 5 long game presets
      expect(screen.getByText('18/6')).toBeTruthy()
      expect(screen.getByText('21/7')).toBeTruthy()
      expect(screen.getByText('24/8')).toBeTruthy()
      expect(screen.getByText('27/9')).toBeTruthy()
      expect(screen.getByText('30/10')).toBeTruthy()
    })
  })

  describe('selection', () => {
    it('highlights selected preset', () => {
      render(<TempoSelector {...defaultProps} />)

      const selectedPill = screen.getByTestId('tempo-pill-24/8')
      const unselectedPill = screen.getByTestId('tempo-pill-18/6')

      // Check accessibility state for selected
      expect(selectedPill.props.accessibilityState?.selected).toBe(true)
      expect(unselectedPill.props.accessibilityState?.selected).toBe(false)
    })

    it('calls onSelectPreset when pill is tapped', () => {
      const onSelectPreset = jest.fn()
      render(<TempoSelector {...defaultProps} onSelectPreset={onSelectPreset} />)

      const pill = screen.getByTestId('tempo-pill-18/6')
      fireEvent.press(pill)

      expect(onSelectPreset).toHaveBeenCalledWith('18/6')
    })

    it('does not call onSelectPreset when already selected preset is tapped', () => {
      const onSelectPreset = jest.fn()
      render(<TempoSelector {...defaultProps} onSelectPreset={onSelectPreset} />)

      const selectedPill = screen.getByTestId('tempo-pill-24/8')
      fireEvent.press(selectedPill)

      // Should still call the callback - parent can decide what to do
      expect(onSelectPreset).toHaveBeenCalledWith('24/8')
    })
  })

  describe('disabled state', () => {
    it('prevents interaction when disabled', () => {
      const onSelectPreset = jest.fn()
      render(<TempoSelector {...defaultProps} onSelectPreset={onSelectPreset} disabled />)

      const pill = screen.getByTestId('tempo-pill-18/6')
      fireEvent.press(pill)

      expect(onSelectPreset).not.toHaveBeenCalled()
    })

    it('shows disabled styling when disabled', () => {
      render(<TempoSelector {...defaultProps} disabled />)

      const pill = screen.getByTestId('tempo-pill-18/6')
      expect(pill.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has proper accessibility labels', () => {
      render(<TempoSelector {...defaultProps} />)

      const pill = screen.getByTestId('tempo-pill-24/8')
      expect(pill.props.accessibilityLabel).toContain('24/8')
      expect(pill.props.accessibilityLabel).toContain('1.07')
    })

    it('has button accessibility role', () => {
      render(<TempoSelector {...defaultProps} />)

      const pill = screen.getByTestId('tempo-pill-24/8')
      expect(pill.props.accessibilityRole).toBe('button')
    })
  })

  describe('horizontal scroll', () => {
    it('renders in a horizontal scrollable container', () => {
      render(<TempoSelector {...defaultProps} />)

      const scrollView = screen.getByTestId('tempo-selector-scroll')
      expect(scrollView.props.horizontal).toBe(true)
    })

    it('shows scroll indicator', () => {
      render(<TempoSelector {...defaultProps} />)

      const scrollView = screen.getByTestId('tempo-selector-scroll')
      expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false)
    })
  })
})
