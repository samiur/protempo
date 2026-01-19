// ABOUTME: Tests for the useAppState hook that tracks app lifecycle state.
// ABOUTME: Verifies callback firing on state changes (active, background, inactive).

import { renderHook, act } from '@testing-library/react-native'
import { AppState, AppStateStatus } from 'react-native'

// Store the actual listener callback so we can trigger it in tests
let appStateListener: ((state: AppStateStatus) => void) | null = null
const mockAddEventListener = jest.fn((event, callback) => {
  if (event === 'change') {
    appStateListener = callback
  }
  return { remove: jest.fn() }
})

// Mock React Native's AppState
jest.spyOn(AppState, 'addEventListener').mockImplementation(mockAddEventListener)

// Import after mock setup
import { useAppState } from '../../hooks/useAppState'

describe('useAppState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    appStateListener = null
  })

  it('sets up AppState listener on mount', () => {
    const onChange = jest.fn()

    renderHook(() => useAppState(onChange))

    expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('fires callback when app state changes to background', () => {
    const onChange = jest.fn()

    renderHook(() => useAppState(onChange))

    // Simulate app going to background
    act(() => {
      if (appStateListener) {
        appStateListener('background')
      }
    })

    expect(onChange).toHaveBeenCalledWith('background')
  })

  it('fires callback when app state changes to active', () => {
    const onChange = jest.fn()

    renderHook(() => useAppState(onChange))

    // Simulate app becoming active
    act(() => {
      if (appStateListener) {
        appStateListener('active')
      }
    })

    expect(onChange).toHaveBeenCalledWith('active')
  })

  it('fires callback when app state changes to inactive', () => {
    const onChange = jest.fn()

    renderHook(() => useAppState(onChange))

    // Simulate app becoming inactive (iOS only, when transitioning)
    act(() => {
      if (appStateListener) {
        appStateListener('inactive')
      }
    })

    expect(onChange).toHaveBeenCalledWith('inactive')
  })

  it('does not fire callback when state remains the same', () => {
    const onChange = jest.fn()

    renderHook(() => useAppState(onChange))

    // Simulate multiple 'active' states (no change)
    act(() => {
      if (appStateListener) {
        appStateListener('active')
        appStateListener('active')
        appStateListener('active')
      }
    })

    // Should only be called once for the first change from initial state
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('removes listener on unmount', () => {
    const onChange = jest.fn()
    const mockRemove = jest.fn()

    mockAddEventListener.mockReturnValueOnce({ remove: mockRemove })

    const { unmount } = renderHook(() => useAppState(onChange))

    unmount()

    expect(mockRemove).toHaveBeenCalled()
  })

  it('tracks state changes correctly across multiple transitions', () => {
    const onChange = jest.fn()

    renderHook(() => useAppState(onChange))

    // Simulate: active -> background -> active
    act(() => {
      if (appStateListener) {
        appStateListener('background')
      }
    })
    expect(onChange).toHaveBeenLastCalledWith('background')

    act(() => {
      if (appStateListener) {
        appStateListener('active')
      }
    })
    expect(onChange).toHaveBeenLastCalledWith('active')

    expect(onChange).toHaveBeenCalledTimes(2)
  })
})
