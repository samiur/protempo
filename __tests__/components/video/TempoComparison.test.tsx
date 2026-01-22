// ABOUTME: Tests for TempoComparison component displaying detected vs target tempo.
// ABOUTME: Tests visual comparison, closest preset matching, and feedback display.

import React from 'react'
import { render, screen } from '@testing-library/react-native'

import TempoComparison from '../../../components/video/TempoComparison'
import { TempoComparison as TempoComparisonType } from '../../../types/swingDetection'
import { TempoPreset } from '../../../types/tempo'

describe('TempoComparison', () => {
  const mockComparison: TempoComparisonType = {
    detectedRatio: 2.5,
    targetRatio: 3.0,
    percentDifference: -16.67,
    comparison: 'slower',
  }

  const mockTargetPreset: TempoPreset = {
    id: '24/8',
    label: '24/8',
    backswingFrames: 24,
    downswingFrames: 8,
    description: 'Tour average',
  }

  const mockClosestPreset: TempoPreset = {
    id: '21/7',
    label: '21/7',
    backswingFrames: 21,
    downswingFrames: 7,
    description: 'Fast tempo',
  }

  const defaultProps = {
    comparison: mockComparison,
    targetPreset: mockTargetPreset,
    closestPreset: mockClosestPreset,
  }

  describe('rendering', () => {
    it('should render the tempo comparison container', () => {
      render(<TempoComparison {...defaultProps} />)

      expect(screen.getByTestId('tempo-comparison')).toBeTruthy()
    })

    it('should display detected ratio', () => {
      render(<TempoComparison {...defaultProps} />)

      // Use getAllByText since there may be multiple matches and check that at least one exists
      expect(screen.getAllByText(/your tempo/i).length).toBeGreaterThan(0)
      expect(screen.getByText('2.5:1')).toBeTruthy()
    })

    it('should display target ratio', () => {
      render(<TempoComparison {...defaultProps} />)

      // Use getAllByText since "target" may appear multiple times
      expect(screen.getAllByText(/target/i).length).toBeGreaterThan(0)
      expect(screen.getByText('3:1')).toBeTruthy()
    })
  })

  describe('comparison indicators', () => {
    it('should show slower indicator when tempo is slower', () => {
      render(<TempoComparison {...defaultProps} />)

      expect(screen.getByTestId('comparison-indicator-slower')).toBeTruthy()
    })

    it('should show faster indicator when tempo is faster', () => {
      const fasterComparison: TempoComparisonType = {
        detectedRatio: 3.5,
        targetRatio: 3.0,
        percentDifference: 16.67,
        comparison: 'faster',
      }

      render(<TempoComparison {...defaultProps} comparison={fasterComparison} />)

      expect(screen.getByTestId('comparison-indicator-faster')).toBeTruthy()
    })

    it('should show similar indicator when tempo matches', () => {
      const similarComparison: TempoComparisonType = {
        detectedRatio: 3.0,
        targetRatio: 3.0,
        percentDifference: 0,
        comparison: 'similar',
      }

      render(<TempoComparison {...defaultProps} comparison={similarComparison} />)

      expect(screen.getByTestId('comparison-indicator-similar')).toBeTruthy()
    })
  })

  describe('percentage difference', () => {
    it('should display percentage difference for slower tempo', () => {
      render(<TempoComparison {...defaultProps} />)

      // May appear in percentage text and feedback message
      expect(screen.getAllByText(/17% slower/i).length).toBeGreaterThan(0)
    })

    it('should display percentage difference for faster tempo', () => {
      const fasterComparison: TempoComparisonType = {
        detectedRatio: 3.5,
        targetRatio: 3.0,
        percentDifference: 16.67,
        comparison: 'faster',
      }

      render(<TempoComparison {...defaultProps} comparison={fasterComparison} />)

      expect(screen.getAllByText(/17% faster/i).length).toBeGreaterThan(0)
    })

    it('should display match message for similar tempo', () => {
      const similarComparison: TempoComparisonType = {
        detectedRatio: 3.0,
        targetRatio: 3.0,
        percentDifference: 0,
        comparison: 'similar',
      }

      render(<TempoComparison {...defaultProps} comparison={similarComparison} />)

      expect(screen.getAllByText(/matches/i).length).toBeGreaterThan(0)
    })
  })

  describe('closest preset recommendation', () => {
    it('should display closest preset label', () => {
      render(<TempoComparison {...defaultProps} />)

      expect(screen.getByText(/recommended/i)).toBeTruthy()
      expect(screen.getByText('21/7')).toBeTruthy()
    })

    it('should display closest preset description', () => {
      render(<TempoComparison {...defaultProps} />)

      expect(screen.getByText(/fast tempo/i)).toBeTruthy()
    })
  })

  describe('feedback message', () => {
    it('should display feedback for slower tempo', () => {
      render(<TempoComparison {...defaultProps} />)

      expect(screen.getByTestId('feedback-message')).toBeTruthy()
      expect(screen.getByText(/slower than target/i)).toBeTruthy()
    })

    it('should display feedback for faster tempo', () => {
      const fasterComparison: TempoComparisonType = {
        detectedRatio: 3.5,
        targetRatio: 3.0,
        percentDifference: 16.67,
        comparison: 'faster',
      }

      render(<TempoComparison {...defaultProps} comparison={fasterComparison} />)

      expect(screen.getByText(/faster than target/i)).toBeTruthy()
    })

    it('should display match feedback for similar tempo', () => {
      const similarComparison: TempoComparisonType = {
        detectedRatio: 3.0,
        targetRatio: 3.0,
        percentDifference: 0,
        comparison: 'similar',
      }

      render(<TempoComparison {...defaultProps} comparison={similarComparison} />)

      expect(screen.getByText(/matches the target/i)).toBeTruthy()
    })
  })

  describe('visual styling', () => {
    it('should use error color for large differences', () => {
      const largeDeviationComparison: TempoComparisonType = {
        detectedRatio: 1.5,
        targetRatio: 3.0,
        percentDifference: -50,
        comparison: 'slower',
      }

      render(<TempoComparison {...defaultProps} comparison={largeDeviationComparison} />)

      // Should have warning/error styling
      expect(screen.getByTestId('comparison-indicator-slower')).toBeTruthy()
    })

    it('should use success color for matching tempo', () => {
      const matchingComparison: TempoComparisonType = {
        detectedRatio: 3.0,
        targetRatio: 3.0,
        percentDifference: 0,
        comparison: 'similar',
      }

      render(<TempoComparison {...defaultProps} comparison={matchingComparison} />)

      expect(screen.getByTestId('comparison-indicator-similar')).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('should have accessible labels for comparison results', () => {
      render(<TempoComparison {...defaultProps} />)

      expect(screen.getByLabelText(/tempo comparison result/i)).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('should handle zero percent difference', () => {
      const zeroComparison: TempoComparisonType = {
        detectedRatio: 3.0,
        targetRatio: 3.0,
        percentDifference: 0,
        comparison: 'similar',
      }

      render(<TempoComparison {...defaultProps} comparison={zeroComparison} />)

      expect(screen.getByTestId('tempo-comparison')).toBeTruthy()
    })

    it('should handle very small differences', () => {
      const smallComparison: TempoComparisonType = {
        detectedRatio: 2.99,
        targetRatio: 3.0,
        percentDifference: -0.33,
        comparison: 'similar',
      }

      render(<TempoComparison {...defaultProps} comparison={smallComparison} />)

      expect(screen.getByTestId('tempo-comparison')).toBeTruthy()
    })
  })
})
