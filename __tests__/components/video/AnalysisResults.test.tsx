// ABOUTME: Tests for AnalysisResults component that displays detected tempo.
// ABOUTME: Tests frame display, ratio calculation, and tempo comparison.

import React from 'react'
import { render, screen } from '@testing-library/react-native'

import AnalysisResults from '../../../components/video/AnalysisResults'
import { SwingAnalysis } from '../../../types/video'
import { TempoPreset } from '../../../types/tempo'

describe('AnalysisResults', () => {
  const mockAnalysis: SwingAnalysis = {
    takeawayFrame: 15,
    topFrame: 45,
    impactFrame: 60,
    backswingFrames: 30,
    downswingFrames: 15,
    ratio: 2.0,
    confidence: 0.85,
    manuallyAdjusted: false,
  }

  const mockTargetPreset: TempoPreset = {
    id: '24/8',
    label: '24/8',
    backswingFrames: 24,
    downswingFrames: 8,
    description: 'Tour average',
  }

  const defaultProps = {
    analysis: mockAnalysis,
    fps: 30,
    targetPreset: mockTargetPreset,
  }

  describe('rendering', () => {
    it('should render the analysis results container', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByTestId('analysis-results')).toBeTruthy()
    })

    it('should display takeaway frame', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/takeaway/i)).toBeTruthy()
      expect(screen.getByText('Frame 15')).toBeTruthy()
    })

    it('should display top frame', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/top/i)).toBeTruthy()
      expect(screen.getByText('Frame 45')).toBeTruthy()
    })

    it('should display impact frame', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/impact/i)).toBeTruthy()
      expect(screen.getByText('Frame 60')).toBeTruthy()
    })
  })

  describe('timing display', () => {
    it('should display backswing frame count', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/backswing/i)).toBeTruthy()
      expect(screen.getByText(/30 frames/i)).toBeTruthy()
    })

    it('should display backswing time in seconds', () => {
      render(<AnalysisResults {...defaultProps} />)

      // 30 frames at 30fps = 1.00s
      expect(screen.getByText(/1\.00s/)).toBeTruthy()
    })

    it('should display downswing frame count', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/downswing/i)).toBeTruthy()
      expect(screen.getByText(/15 frames/i)).toBeTruthy()
    })

    it('should display downswing time in seconds', () => {
      render(<AnalysisResults {...defaultProps} />)

      // 15 frames at 30fps = 0.50s
      expect(screen.getByText(/0\.50s/)).toBeTruthy()
    })
  })

  describe('ratio display', () => {
    it('should display the detected ratio', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/tempo ratio/i)).toBeTruthy()
      expect(screen.getByText('2.0:1')).toBeTruthy()
    })

    it('should format ratio with one decimal place', () => {
      const analysisWithDecimalRatio: SwingAnalysis = {
        ...mockAnalysis,
        ratio: 2.75,
      }

      render(<AnalysisResults {...defaultProps} analysis={analysisWithDecimalRatio} />)

      expect(screen.getByText('2.8:1')).toBeTruthy()
    })
  })

  describe('confidence display', () => {
    it('should display confidence percentage', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/confidence/i)).toBeTruthy()
      expect(screen.getByText('85%')).toBeTruthy()
    })

    it('should show manually adjusted indicator when applicable', () => {
      const adjustedAnalysis: SwingAnalysis = {
        ...mockAnalysis,
        manuallyAdjusted: true,
      }

      render(<AnalysisResults {...defaultProps} analysis={adjustedAnalysis} />)

      expect(screen.getByText(/manually adjusted/i)).toBeTruthy()
    })

    it('should not show manually adjusted indicator when not applicable', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.queryByText(/manually adjusted/i)).toBeNull()
    })
  })

  describe('target comparison', () => {
    it('should display target preset label', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByText(/target/i)).toBeTruthy()
      expect(screen.getByText('24/8')).toBeTruthy()
    })

    it('should display target ratio', () => {
      render(<AnalysisResults {...defaultProps} />)

      // 24/8 = 3:1 ratio
      expect(screen.getByText('3:1')).toBeTruthy()
    })
  })

  describe('different fps values', () => {
    it('should calculate timing correctly for 60fps', () => {
      render(<AnalysisResults {...defaultProps} fps={60} />)

      // 30 frames at 60fps = 0.50s
      // 15 frames at 60fps = 0.25s
      expect(screen.getByText(/0\.50s/)).toBeTruthy()
      expect(screen.getByText(/0\.25s/)).toBeTruthy()
    })

    it('should calculate timing correctly for 120fps', () => {
      render(<AnalysisResults {...defaultProps} fps={120} />)

      // 30 frames at 120fps = 0.25s
      // 15 frames at 120fps = 0.125s (rounds to 0.13s)
      expect(screen.getByText(/0\.25s/)).toBeTruthy()
      expect(screen.getByText(/0\.13s/)).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('should have accessible labels for key metrics', () => {
      render(<AnalysisResults {...defaultProps} />)

      expect(screen.getByLabelText(/detected ratio/i)).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('should handle zero confidence', () => {
      const lowConfidenceAnalysis: SwingAnalysis = {
        ...mockAnalysis,
        confidence: 0,
      }

      render(<AnalysisResults {...defaultProps} analysis={lowConfidenceAnalysis} />)

      expect(screen.getByText('0%')).toBeTruthy()
    })

    it('should handle 100% confidence', () => {
      const highConfidenceAnalysis: SwingAnalysis = {
        ...mockAnalysis,
        confidence: 1.0,
      }

      render(<AnalysisResults {...defaultProps} analysis={highConfidenceAnalysis} />)

      expect(screen.getByText('100%')).toBeTruthy()
    })
  })
})
