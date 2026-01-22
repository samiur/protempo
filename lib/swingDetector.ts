// ABOUTME: Factory for creating swing detector instances.
// ABOUTME: Selects between ML-based and mock implementations based on availability.

import type { SwingDetector } from '../types/swingDetection'
import { createMockSwingDetector } from './mockSwingDetector'
import { createMLSwingDetector, isMLDetectionAvailable } from './mlSwingDetector'

/**
 * Type of swing detector to create.
 * - 'auto': Automatically select best available (ML if available, mock otherwise)
 * - 'ml': Force ML-based detector
 * - 'mock': Force mock detector (for testing)
 */
export type DetectorType = 'auto' | 'ml' | 'mock'

/**
 * Options for creating a swing detector.
 */
export interface CreateDetectorOptions {
  /** Type of detector to create (default: 'auto') */
  type?: DetectorType
}

/**
 * Create a swing detector instance.
 *
 * By default, uses automatic selection which prefers ML detection
 * when available, falling back to mock implementation otherwise.
 *
 * @param options - Creation options
 * @returns SwingDetector instance ready for initialization
 *
 * @example
 * ```typescript
 * // Auto-select best available detector
 * const detector = createSwingDetector()
 *
 * // Force ML detector
 * const mlDetector = createSwingDetector({ type: 'ml' })
 *
 * // Force mock detector (for testing)
 * const mockDetector = createSwingDetector({ type: 'mock' })
 *
 * await detector.initialize()
 * const result = await detector.detectSwingPhases(videoUri, fps)
 * detector.dispose()
 * ```
 */
export function createSwingDetector(options: CreateDetectorOptions = {}): SwingDetector {
  const { type = 'auto' } = options

  switch (type) {
    case 'ml':
      return createMLSwingDetector()

    case 'mock':
      return createMockSwingDetector()

    case 'auto':
    default:
      // Prefer ML detection when available
      if (isMLDetectionAvailable()) {
        try {
          return createMLSwingDetector()
        } catch (error) {
          // Fall back to mock if ML creation fails
          console.warn('ML detector creation failed, falling back to mock:', error)
          return createMockSwingDetector()
        }
      }
      return createMockSwingDetector()
  }
}

// Re-export for convenience
export { isMLDetectionAvailable }
