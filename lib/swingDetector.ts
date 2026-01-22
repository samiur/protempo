// ABOUTME: Factory for creating swing detector instances.
// ABOUTME: Currently returns mock implementation; will support ML in future.

import type { SwingDetector } from '../types/swingDetection'
import { createMockSwingDetector } from './mockSwingDetector'

/**
 * Create a swing detector instance.
 *
 * Currently returns a mock implementation for development.
 * In the future, this will select between mock and ML-based
 * implementations based on availability and settings.
 *
 * @returns SwingDetector instance ready for initialization
 *
 * @example
 * ```typescript
 * const detector = createSwingDetector()
 * await detector.initialize()
 *
 * const result = await detector.detectSwingPhases(videoUri, fps)
 * console.log(`Detected ratio: ${calculateRatio(result)}`)
 *
 * detector.dispose()
 * ```
 */
export function createSwingDetector(): SwingDetector {
  // For now, always use the mock implementation
  // In Prompt 29, we'll add ML implementation selection logic:
  //
  // if (mlSwingDetectorAvailable()) {
  //   try {
  //     return createMLSwingDetector()
  //   } catch (error) {
  //     console.warn('ML detector unavailable, falling back to mock:', error)
  //   }
  // }

  return createMockSwingDetector()
}

/**
 * Check if ML-based swing detection is available.
 * This will be implemented in Prompt 29.
 *
 * @returns true if ML detection is available, false otherwise
 */
export function isMLDetectionAvailable(): boolean {
  // Will check for:
  // - ML model file exists
  // - Device supports required ML operations
  // - Sufficient memory available
  return false
}
