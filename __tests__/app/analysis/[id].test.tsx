// ABOUTME: Tests for the video analysis screen with frame markers and manual adjustment.
// ABOUTME: Tests loading states, analysis display, save flow, and re-analysis trigger.

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native'

import AnalysisScreen from '../../../app/analysis/[id]'
import { videoStorage } from '../../../lib/videoStorage'
import { createSwingDetector } from '../../../lib/swingDetector'
import { SwingVideo } from '../../../types/video'

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'test-video-id' })),
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    replace: jest.fn(),
  })),
  Stack: {
    Screen: () => null,
  },
}))

// Mock video storage
jest.mock('../../../lib/videoStorage', () => ({
  videoStorage: {
    getVideo: jest.fn(),
    updateVideoAnalysis: jest.fn(),
  },
}))

// Mock swing detector
jest.mock('../../../lib/swingDetector', () => ({
  createSwingDetector: jest.fn(),
}))

describe('AnalysisScreen', () => {
  const mockVideo: SwingVideo = {
    id: 'test-video-id',
    uri: 'file:///mock/video.mp4',
    thumbnailUri: 'file:///mock/thumbnail.jpg',
    createdAt: Date.now(),
    duration: 5000,
    fps: 30,
    width: 1920,
    height: 1080,
    analysis: {
      takeawayFrame: 15,
      topFrame: 45,
      impactFrame: 60,
      backswingFrames: 30,
      downswingFrames: 15,
      ratio: 2.0,
      confidence: 0.85,
      manuallyAdjusted: false,
    },
    sessionId: null,
  }

  const mockVideoWithoutAnalysis: SwingVideo = {
    ...mockVideo,
    analysis: null,
  }

  const mockDetector = {
    isReady: jest.fn(() => true),
    initialize: jest.fn().mockResolvedValue(undefined),
    detectSwingPhases: jest.fn().mockResolvedValue({
      takeawayFrame: 15,
      topFrame: 45,
      impactFrame: 60,
      confidence: 0.85,
      processingTimeMs: 500,
    }),
    dispose: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(videoStorage.getVideo as jest.Mock).mockResolvedValue(mockVideo)
    ;(createSwingDetector as jest.Mock).mockReturnValue(mockDetector)
  })

  describe('loading state', () => {
    it('should show loading indicator while fetching video', () => {
      ;(videoStorage.getVideo as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<AnalysisScreen />)

      expect(screen.getByTestId('analysis-loading')).toBeTruthy()
    })

    it('should show loading text', () => {
      ;(videoStorage.getVideo as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<AnalysisScreen />)

      expect(screen.getByText(/loading/i)).toBeTruthy()
    })
  })

  describe('not found state', () => {
    it('should show not found message when video does not exist', async () => {
      ;(videoStorage.getVideo as jest.Mock).mockResolvedValue(null)

      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('analysis-not-found')).toBeTruthy()
      })
    })

    it('should show go back button on not found', async () => {
      ;(videoStorage.getVideo as jest.Mock).mockResolvedValue(null)

      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByText(/go back/i)).toBeTruthy()
      })
    })
  })

  describe('video with existing analysis', () => {
    it('should render the analysis screen container', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('analysis-screen')).toBeTruthy()
      })
    })

    it('should render the video player', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('video-player')).toBeTruthy()
      })
    })

    it('should render analysis results', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('analysis-results')).toBeTruthy()
      })
    })

    it('should render frame adjuster', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('frame-adjuster')).toBeTruthy()
      })
    })

    it('should render tempo comparison', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('tempo-comparison')).toBeTruthy()
      })
    })

    it('should pass frame markers to video player', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        // Should have markers for takeaway, top, and impact
        expect(screen.getByTestId('marker-0')).toBeTruthy()
        expect(screen.getByTestId('marker-1')).toBeTruthy()
        expect(screen.getByTestId('marker-2')).toBeTruthy()
      })
    })
  })

  describe('video without analysis', () => {
    beforeEach(() => {
      ;(videoStorage.getVideo as jest.Mock).mockResolvedValue(mockVideoWithoutAnalysis)
    })

    it('should show analyze button when no analysis exists', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('analyze-button')).toBeTruthy()
      })
    })

    it('should run analysis when analyze button is pressed', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('analyze-button')).toBeTruthy()
      })

      fireEvent.press(screen.getByTestId('analyze-button'))

      await waitFor(() => {
        expect(mockDetector.initialize).toHaveBeenCalled()
        expect(mockDetector.detectSwingPhases).toHaveBeenCalledWith(
          mockVideoWithoutAnalysis.uri,
          mockVideoWithoutAnalysis.fps
        )
      })
    })

    it('should show analyzing indicator during detection', async () => {
      mockDetector.detectSwingPhases.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )

      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('analyze-button')).toBeTruthy()
      })

      fireEvent.press(screen.getByTestId('analyze-button'))

      await waitFor(() => {
        expect(screen.getByText(/analyzing/i)).toBeTruthy()
      })
    })
  })

  describe('manual frame adjustment', () => {
    it('should update analysis when frame is adjusted', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('frame-adjuster')).toBeTruthy()
      })

      // Adjust takeaway frame
      const incrementButton = screen.getByTestId('takeaway-increment')
      fireEvent.press(incrementButton)

      // The analysis should be updated
      await waitFor(() => {
        expect(screen.getByText('16')).toBeTruthy() // New takeaway frame
      })
    })

    it('should enable save button after manual adjustment', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('frame-adjuster')).toBeTruthy()
      })

      // Initially save button should be disabled or hidden
      // After adjustment, it should be enabled
      const incrementButton = screen.getByTestId('takeaway-increment')
      fireEvent.press(incrementButton)

      await waitFor(() => {
        const saveButton = screen.getByTestId('save-button')
        expect(saveButton.props.accessibilityState?.disabled).toBeFalsy()
      })
    })
  })

  describe('save functionality', () => {
    it('should save analysis when save button is pressed', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('frame-adjuster')).toBeTruthy()
      })

      // Make an adjustment first
      const incrementButton = screen.getByTestId('takeaway-increment')
      fireEvent.press(incrementButton)

      // Press save
      const saveButton = screen.getByTestId('save-button')
      fireEvent.press(saveButton)

      await waitFor(() => {
        expect(videoStorage.updateVideoAnalysis).toHaveBeenCalledWith(
          'test-video-id',
          expect.objectContaining({
            takeawayFrame: 16,
            manuallyAdjusted: true,
          })
        )
      })
    })

    it('should show success message after save', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('frame-adjuster')).toBeTruthy()
      })

      // Make an adjustment
      const incrementButton = screen.getByTestId('takeaway-increment')
      fireEvent.press(incrementButton)

      // Press save
      const saveButton = screen.getByTestId('save-button')
      fireEvent.press(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/saved/i)).toBeTruthy()
      })
    })
  })

  describe('re-analyze functionality', () => {
    it('should trigger re-analysis when auto detect is pressed', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('auto-detect-button')).toBeTruthy()
      })

      fireEvent.press(screen.getByTestId('auto-detect-button'))

      await waitFor(() => {
        expect(mockDetector.detectSwingPhases).toHaveBeenCalled()
      })
    })
  })

  describe('navigation', () => {
    it('should render back button', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByTestId('back-button')).toBeTruthy()
      })
    })
  })

  describe('accessibility', () => {
    it('should have accessible screen title', async () => {
      render(<AnalysisScreen />)

      await waitFor(() => {
        expect(screen.getByText(/swing analysis/i)).toBeTruthy()
      })
    })
  })
})
