// ABOUTME: Hook for tracking app lifecycle state changes.
// ABOUTME: Fires callback when app moves between active, background, and inactive states.

import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'

/**
 * Hook that monitors app state changes and fires a callback when state changes.
 *
 * @param onChange - Callback fired when app state changes (should be memoized)
 *
 * State values:
 * - 'active': App is in foreground
 * - 'background': App is in background
 * - 'inactive': App is transitioning (iOS only)
 */
export function useAppState(onChange: (state: AppStateStatus) => void): void {
  const appStateRef = useRef(AppState.currentState)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current !== nextState) {
        onChangeRef.current(nextState)
        appStateRef.current = nextState
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])
}
