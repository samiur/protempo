// ABOUTME: Tests for RepCounter component that displays the rep count.
// ABOUTME: Verifies rendering, active state, and edge cases.

import React from 'react'
import { render, screen } from '@testing-library/react-native'

import RepCounter from '../../components/RepCounter'

describe('RepCounter', () => {
  describe('rendering', () => {
    it('displays count correctly', () => {
      render(<RepCounter count={5} isActive={false} />)

      expect(screen.getByText('5')).toBeTruthy()
    })

    it('shows REPS label', () => {
      render(<RepCounter count={0} isActive={false} />)

      expect(screen.getByText('REPS')).toBeTruthy()
    })

    it('handles zero count', () => {
      render(<RepCounter count={0} isActive={false} />)

      expect(screen.getByText('0')).toBeTruthy()
    })

    it('handles large counts (100+)', () => {
      render(<RepCounter count={999} isActive={false} />)

      expect(screen.getByText('999')).toBeTruthy()
    })

    it('handles very large counts', () => {
      render(<RepCounter count={10000} isActive={false} />)

      expect(screen.getByText('10000')).toBeTruthy()
    })
  })

  describe('active state', () => {
    it('shows active styling when isActive is true', () => {
      render(<RepCounter count={5} isActive />)

      const counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityState?.busy).toBe(true)
    })

    it('shows inactive styling when isActive is false', () => {
      render(<RepCounter count={5} isActive={false} />)

      const counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityState?.busy).toBe(false)
    })

    it('changes styling when isActive prop changes', () => {
      const { rerender } = render(<RepCounter count={5} isActive={false} />)

      let counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityState?.busy).toBe(false)

      rerender(<RepCounter count={5} isActive />)

      counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityState?.busy).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has proper accessibility label', () => {
      render(<RepCounter count={12} isActive={false} />)

      const counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityLabel).toContain('12')
      expect(counter.props.accessibilityLabel).toContain('reps')
    })

    it('has text accessibility role', () => {
      render(<RepCounter count={0} isActive={false} />)

      const counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityRole).toBe('text')
    })

    it('announces active state for screen readers', () => {
      render(<RepCounter count={5} isActive />)

      const counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityLabel).toContain('playing')
    })

    it('does not announce active when inactive', () => {
      render(<RepCounter count={5} isActive={false} />)

      const counter = screen.getByTestId('rep-counter')
      expect(counter.props.accessibilityLabel).not.toContain('playing')
    })
  })

  describe('glanceability', () => {
    it('renders count in a large, prominent style', () => {
      render(<RepCounter count={7} isActive={false} />)

      // The count text should exist and be the main visual element
      const countText = screen.getByTestId('rep-counter-count')
      expect(countText).toBeTruthy()
    })

    it('renders REPS label below the count', () => {
      render(<RepCounter count={7} isActive={false} />)

      const label = screen.getByTestId('rep-counter-label')
      expect(label).toBeTruthy()
    })
  })
})
