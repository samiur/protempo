// ABOUTME: Jest setup file for global test configuration.
// ABOUTME: Mocks native modules that aren't available in the test environment.

// Mock AsyncStorage globally
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock expo-av module globally (deprecated, but kept for backward compatibility)
jest.mock('expo-av', () => {
  const mockSound = {
    playAsync: jest.fn().mockResolvedValue(undefined),
    setPositionAsync: jest.fn().mockResolvedValue(undefined),
    setVolumeAsync: jest.fn().mockResolvedValue(undefined),
    unloadAsync: jest.fn().mockResolvedValue(undefined),
  }

  return {
    Audio: {
      Sound: {
        createAsync: jest.fn().mockResolvedValue({ sound: mockSound }),
      },
      setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    },
  }
})

// Mock @react-native-community/slider
jest.mock('@react-native-community/slider', () => {
  const React = require('react')
  const { View } = require('react-native')

  return {
    __esModule: true,
    default: (props) => {
      return React.createElement(View, {
        testID: props.testID,
        accessibilityRole: props.accessibilityRole || 'adjustable',
        accessibilityLabel: props.accessibilityLabel,
        minimumValue: props.minimumValue,
        maximumValue: props.maximumValue,
        step: props.step,
        value: props.value,
        disabled: props.disabled,
        onValueChange: props.onValueChange,
      })
    },
  }
})

// Mock expo-keep-awake module globally
jest.mock('expo-keep-awake', () => ({
  activateKeepAwakeAsync: jest.fn().mockResolvedValue(undefined),
  deactivateKeepAwake: jest.fn(),
  useKeepAwake: jest.fn(),
}))

// Mock expo-audio module globally
jest.mock('expo-audio', () => {
  const mockPlayer = {
    id: 1,
    playing: false,
    muted: false,
    loop: false,
    paused: false,
    isLoaded: true,
    isAudioSamplingSupported: false,
    isBuffering: false,
    currentTime: 0,
    duration: 1,
    volume: 1,
    playbackRate: 1,
    shouldCorrectPitch: false,
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    seekTo: jest.fn().mockResolvedValue(undefined),
    setPlaybackRate: jest.fn(),
    remove: jest.fn(),
  }

  return {
    useAudioPlayer: jest.fn(() => ({ ...mockPlayer })),
    useAudioPlayerStatus: jest.fn(() => ({
      playing: false,
      isLoaded: true,
      isBuffering: false,
      currentTime: 0,
      duration: 1,
    })),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    setIsAudioActiveAsync: jest.fn().mockResolvedValue(undefined),
    createAudioPlayer: jest.fn(() => ({ ...mockPlayer })),
  }
})

// Also update the __mocks__/expo-audio mock if tests import it directly
