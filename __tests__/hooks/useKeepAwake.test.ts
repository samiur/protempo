// ABOUTME: Tests for the useKeepAwake hook that manages screen wake lock.
// ABOUTME: Verifies conditional activation based on user settings.

import { renderHook, act, waitFor } from '@testing-library/react-native'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useSettingsStore } from '../../stores/settingsStore'
import { useKeepAwake } from '../../hooks/useKeepAwake'

// Get mocked functions from global mock
const mockActivateKeepAwake = activateKeepAwakeAsync as jest.Mock
const mockDeactivateKeepAwake = deactivateKeepAwake as jest.Mock

describe('useKeepAwake', () => {
  beforeEach(() => {
    // Reset mocks
    mockActivateKeepAwake.mockClear()
    mockDeactivateKeepAwake.mockClear()
    mockActivateKeepAwake.mockResolvedValue(undefined)

    // Reset settings store to defaults
    useSettingsStore.setState({
      keepScreenAwake: true, // default is true
      _hasHydrated: true,
    })
  })

  it('activates keep awake when setting is enabled', async () => {
    // Setting is enabled by default from beforeEach
    renderHook(() => useKeepAwake())

    await waitFor(() => {
      expect(mockActivateKeepAwake).toHaveBeenCalled()
    })
  })

  it('does not activate keep awake when setting is disabled', async () => {
    // Disable keep screen awake setting
    useSettingsStore.setState({ keepScreenAwake: false })

    renderHook(() => useKeepAwake())

    // Wait a tick and verify it was not called
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(mockActivateKeepAwake).not.toHaveBeenCalled()
  })

  it('deactivates keep awake on unmount when it was active', async () => {
    // Setting is enabled by default
    const { unmount } = renderHook(() => useKeepAwake())

    await waitFor(() => {
      expect(mockActivateKeepAwake).toHaveBeenCalled()
    })

    unmount()

    expect(mockDeactivateKeepAwake).toHaveBeenCalled()
  })

  it('does not deactivate on unmount when it was never activated', async () => {
    // Disable keep screen awake setting
    useSettingsStore.setState({ keepScreenAwake: false })

    const { unmount } = renderHook(() => useKeepAwake())

    // Wait a tick
    await new Promise((resolve) => setTimeout(resolve, 10))

    unmount()

    expect(mockDeactivateKeepAwake).not.toHaveBeenCalled()
  })

  it('responds to setting changes - activates when enabled', async () => {
    // Start with disabled
    useSettingsStore.setState({ keepScreenAwake: false })

    const { rerender } = renderHook(() => useKeepAwake())

    // Wait a tick
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(mockActivateKeepAwake).not.toHaveBeenCalled()

    // Enable the setting
    act(() => {
      useSettingsStore.setState({ keepScreenAwake: true })
    })

    // Re-render to pick up the change
    rerender({})

    await waitFor(() => {
      expect(mockActivateKeepAwake).toHaveBeenCalled()
    })
  })

  it('deactivates when setting is changed to false', async () => {
    // Start with enabled
    const { rerender } = renderHook(() => useKeepAwake())

    await waitFor(() => {
      expect(mockActivateKeepAwake).toHaveBeenCalled()
    })
    mockDeactivateKeepAwake.mockClear()

    // Disable the setting
    act(() => {
      useSettingsStore.setState({ keepScreenAwake: false })
    })

    // Re-render to pick up the change
    rerender({})

    await waitFor(() => {
      expect(mockDeactivateKeepAwake).toHaveBeenCalled()
    })
  })
})
