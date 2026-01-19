// ABOUTME: Hook for managing screen wake lock based on user settings.
// ABOUTME: Uses expo-keep-awake to prevent screen dimming during practice sessions.

import { useEffect, useRef } from 'react'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useSettingsStore } from '../stores/settingsStore'

/**
 * Hook that activates/deactivates screen wake lock based on user settings.
 * When keepScreenAwake setting is enabled, prevents the screen from dimming.
 * Automatically cleans up on unmount.
 */
export function useKeepAwake(): void {
  const keepScreenAwake = useSettingsStore((s) => s.keepScreenAwake)
  const isActiveRef = useRef(false)

  useEffect(() => {
    if (keepScreenAwake && !isActiveRef.current) {
      activateKeepAwakeAsync()
      isActiveRef.current = true
    } else if (!keepScreenAwake && isActiveRef.current) {
      deactivateKeepAwake()
      isActiveRef.current = false
    }

    return () => {
      if (isActiveRef.current) {
        deactivateKeepAwake()
        isActiveRef.current = false
      }
    }
  }, [keepScreenAwake])
}
