// ABOUTME: Tests for FrameAdjuster component for manual frame adjustment.
// ABOUTME: Tests frame selection, increment/decrement controls, and live ratio update.

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react-native'

import FrameAdjuster from '../../../components/video/FrameAdjuster'
import { SwingAnalysis } from '../../../types/video'

describe('FrameAdjuster', () => {
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

  const defaultProps = {
    analysis: mockAnalysis,
    totalFrames: 150,
    onAnalysisChange: jest.fn(),
    onAutoDetect: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the frame adjuster container', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByTestId('frame-adjuster')).toBeTruthy()
    })

    it('should render takeaway frame adjuster', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByTestId('adjuster-takeaway')).toBeTruthy()
      expect(screen.getByText(/takeaway/i)).toBeTruthy()
    })

    it('should render top frame adjuster', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByTestId('adjuster-top')).toBeTruthy()
      expect(screen.getByText(/top/i)).toBeTruthy()
    })

    it('should render impact frame adjuster', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByTestId('adjuster-impact')).toBeTruthy()
      expect(screen.getByText(/impact/i)).toBeTruthy()
    })

    it('should render auto detect button', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByTestId('auto-detect-button')).toBeTruthy()
      expect(screen.getByText(/auto detect/i)).toBeTruthy()
    })
  })

  describe('current frame values', () => {
    it('should display takeaway frame number', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByText('15')).toBeTruthy()
    })

    it('should display top frame number', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByText('45')).toBeTruthy()
    })

    it('should display impact frame number', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByText('60')).toBeTruthy()
    })
  })

  describe('live ratio update', () => {
    it('should display current ratio', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByTestId('live-ratio')).toBeTruthy()
      expect(screen.getByText('2.0:1')).toBeTruthy()
    })
  })

  describe('takeaway frame adjustment', () => {
    it('should increment takeaway frame', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const incrementButton = screen.getByTestId('takeaway-increment')
      fireEvent.press(incrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          takeawayFrame: 16,
          manuallyAdjusted: true,
        })
      )
    })

    it('should decrement takeaway frame', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const decrementButton = screen.getByTestId('takeaway-decrement')
      fireEvent.press(decrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          takeawayFrame: 14,
          manuallyAdjusted: true,
        })
      )
    })

    it('should not decrement takeaway below 0', () => {
      const analysisAtZero: SwingAnalysis = {
        ...mockAnalysis,
        takeawayFrame: 0,
      }

      render(<FrameAdjuster {...defaultProps} analysis={analysisAtZero} />)

      const decrementButton = screen.getByTestId('takeaway-decrement')
      expect(decrementButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should not increment takeaway past top frame', () => {
      const analysisNearTop: SwingAnalysis = {
        ...mockAnalysis,
        takeawayFrame: 44,
        topFrame: 45,
      }

      render(<FrameAdjuster {...defaultProps} analysis={analysisNearTop} />)

      const incrementButton = screen.getByTestId('takeaway-increment')
      expect(incrementButton.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('top frame adjustment', () => {
    it('should increment top frame', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const incrementButton = screen.getByTestId('top-increment')
      fireEvent.press(incrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          topFrame: 46,
          manuallyAdjusted: true,
        })
      )
    })

    it('should decrement top frame', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const decrementButton = screen.getByTestId('top-decrement')
      fireEvent.press(decrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          topFrame: 44,
          manuallyAdjusted: true,
        })
      )
    })

    it('should not decrement top below takeaway frame', () => {
      const analysisWithCloseFrames: SwingAnalysis = {
        ...mockAnalysis,
        takeawayFrame: 44,
        topFrame: 45,
      }

      render(<FrameAdjuster {...defaultProps} analysis={analysisWithCloseFrames} />)

      const decrementButton = screen.getByTestId('top-decrement')
      expect(decrementButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should not increment top past impact frame', () => {
      const analysisNearImpact: SwingAnalysis = {
        ...mockAnalysis,
        topFrame: 59,
        impactFrame: 60,
      }

      render(<FrameAdjuster {...defaultProps} analysis={analysisNearImpact} />)

      const incrementButton = screen.getByTestId('top-increment')
      expect(incrementButton.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('impact frame adjustment', () => {
    it('should increment impact frame', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const incrementButton = screen.getByTestId('impact-increment')
      fireEvent.press(incrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          impactFrame: 61,
          manuallyAdjusted: true,
        })
      )
    })

    it('should decrement impact frame', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const decrementButton = screen.getByTestId('impact-decrement')
      fireEvent.press(decrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          impactFrame: 59,
          manuallyAdjusted: true,
        })
      )
    })

    it('should not decrement impact below top frame', () => {
      const analysisWithCloseFrames: SwingAnalysis = {
        ...mockAnalysis,
        topFrame: 59,
        impactFrame: 60,
      }

      render(<FrameAdjuster {...defaultProps} analysis={analysisWithCloseFrames} />)

      const decrementButton = screen.getByTestId('impact-decrement')
      expect(decrementButton.props.accessibilityState?.disabled).toBe(true)
    })

    it('should not increment impact past total frames', () => {
      const analysisNearEnd: SwingAnalysis = {
        ...mockAnalysis,
        impactFrame: 149,
      }

      render(<FrameAdjuster {...defaultProps} analysis={analysisNearEnd} totalFrames={150} />)

      const incrementButton = screen.getByTestId('impact-increment')
      expect(incrementButton.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('auto detect', () => {
    it('should call onAutoDetect when auto detect button is pressed', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const autoDetectButton = screen.getByTestId('auto-detect-button')
      fireEvent.press(autoDetectButton)

      expect(defaultProps.onAutoDetect).toHaveBeenCalled()
    })

    it('should disable auto detect button when isDetecting is true', () => {
      render(<FrameAdjuster {...defaultProps} isDetecting={true} />)

      const autoDetectButton = screen.getByTestId('auto-detect-button')
      expect(autoDetectButton.props.accessibilityState?.disabled).toBe(true)
    })
  })

  describe('recalculation on frame change', () => {
    it('should recalculate backswingFrames when top changes', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const incrementButton = screen.getByTestId('top-increment')
      fireEvent.press(incrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          backswingFrames: 31, // 46 - 15
        })
      )
    })

    it('should recalculate downswingFrames when impact changes', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const incrementButton = screen.getByTestId('impact-increment')
      fireEvent.press(incrementButton)

      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          downswingFrames: 16, // 61 - 45
        })
      )
    })

    it('should recalculate ratio when frames change', () => {
      render(<FrameAdjuster {...defaultProps} />)

      const incrementButton = screen.getByTestId('top-increment')
      fireEvent.press(incrementButton)

      // New ratio: (46-15)/(60-46) = 31/14 ≈ 2.21
      expect(defaultProps.onAnalysisChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ratio: expect.any(Number),
        })
      )
    })
  })

  describe('accessibility', () => {
    it('should have accessible labels for all buttons', () => {
      render(<FrameAdjuster {...defaultProps} />)

      expect(screen.getByLabelText(/increase takeaway frame/i)).toBeTruthy()
      expect(screen.getByLabelText(/decrease takeaway frame/i)).toBeTruthy()
      expect(screen.getByLabelText(/increase top frame/i)).toBeTruthy()
      expect(screen.getByLabelText(/decrease top frame/i)).toBeTruthy()
      expect(screen.getByLabelText(/increase impact frame/i)).toBeTruthy()
      expect(screen.getByLabelText(/decrease impact frame/i)).toBeTruthy()
    })
  })
})
